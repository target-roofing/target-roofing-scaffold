'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { ADMIN_SECTIONS } from './nav'
import { AddToolIcon } from './icons'
import {useConsoleHref} from './ConsoleContext'

/** localStorage key that marks the guide as seen in this browser. Bump the suffix to show it again after big changes. */
export const WELCOME_SEEN_KEY = 'tr-admin-welcome-v1'

export function hasSeenWelcome(): boolean {
  try { return window.localStorage.getItem(WELCOME_SEEN_KEY) === '1' } catch { return true }
}

export function markWelcomeSeen() {
  try { window.localStorage.setItem(WELCOME_SEEN_KEY, '1') } catch { /* private window: show again next time */ }
}

/** First-visit guide: what each admin page does and what it is good for. */
export default function AdminWelcome({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const href=useConsoleHref()

  useEffect(() => {
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pages = ADMIN_SECTIONS.filter((s) => s.label !== 'Build')

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button aria-label="Close guide" tabIndex={-1} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="admin-welcome-title"
        className="relative flex outline-none max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="relative flex items-start gap-4 bg-[var(--black)] px-6 py-6 text-white sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/reticle-white-small.svg" alt="" className="h-12 w-12 shrink-0" />
          <div className="pr-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Target Roofing Admin</p>
            <h2 id="admin-welcome-title" className="mt-1 text-xl font-bold uppercase tracking-tight font-[family-name:var(--font-display)] sm:text-2xl">Welcome. Here is what each page does.</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-white/65">Everything below is in the left sidebar. You can open this guide again any time from the bottom of the sidebar.</p>
          </div>
          <button onClick={onClose} aria-label="Close guide"
            className="absolute right-4 top-4 rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          {pages.map((section) => (
            <section key={section.label} className="mb-7 last:mb-0">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gray-500)]">{section.label}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={href(item.href)} onClick={onClose}
                      className="group flex gap-4 rounded-xl border border-[var(--gray-200)] p-4 transition hover:border-[var(--red)] hover:shadow-sm">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[var(--red)]">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--black)]">
                          {item.label}
                          <ArrowRight className="h-3.5 w-3.5 text-[var(--gray-400)] transition group-hover:translate-x-0.5 group-hover:text-[var(--red)]" />
                        </span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-[var(--gray-600)]">{item.summary}</span>
                        <span className="mt-2 block text-[12px] leading-relaxed text-[var(--gray-500)]"><span className="font-bold uppercase tracking-wider text-[10px] text-[var(--red)]">Good for</span> {item.goodFor}</span>
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}

          <Link href={href("/admin/build")} onClick={onClose}
            className="mt-7 flex flex-col gap-4 rounded-xl bg-[var(--black)] p-5 text-white sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--red)]"><AddToolIcon className="h-6 w-6" /></span>
            <span className="flex-1">
              <span className="block text-sm font-bold">Casey, want to add your own tools?</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-white/65">The Add a Tool page has a brief you can paste straight into ChatGPT or Claude. It catches them up on how this site is built, so they can help you build new features here or on your own targetroofers.com subdomain.</span>
            </span>
            <span className="inline-flex items-center gap-1.5 self-start rounded-lg bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--black)] sm:self-center">Add a Tool <ArrowRight className="h-3.5 w-3.5" /></span>
          </Link>
        </div>

        <div className="flex items-center justify-end border-t border-[var(--gray-100)] px-6 py-4 sm:px-8">
          <button onClick={onClose} className="inline-flex items-center justify-center rounded-lg bg-[var(--red)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[var(--red-dark)]">Got it</button>
        </div>
      </div>
    </div>
  )
}
