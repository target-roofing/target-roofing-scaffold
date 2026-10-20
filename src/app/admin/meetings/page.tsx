'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {useConsoleHref} from '@/app/admin/_ops/ConsoleContext'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { AudioLines, ClipboardPaste, FileAudio, Send, Webhook, MessageCircle, Loader2 } from 'lucide-react'
import { opsCreateMeetingFromText, opsCreateMeetingFromUpload, opsListMeetings, opsSignMeetingUpload } from '../_ops/actions'
import { Card, PageHeader, Pill, btnPrimary, fmtDate, inputCls } from '../_ops/ui'

type Row = Awaited<ReturnType<typeof opsListMeetings>>[number]
const browserDb = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rciyoqdtejxcjqnvbsoi.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'x')

export default function MeetingsPage() {
  const href=useConsoleHref()
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [mode, setMode] = useState<'paste' | 'upload'>('paste')
  const [title, setTitle] = useState('')
  const [when, setWhen] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => { try { setRows(await opsListMeetings()) } catch (e) { setError(String(e)) } }, [])
  useEffect(() => { load() }, [load])

  const run = async (id: string) => {
    setBusy('Reading the meeting and pulling out tasks. Long meetings take a minute or two...')
    const r = await fetch(`/api/meetings/${id}/process`, { method: 'POST' })
    const j = await r.json().catch(() => ({}))
    if (!r.ok || !j.ok) setError(j.error || `Processing failed (${r.status})`)
    router.push(href(`/admin/meetings/${id}`))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    try {
      const occurred_at = when ? new Date(when).toISOString() : undefined
      if (mode === 'paste') {
        setBusy('Saving transcript...')
        const m = await opsCreateMeetingFromText({ title, transcript: text, occurred_at })
        await run(m.id)
      } else {
        if (!file) throw new Error('Choose a recording or transcript file')
        if (/\.(txt|vtt|srt|md)$/i.test(file.name) || file.type.startsWith('text/')) {
          setBusy('Reading transcript file...')
          const m = await opsCreateMeetingFromText({ title: title || file.name.replace(/\.[^.]+$/, ''), transcript: await file.text(), occurred_at })
          await run(m.id); return
        }
        setBusy(`Uploading ${file.name} (${(file.size / 1048576).toFixed(1)} MB)...`)
        const signed = await opsSignMeetingUpload(file.name)
        const up = await browserDb().storage.from('meetings').uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || 'audio/mpeg' })
        if (up.error) throw new Error(up.error.message)
        const m = await opsCreateMeetingFromUpload({ title: title || file.name.replace(/\.[^.]+$/, ''), media_path: signed.path, media_mime: file.type || 'audio/mpeg', occurred_at })
        setBusy('Transcribing the recording, then pulling out tasks. This can take a few minutes...')
        await run(m.id)
      }
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); setBusy(null) }
  }

  const statusTone = (s: string) => (s === 'parsed' ? 'green' : s === 'error' ? 'red' : 'amber') as 'green' | 'red' | 'amber'

  return (
    <div>
      <PageHeader title="Meeting Intelligence" subtitle="Drop in any meeting: a pasted transcript, a recording, or one delivered automatically. The meeting is summarized, every commitment becomes a suggested task, and tasks for known people land on their list automatically. Anyone the system does not recognize waits for a person to pick the right employee." />

      {error && <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="New meeting" className="lg:col-span-2">
          <div className="mb-4 flex gap-2">
            <button onClick={() => setMode('paste')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider ${mode === 'paste' ? 'bg-[var(--black)] text-white' : 'bg-[var(--gray-100)] text-[var(--gray-600)]'}`}><ClipboardPaste className="h-3.5 w-3.5" />Paste transcript</button>
            <button onClick={() => setMode('upload')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider ${mode === 'upload' ? 'bg-[var(--black)] text-white' : 'bg-[var(--gray-100)] text-[var(--gray-600)]'}`}><FileAudio className="h-3.5 w-3.5" />Upload recording</button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={inputCls} placeholder="Title (optional, we will name it)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className={inputCls} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} title="When the meeting happened (used to work out deadlines)" />
            </div>
            {mode === 'paste' ? (
              <textarea className={`${inputCls} font-mono text-xs`} rows={12} placeholder="Paste the transcript or your notes. Speaker labels help but are not required." value={text} onChange={(e) => setText(e.target.value)} />
            ) : (
              <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-xl border-2 border-dashed border-[var(--gray-300)] p-8 text-center hover:border-[var(--red)]">
                <AudioLines className="mx-auto mb-2 h-8 w-8 text-[var(--gray-400)]" />
                <p className="text-sm font-semibold text-[var(--black)]">{file ? file.name : 'Choose an audio or video recording, or a transcript file'}</p>
                <p className="text-xs text-[var(--gray-500)] mt-1">mp3, m4a, wav, webm, mp4, mov, or txt/vtt/srt. Up to 500 MB.</p>
                <input ref={fileRef} type="file" accept="audio/*,video/*,.txt,.vtt,.srt,.md" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            )}
            <button className={btnPrimary} disabled={!!busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{busy ? 'Working...' : 'Analyze meeting'}</button>
            {busy && <p className="text-xs text-[var(--gray-500)]">{busy}</p>}
          </form>
        </Card>

        <Card title="Other ways to send a meeting here">
          <ul className="space-y-4 text-xs text-[var(--gray-600)]">
            <li className="flex gap-3"><MessageCircle className="h-4 w-4 shrink-0 text-[var(--red)]" /><span><b className="text-[var(--black)]">Telegram.</b> Forward a voice note, recording, or transcript file to the Target assistant bot, or paste the text with <code>/meeting</code> in front. It lands here and gets parsed.</span></li>
            <li className="flex gap-3"><Webhook className="h-4 w-4 shrink-0 text-[var(--red)]" /><span><b className="text-[var(--black)]">Automations.</b> Zoom, Google Meet, Fireflies, Otter, n8n or Zapier can POST to <code>/api/meetings/ingest</code> with the ingest token. Send a transcript, a file, or a link to the recording.</span></li>
            <li className="flex gap-3"><FileAudio className="h-4 w-4 shrink-0 text-[var(--red)]" /><span><b className="text-[var(--black)]">Phone recordings.</b> Record in any voice memo app and upload the file here or send it to the bot.</span></li>
          </ul>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-xs font-bold uppercase tracking-wider text-[var(--gray-500)]">Meetings</h2>
      <div className="space-y-2">
        {rows.length === 0 && <p className="text-sm text-[var(--gray-500)]">No meetings yet.</p>}
        {rows.map((m) => (
          <Link key={m.id} href={href(`/admin/meetings/${m.id}`)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--gray-200)] bg-white px-5 py-4 shadow-sm hover:border-[var(--red)]">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[var(--black)]">{m.title}</p>
              <p className="text-xs text-[var(--gray-500)]">{fmtDate(m.occurred_at, true)} · via {m.source}</p>
            </div>
            <div className="flex items-center gap-2">
              {m.counts.accepted > 0 && <Pill tone="green">{m.counts.accepted} tasks</Pill>}
              {m.counts.pending > 0 && <Pill tone="amber">{m.counts.pending} to review</Pill>}
              <Pill tone={statusTone(m.status)}>{m.status}</Pill>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
