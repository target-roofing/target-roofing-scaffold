import type { Metadata } from 'next'
import {cookies,headers} from 'next/headers'
import {redirect} from 'next/navigation'
import { getAdminSession } from '@/lib/ops/session'
import {officeSessionCookies} from '@/lib/ops/office-admin-client.mjs'
import {consoleHref} from '@/lib/ops/console-paths.mjs'
import AdminLogin from './_ops/AdminLogin'
import AdminShell from './_ops/AdminShell'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h=await headers()
  const surface=h.get('x-tr-console-surface')==='office'?'office':'console'
  const path=h.get('x-tr-console-path')||'/admin'
  const session = await getAdminSession()
  const googleLogin='/office/login?'+new URLSearchParams({next:consoleHref(path,'office')})
  if(surface==='office'&&session?.source!=='office') {
    const jar=await cookies()
    if(!officeSessionCookies(jar.getAll().map(c=>c.name+'='+c.value).join('; ')))redirect(googleLogin)
    return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--gray-50)] p-6"><section className="max-w-md rounded-xl bg-white p-8 shadow-xl"><h1 className="text-2xl font-bold">Admin tools</h1><p className="my-4">Your Office access could not be verified for this console.</p><a className="mr-4 font-bold text-[var(--red)]" href="/office">Return to Office</a><a className="font-bold text-[var(--red)]" href={googleLogin}>Sign in again</a></section></div>
  }
  if (!session) return <AdminLogin googleLogin={googleLogin}/>
  return <AdminShell email={session.email} surface={surface}>{children}</AdminShell>
}
