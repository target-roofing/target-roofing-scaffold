'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {useConsoleHref} from '@/app/admin/_ops/ConsoleContext'
import ReactMarkdown from 'react-markdown'
import { createClient } from '@supabase/supabase-js'
import { Calendar, Check, CheckCircle2, Circle, Copy, ExternalLink, Heart, Loader2, Mic, Plus, Rss, Sparkles, ThumbsDown, Upload, HelpCircle } from 'lucide-react'
import nameOptions from '@/data/podcast-name-options.json'
import { opsListMembers } from '../_ops/actions'
import { podAttachAudio, podChooseName, podGetState, podSaveEpisode, podSignAudioUpload, podUpdateSettings, podVote } from '../_ops/podcast-actions'
import { Card, PageHeader, Pill, btnGhost, btnPrimary, fmtDate, inputCls } from '../_ops/ui'
import type { Member } from '@/lib/ops/tasks'
import type { Episode } from '@/lib/ops/podcast'

type NameOption = { rank: number; name: string; slug: string; tagline: string; why: string; logo: string; logo_full: string; collision_check?: string; audit: { cheesiness: number; stretch: number; memorability: number; sayability: number; fit: number; auditor_note: string } }
type State = Awaited<ReturnType<typeof podGetState>>
const OPTIONS = nameOptions as NameOption[]
const browserDb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rciyoqdtejxcjqnvbsoi.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'x')

const PIPELINE = [
  { title: 'Plan', body: 'Topics come from Casey, the topic bank below, and past meetings. Each episode gets a run of show and prep tasks for each host.' },
  { title: 'Record', body: 'Casey and Darian in Casey\'s office on the RODECaster, Winston remote. Record each person on their own track, plus video if cameras are rolling.' },
  { title: 'Upload', body: 'Drop the final or raw audio on the episode below. It is stored with the show and gets a public link for the feed.' },
  { title: 'Draft', body: 'One click listens to the episode and drafts title options, the description, show notes, chapters, and the best 15-60 second clips.' },
  { title: 'Produce', body: 'Winston\'s production pipeline handles cleanup, loudness, the intro, cover art, the YouTube video, and vertical clips for social.' },
  { title: 'Publish', body: 'Mark it published and it appears in the RSS feed. Apple Podcasts, Spotify and YouTube Music pick it up from there on their own.' },
]

export default function PodcastPage() {
  const href=useConsoleHref()
  const [state, setState] = useState<State | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [voter, setVoter] = useState('')
  const [epOpen, setEpOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    try {
      const [s, m] = await Promise.all([podGetState(), opsListMembers()])
      setState(s); setMembers(m)
      setEpOpen((prev) => prev ?? (s.episodes[0] as Episode | undefined)?.id ?? null)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }, [])
  useEffect(() => { load(); try { setVoter(localStorage.getItem('tr_voter') || '') } catch {} }, [load])

  const tally = useMemo(() => {
    const t: Record<string, { love: string[]; maybe: string[]; no: string[]; score: number }> = {}
    for (const o of OPTIONS) t[o.slug] = { love: [], maybe: [], no: [], score: 0 }
    for (const v of state?.votes || []) {
      const n = members.find((m) => m.id === v.voter_id)?.name.split(' ')[0] || '?'
      const row = t[v.option_slug]; if (!row) continue
      row[v.vote as 'love' | 'maybe' | 'no'].push(n); row.score += v.vote === 'love' ? 2 : v.vote === 'maybe' ? 1 : -1
    }
    return t
  }, [state, members])

  const myVote = (slug: string) => state?.votes.find((v) => v.option_slug === slug && v.voter_id === voter)?.vote
  const vote = async (slug: string, v: 'love' | 'maybe' | 'no') => {
    if (!voter) { setError('Pick who is voting first.'); return }
    await podVote(slug, voter, myVote(slug) === v ? null : v); await load()
  }
  const choose = async (o: NameOption | null) => { await podChooseName(o?.slug || null, o?.name || null, o?.logo_full || null); await load() }

  const feedUrl = typeof window !== 'undefined' ? `${window.location.origin}/podcast/feed.xml` : '/podcast/feed.xml'
  const settings = state?.settings
  const episodes = (state?.episodes || []) as Episode[]
  const podTasks = state?.tasks || []
  const nextEp = episodes.find((e) => e.status !== 'published')

  const addEpisode = async () => {
    const n = Math.max(0, ...episodes.map((e) => e.number || 0)) + 1
    const ep = await podSaveEpisode({ number: n, title: `Episode ${n}`, status: 'planning' })
    await load(); setEpOpen(ep.id)
  }
  const saveEp = async (ep: Partial<Episode> & { id: string; title: string }) => {
    setError(null)
    try { await podSaveEpisode(ep as never); await load() } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  const upload = async (ep: Episode, file: File) => {
    setError(null); setBusy(`Uploading ${file.name}...`)
    try {
      const signed = await podSignAudioUpload(ep.id, file.name)
      const up = await browserDb().storage.from('podcast').uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || 'audio/mpeg' })
      if (up.error) throw new Error(up.error.message)
      await podAttachAudio(ep.id, signed.path, file.type || 'audio/mpeg', file.size)
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    setBusy(null)
  }
  const draft = async (ep: Episode) => {
    setError(null); setBusy('Listening to the episode and drafting notes, chapters and clips. This takes a few minutes for a full episode...')
    const r = await fetch(`/api/podcast/episodes/${ep.id}/notes`, { method: 'POST' })
    const j = await r.json().catch(() => ({}))
    if (!j.ok) setError(j.error || 'Drafting failed')
    await load(); setBusy(null)
  }

  if (!state) return <p className="text-sm text-[var(--gray-400)]">{error || 'Loading...'}</p>
  const chosen = OPTIONS.find((o) => o.slug === settings?.chosen_option_slug)

  return (
    <div>
      <PageHeader title="Podcast" subtitle="Everything for the Target podcast in one place: the name and logo decision, the first episode plan, who owes what before recording, and production through to Apple, Spotify and YouTube.">
        <a className={btnGhost} href="/podcast/feed.xml" target="_blank" rel="noreferrer"><Rss className="h-3.5 w-3.5" />RSS feed</a>
      </PageHeader>
      {error && <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
      {busy && <div className="mb-4 flex items-center gap-2 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-xs font-semibold text-amber-800"><Loader2 className="h-4 w-4 animate-spin" />{busy}</div>}

      {nextEp && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[var(--black)] px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--red)]"><Mic className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Next recording</p>
              <p className="text-lg font-bold font-[family-name:var(--font-display)] uppercase">{nextEp.title}</p>
              <p className="text-sm text-white/70">{nextEp.record_date ? fmtDate(nextEp.record_date, true) : 'Date not set'} · Casey and Darian in the office, Winston remote</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Show name</p>
            <p className="font-bold">{settings?.show_name || 'Not chosen yet'}</p>
          </div>
        </div>
      )}

      {/* ── Names and logos ── */}
      <Card className="mb-6" title="Name and logo options" right={
        <select className="rounded-lg border border-[var(--gray-200)] px-2 py-1 text-xs" value={voter} onChange={(e) => { setVoter(e.target.value); try { localStorage.setItem('tr_voter', e.target.value) } catch {} }}>
          <option value="">I am voting as...</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>}>
        {OPTIONS.length === 0 ? <p className="text-sm text-[var(--gray-500)]">Name and logo options are being generated.</p> : (
          <>
            <p className="mb-4 text-sm text-[var(--gray-600)]">Ten names that survived an adversarial audit. Every candidate was scored by a separate AI acting as a harsh brand strategist, and anything cheesy, punny, or a stretch was thrown out and replaced until ten were left. Vote with the heart, the question mark, or the thumbs down. When everyone agrees, press <b>Choose this name</b>.</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...OPTIONS].sort((a, b) => (tally[b.slug]?.score || 0) - (tally[a.slug]?.score || 0) || a.rank - b.rank).map((o) => {
                const t = tally[o.slug]; const mine = myVote(o.slug); const isChosen = chosen?.slug === o.slug
                return (
                  <div key={o.slug} className={`overflow-hidden rounded-xl border bg-white ${isChosen ? 'border-[var(--red)] ring-2 ring-[var(--red)]' : 'border-[var(--gray-200)]'}`}>
                    <a href={o.logo_full} target="_blank" rel="noreferrer" className="block aspect-square bg-[var(--gray-100)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.logo} alt={`${o.name} logo option`} className="h-full w-full object-cover" loading="lazy" />
                    </a>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[var(--black)]">{o.name}</p>
                        {isChosen && <Pill tone="red">Chosen</Pill>}
                      </div>
                      <p className="text-sm text-[var(--gray-600)]">{o.tagline}</p>
                      <p className="mt-2 text-xs text-[var(--gray-500)]">{o.why}</p>
                      <details className="mt-2 text-[11px] text-[var(--gray-500)]">
                        <summary className="cursor-pointer font-semibold">Audit scores</summary>
                        <p className="mt-1">Not cheesy {o.audit.cheesiness}/10 · Not a stretch {o.audit.stretch}/10 · Memorable {o.audit.memorability}/10 · Easy to say {o.audit.sayability}/10 · Fit {o.audit.fit}/10</p>
                        <p className="mt-1 italic">{o.audit.auditor_note}</p>
                      </details>
                      <div className="mt-3 flex items-center gap-1.5">
                        <button title="Love it" onClick={() => vote(o.slug, 'love')} className={`rounded-lg border p-2 ${mine === 'love' ? 'border-[var(--red)] bg-red-50 text-[var(--red)]' : 'border-[var(--gray-200)] text-[var(--gray-400)]'}`}><Heart className="h-4 w-4" /></button>
                        <button title="Maybe" onClick={() => vote(o.slug, 'maybe')} className={`rounded-lg border p-2 ${mine === 'maybe' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-[var(--gray-200)] text-[var(--gray-400)]'}`}><HelpCircle className="h-4 w-4" /></button>
                        <button title="No" onClick={() => vote(o.slug, 'no')} className={`rounded-lg border p-2 ${mine === 'no' ? 'border-[var(--gray-600)] bg-[var(--gray-100)] text-[var(--gray-700)]' : 'border-[var(--gray-200)] text-[var(--gray-400)]'}`}><ThumbsDown className="h-4 w-4" /></button>
                        <div className="ml-1 min-w-0 flex-1 text-[11px] text-[var(--gray-500)] truncate">
                          {t.love.length > 0 && <span className="text-[var(--red)]">♥ {t.love.join(', ')} </span>}
                          {t.maybe.length > 0 && <span>? {t.maybe.join(', ')} </span>}
                          {t.no.length > 0 && <span>✕ {t.no.join(', ')}</span>}
                        </div>
                      </div>
                      <button onClick={() => choose(isChosen ? null : o)} className={`${isChosen ? btnGhost : btnPrimary} mt-3 w-full`}>{isChosen ? 'Undo choice' : 'Choose this name'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* ── Prep tasks ── */}
        <Card title="Before we record" className="lg:col-span-1" right={<Link href={href("/admin/tasks")} className="text-xs font-bold text-[var(--red)] underline">All tasks</Link>}>
          {podTasks.length === 0 ? <p className="text-sm text-[var(--gray-500)]">No podcast tasks yet.</p> : (
            <div className="space-y-4">
              {members.filter((m) => podTasks.some((t) => t.assignee_id === m.id)).concat(podTasks.some((t) => !t.assignee_id) ? [{ id: '', name: 'Unassigned' } as Member] : []).map((m) => (
                <div key={m.id || 'none'}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-400)]">{m.name}</p>
                  <ul className="space-y-1.5">
                    {podTasks.filter((t) => (t.assignee_id || '') === m.id).map((t) => (
                      <li key={t.id} className="flex items-start gap-2 text-sm">
                        {t.status === 'done' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gray-300)]" />}
                        <span className={t.status === 'done' ? 'text-[var(--gray-400)] line-through' : 'text-[var(--black)]'}>{t.title}{t.due_date && <span className="ml-1 text-[11px] text-[var(--gray-400)]">· {fmtDate(t.due_date)}</span>}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── Pipeline ── */}
        <Card title="How an episode gets made" className="lg:col-span-2">
          <ol className="grid gap-4 sm:grid-cols-2">
            {PIPELINE.map((p, i) => (
              <li key={p.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--black)] text-xs font-bold text-white">{i + 1}</span>
                <div><p className="text-sm font-bold text-[var(--black)]">{p.title}</p><p className="text-xs text-[var(--gray-600)]">{p.body}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-lg bg-[var(--gray-50)] p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Distribution</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <code className="rounded bg-white px-2 py-1 border border-[var(--gray-200)]">{feedUrl}</code>
              <button className={btnGhost} onClick={() => { navigator.clipboard.writeText(feedUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }}><Copy className="h-3.5 w-3.5" />{copied ? 'Copied' : 'Copy feed'}</button>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-[var(--gray-600)]">
              {[
                { k: 'apple_url', label: 'Apple Podcasts', how: 'Submit the feed in Apple Podcasts Connect once the name is chosen and episode 1 is published.' },
                { k: 'spotify_url', label: 'Spotify', how: 'Add the feed in Spotify for Creators. Video episodes can be uploaded there directly.' },
                { k: 'youtube_url', label: 'YouTube', how: 'Full episode video plus Shorts from the clip ideas. YouTube Music can also read the RSS feed.' },
              ].map((p) => {
                const url = (settings as Record<string, string> | null)?.[p.k]
                return (
                  <li key={p.k} className="flex flex-wrap items-center gap-2">
                    {url ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-[var(--gray-300)]" />}
                    <b className="text-[var(--black)]">{p.label}</b>
                    {url ? <a href={url} target="_blank" rel="noreferrer" className="text-[var(--red)] underline inline-flex items-center gap-1">Open <ExternalLink className="h-3 w-3" /></a> : <span>{p.how}</span>}
                    <button className="text-[var(--gray-400)] underline" onClick={async () => { const v = prompt(`${p.label} show URL`, url || ''); if (v !== null) { await podUpdateSettings({ [p.k]: v || null }); await load() } }}>{url ? 'edit' : 'add link'}</button>
                  </li>
                )
              })}
            </ul>
          </div>
        </Card>
      </div>

      {/* ── Episodes ── */}
      <Card title="Episodes" right={<button className={btnGhost} onClick={addEpisode}><Plus className="h-3.5 w-3.5" />New episode</button>}>
        <div className="mb-4 flex flex-wrap gap-2">
          {episodes.map((e) => (
            <button key={e.id} onClick={() => setEpOpen(e.id)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${epOpen === e.id ? 'bg-[var(--black)] text-white' : 'border border-[var(--gray-200)] bg-white text-[var(--gray-600)]'}`}>
              {e.number ? `Ep ${e.number}` : 'Episode'} · {e.status}
            </button>
          ))}
        </div>
        {episodes.filter((e) => e.id === epOpen).map((ep) => (
          <div key={ep.id} className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <input className={`${inputCls} sm:col-span-3 font-semibold`} defaultValue={ep.title} onBlur={(e) => e.target.value !== ep.title && saveEp({ id: ep.id, title: e.target.value })} />
                <label className="text-[11px] font-bold uppercase text-[var(--gray-500)] sm:col-span-2"><span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Record date</span>
                  <input className={inputCls} type="datetime-local" defaultValue={ep.record_date ? new Date(new Date(ep.record_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(e) => saveEp({ id: ep.id, title: ep.title, record_date: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </label>
                <label className="text-[11px] font-bold uppercase text-[var(--gray-500)]">Status
                  <select className={inputCls} value={ep.status} onChange={(e) => saveEp({ id: ep.id, title: ep.title, status: e.target.value })}>
                    {['planning', 'recorded', 'editing', 'ready', 'published'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              {ep.plan && (
                <div className="rounded-lg border border-[var(--gray-200)] p-5">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Run of show</p>
                  <div className="prose prose-sm max-w-none text-[var(--gray-700)] [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-[var(--black)] [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-0.5 [&_p]:my-1.5"><ReactMarkdown>{ep.plan}</ReactMarkdown></div>
                </div>
              )}
              {ep.show_notes && (
                <div className="rounded-lg border border-[var(--gray-200)] p-5">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Show notes draft</p>
                  <p className="whitespace-pre-wrap text-sm text-[var(--gray-700)]">{ep.show_notes}</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-lg border border-[var(--gray-200)] p-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Audio</p>
                {ep.audio_url ? <audio controls src={ep.audio_url} className="w-full" /> : <p className="text-xs text-[var(--gray-500)]">No audio yet.</p>}
                <label className={`${btnGhost} mt-3 w-full cursor-pointer`}><Upload className="h-3.5 w-3.5" />{ep.audio_url ? 'Replace audio' : 'Upload audio'}
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(ep, e.target.files[0])} />
                </label>
                <button className={`${btnPrimary} mt-2 w-full`} disabled={!ep.audio_url || !!busy} onClick={() => draft(ep)}><Sparkles className="h-3.5 w-3.5" />Draft notes, chapters and clips</button>
              </div>
              {ep.title_options?.length > 0 && (
                <div className="rounded-lg border border-[var(--gray-200)] p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Title options</p>
                  <ul className="space-y-1.5">{ep.title_options.map((t) => <li key={t} className="flex items-center justify-between gap-2 text-sm"><span>{t}</span><button className="text-[var(--red)]" title="Use this title" onClick={() => saveEp({ id: ep.id, title: t })}><Check className="h-4 w-4" /></button></li>)}</ul>
                </div>
              )}
              {ep.chapters?.length > 0 && (
                <div className="rounded-lg border border-[var(--gray-200)] p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Chapters</p>
                  <ul className="space-y-1 text-sm">{ep.chapters.map((c) => <li key={c.time + c.title}><span className="font-mono text-xs text-[var(--gray-400)]">{c.time}</span> {c.title}</li>)}</ul>
                </div>
              )}
              {ep.clip_ideas?.length > 0 && (
                <div className="rounded-lg border border-[var(--gray-200)] p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Clips for social</p>
                  <ul className="space-y-2 text-sm">{ep.clip_ideas.map((c) => <li key={c.start}><span className="font-mono text-xs text-[var(--gray-400)]">{c.start}-{c.end}</span> <b>{c.hook}</b><p className="text-xs text-[var(--gray-500)]">{c.why}</p></li>)}</ul>
                </div>
              )}
              <div className="rounded-lg border border-[var(--gray-200)] p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--gray-500)]">Description for Apple and Spotify</p>
                <textarea className={inputCls} rows={4} defaultValue={ep.description || ''} onBlur={(e) => saveEp({ id: ep.id, title: ep.title, description: e.target.value })} />
                <input className={inputCls} placeholder="YouTube video link" defaultValue={ep.youtube_url || ''} onBlur={(e) => saveEp({ id: ep.id, title: ep.title, youtube_url: e.target.value || null })} />
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
