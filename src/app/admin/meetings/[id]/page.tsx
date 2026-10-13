'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {useConsoleHref} from '@/app/admin/_ops/ConsoleContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, RefreshCw, Trash2, UserPlus, X } from 'lucide-react'
import { opsAcceptSuggestion, opsCreateMember, opsDeleteMeeting, opsDismissSuggestion, opsGetMeeting, opsListMembers } from '../../_ops/actions'
import { Card, PageHeader, Pill, btnGhost, btnPrimary, fmtDate, inputCls } from '../../_ops/ui'
import type { Member } from '@/lib/ops/tasks'
import type { Meeting, Suggestion } from '@/lib/ops/meetings'

export default function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const href=useConsoleHref()
  const { id } = use(params)
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [sugs, setSugs] = useState<Suggestion[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [d, m] = await Promise.all([opsGetMeeting(id), opsListMembers()])
    setMeeting(d.meeting as Meeting); setSugs(d.suggestions as Suggestion[]); setMembers(m)
  }, [id])
  useEffect(() => { load() }, [load])
  // Poll while a background job is still working on this meeting.
  useEffect(() => {
    if (!meeting || !['new', 'transcribing', 'parsing'].includes(meeting.status)) return
    const t = setInterval(load, 5000); return () => clearInterval(t)
  }, [meeting, load])

  const reparse = async () => {
    setBusy(true); setError(null)
    const r = await fetch(`/api/meetings/${id}/process`, { method: 'POST' })
    const j = await r.json().catch(() => ({}))
    if (!j.ok) setError(j.error || 'Processing failed')
    await load(); setBusy(false)
  }
  const accept = async (s: Suggestion) => {
    const memberId = picks[s.id] ?? s.suggested_member_id ?? ''
    if (memberId === '__new') return
    await opsAcceptSuggestion(s.id, memberId || null); await load()
  }
  const dismiss = async (s: Suggestion) => { await opsDismissSuggestion(s.id); await load() }
  const addPerson = async (s: Suggestion) => {
    const name = prompt('Name of the new team member', s.owner_name_raw || '')
    if (!name) return
    const m = await opsCreateMember({ name })
    setMembers((prev) => [...prev, m]); setPicks((p) => ({ ...p, [s.id]: m.id }))
  }
  const acceptAllAssigned = async () => {
    for (const s of sugs.filter((x) => x.status === 'pending' && (picks[x.id] || x.suggested_member_id))) await opsAcceptSuggestion(s.id, picks[s.id] || s.suggested_member_id)
    await load()
  }
  const remove = async () => {
    if (!confirm('Delete this meeting? Tasks already created stay on the task list.')) return
    await opsDeleteMeeting(id); router.push(href('/admin/meetings'))
  }

  if (!meeting) return <p className="text-sm text-[var(--gray-400)]">Loading...</p>
  const pending = sugs.filter((s) => s.status === 'pending')
  const accepted = sugs.filter((s) => s.status === 'accepted')
  const name = (mid: string | null) => members.find((m) => m.id === mid)?.name || 'Unassigned'
  const working = ['new', 'transcribing', 'parsing'].includes(meeting.status)

  return (
    <div>
      <Link href={href("/admin/meetings")} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--gray-500)] hover:text-[var(--red)]"><ArrowLeft className="h-3.5 w-3.5" />All meetings</Link>
      <PageHeader title={meeting.title} subtitle={`${fmtDate(meeting.occurred_at, true)} · via ${meeting.source}`}>
        <button className={btnGhost} onClick={reparse} disabled={busy || working}>{busy || working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}{working ? meeting.status : 'Re-analyze'}</button>
        <button className={btnGhost} onClick={remove}><Trash2 className="h-3.5 w-3.5" />Delete</button>
      </PageHeader>

      {(error || meeting.error) && <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-xs font-semibold text-red-700">{error || meeting.error}</div>}
      {working && <div className="mb-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-xs font-semibold text-amber-800">This meeting is being {meeting.status === 'transcribing' ? 'transcribed' : 'analyzed'}. The page refreshes on its own.</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title={`Needs a person (${pending.length})`} right={pending.some((s) => picks[s.id] || s.suggested_member_id) ? <button className={btnPrimary} onClick={acceptAllAssigned}><Check className="h-3.5 w-3.5" />Add all assigned</button> : null}>
            {pending.length === 0 ? <p className="text-sm text-[var(--gray-500)]">Nothing waiting. Every suggested task has been added or dismissed.</p> : (
              <ul className="space-y-3">
                {pending.map((s) => (
                  <li key={s.id} className="rounded-lg border border-[var(--gray-200)] p-4">
                    <p className="text-sm font-semibold text-[var(--black)]">{s.title}</p>
                    {s.description && <p className="mt-1 text-xs text-[var(--gray-600)]">{s.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[var(--gray-500)]">
                      {s.owner_name_raw ? <span>Heard as: <b>{s.owner_name_raw}</b></span> : <span>Nobody took this in the meeting</span>}
                      {(s.due_date || s.due_hint) && <span>Due {s.due_date ? fmtDate(s.due_date) : s.due_hint}</span>}
                      {s.tags.map((t) => <span key={t}>#{t}</span>)}
                    </div>
                    {s.evidence && <p className="mt-2 border-l-2 border-[var(--gray-200)] pl-2 text-[11px] italic text-[var(--gray-500)]">&ldquo;{s.evidence}&rdquo;</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <select className={`${inputCls} max-w-[220px]`} value={picks[s.id] ?? s.suggested_member_id ?? ''} onChange={(e) => setPicks({ ...picks, [s.id]: e.target.value })}>
                        <option value="">Choose employee...</option>
                        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <button className={btnGhost} onClick={() => addPerson(s)}><UserPlus className="h-3.5 w-3.5" />New person</button>
                      <button className={btnPrimary} disabled={!(picks[s.id] ?? s.suggested_member_id)} onClick={() => accept(s)}><Check className="h-3.5 w-3.5" />Add task</button>
                      <button className={btnGhost} onClick={() => dismiss(s)}><X className="h-3.5 w-3.5" />Dismiss</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Added to the task list (${accepted.length})`} right={<Link href={href("/admin/tasks")} className="text-xs font-bold text-[var(--red)] underline">Open tasks</Link>}>
            {accepted.length === 0 ? <p className="text-sm text-[var(--gray-500)]">None yet.</p> : (
              <ul className="divide-y divide-[var(--gray-100)] -my-2">
                {accepted.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div><p className="text-sm text-[var(--black)]">{s.title}</p>{(s.due_date || s.due_hint) && <p className="text-[11px] text-[var(--gray-500)]">Due {s.due_date ? fmtDate(s.due_date) : s.due_hint}</p>}</div>
                    <Pill tone="green">{name(s.suggested_member_id)}</Pill>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Summary">
            {meeting.summary ? <p className="text-sm leading-relaxed text-[var(--gray-700)]">{meeting.summary}</p> : <p className="text-sm text-[var(--gray-400)]">Not analyzed yet.</p>}
          </Card>
          {meeting.decisions?.length > 0 && (
            <Card title="Decisions">
              <ul className="list-disc space-y-1.5 pl-4 text-sm text-[var(--gray-700)]">{meeting.decisions.map((d) => <li key={d}>{d}</li>)}</ul>
            </Card>
          )}
          {meeting.participants?.length > 0 && (
            <Card title="Who was there">
              <ul className="space-y-1 text-sm">{meeting.participants.map((p) => <li key={p.name}><b>{p.name}</b>{p.role && <span className="text-[var(--gray-500)]"> · {p.role}</span>}</li>)}</ul>
            </Card>
          )}
          <Card title="Transcript" right={meeting.transcript ? <button className="text-xs font-bold text-[var(--red)] underline" onClick={() => setShowTranscript(!showTranscript)}>{showTranscript ? 'Hide' : 'Show'}</button> : null}>
            {!meeting.transcript ? <p className="text-sm text-[var(--gray-400)]">{meeting.media_path ? 'Recording uploaded, transcript pending.' : 'None.'}</p>
              : showTranscript ? <pre className="max-h-[480px] overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed text-[var(--gray-600)]">{meeting.transcript}</pre>
              : <p className="text-xs text-[var(--gray-500)]">{meeting.transcript.split(/\s+/).length.toLocaleString()} words</p>}
          </Card>
        </div>
      </div>
    </div>
  )
}
