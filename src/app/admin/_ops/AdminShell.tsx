'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { LogOut, Menu } from 'lucide-react'
import { logoutAdmin } from '@/app/actions'
import {ConsoleSurfaceContext,useConsoleHref,type ConsoleSurface} from './ConsoleContext'
import {consolePathname} from '@/lib/ops/console-paths.mjs'
import { ADMIN_SECTIONS } from './nav'
import { AddToolIcon, GuideIcon } from './icons'
import AdminWelcome, { hasSeenWelcome, markWelcomeSeen } from './AdminWelcome'

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = consolePathname(usePathname())
  const href=useConsoleHref()
  const params = useSearchParams()
  const tab = params.get('tab') || 'leads'
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {ADMIN_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{section.label}</p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = item.match.startsWith('/') ? pathname.startsWith(item.match) : pathname === '/admin' && tab === item.match
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link href={href(item.href)} onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors ${active ? 'bg-[var(--red)] text-white shadow' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                    <Icon className="h-5 w-5 shrink-0" />{item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      <div>
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Office tools</p>
        <a href="/office/admin" onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white">
          <AddToolIcon className="h-5 w-5 shrink-0" />Tools &amp; Access
        </a>
      </div>
    </nav>
  )
}

export default function AdminShell({ email, children,surface='console' }: { email: string; children: React.ReactNode;surface?:ConsoleSurface }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const logout = async () => { await logoutAdmin(); router.refresh() }

  // First visit in this browser: open the guide once the console has painted.
  useEffect(() => {
    if (hasSeenWelcome()) return
    const t = setTimeout(() => setGuideOpen(true), 350)
    return () => clearTimeout(t)
  }, [])

  const closeGuide = useCallback(() => { markWelcomeSeen(); setGuideOpen(false) }, [])
  const showGuide = () => { setOpen(false); setGuideOpen(true) }

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col bg-[var(--black)] text-white">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logos/reticle-white-small.svg" alt="" className="h-10 w-10 shrink-0" />
        <div>
          <p className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-display)]">Target Roofing</p>
          <p className="text-[10px] text-white/50 font-semibold">{surface==='office'?'Office · Admin tools':'Administrative Console'}</p>
        </div>
      </div>
      <a href="/office" className="mx-4 mt-3 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10">← My Office tools</a>
      <Suspense fallback={<div className="flex-1" />}><Nav onNavigate={onNavigate} /></Suspense>
      <div className="border-t border-white/10 px-4 py-4">
        <button onClick={showGuide}
          className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-white/70 hover:bg-white/10 hover:text-white">
          <GuideIcon className="h-5 w-5 shrink-0" />Admin Guide
        </button>
        {surface==='office'&&<a className="mb-3 block text-xs text-white/70 underline" href="/admin">Open full admin console</a>}
        <p className="text-[10px] text-white/40 truncate mb-2">{email}</p>
        <button onClick={logout} className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-[var(--red)]">
          <LogOut className="h-4 w-4" />Log Out
        </button>
      </div>
    </div>
  )

  return (
    <ConsoleSurfaceContext.Provider value={surface}><div className="fixed inset-0 z-[100] flex bg-[var(--gray-50)]">
      <aside className="hidden lg:block w-64 shrink-0">{sidebar()}</aside>
      {open && (
        <div className="lg:hidden fixed inset-0 z-[110] flex">
          <div className="w-72 max-w-[85vw]">{sidebar(() => setOpen(false))}</div>
          <button aria-label="Close menu" className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between bg-[var(--black)] text-white px-4 py-3">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-2 -ml-2"><Menu className="h-5 w-5" /></button>
          <span className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-display)]">{surface==='office'?'Admin tools':'Target Admin'}</span>
          <a href="/office" className="text-xs font-semibold text-white/80">Office</a>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>
      {guideOpen && <AdminWelcome onClose={closeGuide} />}
    </div></ConsoleSurfaceContext.Provider>
  )
}
