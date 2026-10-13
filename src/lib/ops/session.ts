import 'server-only'
import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'
import {cache} from 'react'
import {officeSessionCookies,resolveAdminSession} from './office-admin-client.mjs'

// Signed admin session cookie. Replaces the old client-state-only login so every
// admin route (sidebar pages, uploads, server actions) can check the same session.
export const ADMIN_COOKIE = 'tr_admin'
const MAX_AGE_S = 60 * 60 * 24 * 30

function secret() {
  return process.env.ADMIN_SESSION_SECRET || `tr-admin:${process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev'}`
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function mintSessionValue(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + MAX_AGE_S * 1000 })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function readSessionValue(value: string | undefined | null): { email: string } | null {
  if (!value) return null
  const [payload, sig] = value.split('.')
  if (!payload || !sig) return null
  const expected = sign(payload)
  const a = Buffer.from(sig), b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (typeof data.x !== 'number' || data.x < Date.now()) return null
    return { email: String(data.e) }
  } catch { return null }
}

export const getAdminSession = cache(async () => {
  const jar = await cookies()
  return resolveAdminSession({cookieHeader:jar.getAll().map(c=>c.name+'='+c.value).join('; '),officeOrigin:process.env.OFFICE_BACKEND_ORIGIN,legacySession:readSessionValue(jar.get(ADMIN_COOKIE)?.value)})
})

export async function setAdminSession(email: string) {
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, mintSessionValue(email), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: MAX_AGE_S })
}

export async function clearAdminSession() {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
  const officeCookies=officeSessionCookies(jar.getAll().map(c=>c.name+'='+c.value).join('; '))
  for(const part of officeCookies.split('; ').filter(Boolean))jar.set(part.slice(0,part.indexOf('=')),'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0})
}

export async function requireAdmin() {
  const s = await getAdminSession()
  if (!s) throw new Error('Not signed in')
  return s
}
