'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {useConsoleHref} from '@/app/admin/_ops/ConsoleContext'
import { CheckCircle2, Circle, CircleDot, Plus, Trash2, UserPlus, RefreshCw } from 'lucide-react'
import { opsCreateMember, opsCreateTask, opsDeleteTask, opsListMembers, opsListTasks, opsUpdateTask } from '../_ops/actions'
import { Card, PageHeader, Pill, btnGhost, btnPrimary, fmtDate, inputCls } from '../_ops/ui'
import type { Member, Task, TaskStatus } from '@/lib/ops/tasks'

const STATUS_NEXT: Record<TaskStatus, TaskStatus> = { todo: 'in_progress', in_progress: 'done', done: 'todo' }

export default function TasksPage() {
  const href=useConsoleHref()
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [person, setPerson] = useState<string>('all')
  const [show, setShow] = useState<'open' | 'done' | 'all'>('open')
  const [tag, setTag] = useState<string>('')
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', assignee_id: '', due_date: '', priority: 'normal', tags: '' })
  const [memberForm, setMemberForm] = useState<{ open: boolean; name: string; role: string; email: string }>({ open: false, name: '', role: '', email: '' })
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [t, m] = await Promise.all([opsListTasks({}), opsListMembers()])
      setTasks(t); setMembers(m)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const allTags = useMemo(() => Array.from(new Set(tasks.flatMap((t) => t.tags || []))).sort(), [tasks])
  const visible = tasks.filter((t) =>
    (person === 'all' || (person === 'none' ? !t.assignee_id : t.assignee_id === person)) &&
    (show === 'all' || (show === 'open' ? t.status !== 'done' : t.status === 'done')) &&
    (!tag || (t.tags || []).includes(tag)))

  const groups = useMemo(() => {
    const g: { key: string; name: string; tasks: Task[] }[] = members.map((m) => ({ key: m.id, name: m.name, tasks: [] }))
    const none = { key: 'none', name: 'Unassigned', tasks: [] as Task[] }
    for (const t of visible) (g.find((x) => x.key === t.assignee_id) || none).tasks.push(t)
    return [...g, none].filter((x) => x.tasks.length)
  }, [visible, members])

  const counts = (id: string) => tasks.filter((t) => t.status !== 'done' && (id === 'none' ? !t.assignee_id : t.assignee_id === id)).length

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null)
    try {
      const t = await opsCreateTask({ title: form.title, assignee_id: form.assignee_id || null, due_date: form.due_date || null, priority: form.priority, tags: form.tags.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) })
      setTasks((prev) => [t, ...prev]); setForm({ title: '', assignee_id: form.assignee_id, due_date: '', priority: 'normal', tags: form.tags })
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }
  const patch = async (id: string, p: Parameters<typeof opsUpdateTask>[1]) => {
    const t = await opsUpdateTask(id, p)
    setTasks((prev) => prev.map((x) => (x.id === id ? t : x)))
  }
  const remove = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await opsDeleteTask(id); setTasks((prev) => prev.filter((x) => x.id !== id))
  }
  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const m = await opsCreateMember({ name: memberForm.name, role: memberForm.role, email: memberForm.email })
      setMembers((prev) => [...prev, m]); setMemberForm({ open: false, name: '', role: '', email: '' })
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Everyone's work in one list. Tasks come from meetings, from the Telegram bot, from the voice assistant, or from here.">
        <button className={btnGhost} onClick={load}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
        <button className={btnGhost} onClick={() => setMemberForm((f) => ({ ...f, open: !f.open }))}><UserPlus className="h-3.5 w-3.5" />Team member</button>
      </PageHeader>

      {error && <div className="mb-4 rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}

      {memberForm.open && (
        <Card title="Add a team member" className="mb-4">
          <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-4">
            <input className={inputCls} placeholder="Full name" required value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
            <input className={inputCls} placeholder="Role (optional)" value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} />
            <input className={inputCls} placeholder="Email (optional)" type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
            <button className={btnPrimary}>Add member</button>
          </form>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {[{ id: 'all', name: 'Everyone' }, ...members.map((m) => ({ id: m.id, name: m.name })), { id: 'none', name: 'Unassigned' }].map((p) => (
          <button key={p.id} onClick={() => setPerson(p.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${person === p.id ? 'bg-[var(--black)] text-white' : 'bg-white border border-[var(--gray-200)] text-[var(--gray-600)] hover:border-[var(--gray-400)]'}`}>
            {p.name}{p.id !== 'all' && <span className="ml-1.5 opacity-60">{counts(p.id)}</span>}
          </button>
        ))}
        <span className="mx-1 w-px bg-[var(--gray-200)]" />
        {(['open', 'done', 'all'] as const).map((s) => (
          <button key={s} onClick={() => setShow(s)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${show === s ? 'bg-[var(--red)] text-white' : 'bg-white border border-[var(--gray-200)] text-[var(--gray-600)]'}`}>{s}</button>
        ))}
        {allTags.length > 0 && (
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="rounded-full border border-[var(--gray-200)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--gray-600)]">
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
          </select>
        )}
      </div>

      <Card className="mb-6">
        <form onSubmit={add} className="grid gap-3 md:grid-cols-12">
          <input className={`${inputCls} md:col-span-5`} placeholder="Add a task..." required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className={`${inputCls} md:col-span-2`} value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <input className={`${inputCls} md:col-span-2`} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <input className={`${inputCls} md:col-span-2`} placeholder="tags, comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <button className={`${btnPrimary} md:col-span-1`}><Plus className="h-4 w-4" /></button>
        </form>
      </Card>

      {loading ? <p className="text-sm text-[var(--gray-400)]">Loading tasks...</p> : groups.length === 0 ? (
        <p className="text-sm text-[var(--gray-500)]">Nothing here. Paste a meeting into <Link href={href("/admin/meetings")} className="font-bold text-[var(--red)] underline">Meeting Intelligence</Link> to pull tasks out of it.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <Card key={g.key} title={<>{g.name} <span className="ml-1 text-[var(--gray-400)]">{g.tasks.filter((t) => t.status !== 'done').length} open</span></>}>
              <ul className="divide-y divide-[var(--gray-100)] -my-2">
                {g.tasks.map((t) => {
                  const overdue = t.due_date && t.status !== 'done' && new Date(t.due_date + 'T23:59:59') < new Date()
                  const Icon = t.status === 'done' ? CheckCircle2 : t.status === 'in_progress' ? CircleDot : Circle
                  return (
                    <li key={t.id} className="py-3">
                      <div className="flex items-start gap-3">
                        <button title={`Mark ${STATUS_NEXT[t.status].replace('_', ' ')}`} onClick={() => patch(t.id, { status: STATUS_NEXT[t.status] })} className="mt-0.5 text-[var(--gray-400)] hover:text-[var(--red)]">
                          <Icon className={`h-5 w-5 ${t.status === 'done' ? 'text-green-600' : t.status === 'in_progress' ? 'text-amber-500' : ''}`} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <button onClick={() => setEditing(editing === t.id ? null : t.id)} className={`text-left text-sm font-semibold ${t.status === 'done' ? 'line-through text-[var(--gray-400)]' : 'text-[var(--black)]'}`}>{t.title}</button>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--gray-500)]">
                            {t.status === 'in_progress' && <Pill tone="amber">In progress</Pill>}
                            {t.priority === 'high' && <Pill tone="red">High</Pill>}
                            {t.due_date && <span className={overdue ? 'font-bold text-red-600' : ''}>Due {fmtDate(t.due_date)}</span>}
                            {(t.tags || []).map((x) => <span key={x} className="text-[var(--gray-400)]">#{x}</span>)}
                            {t.source !== 'manual' && <span className="text-[var(--gray-400)]">via {t.source}</span>}
                            {t.meeting_id && <Link href={href(`/admin/meetings/${t.meeting_id}`)} className="text-[var(--red)] underline">meeting</Link>}
                          </div>
                          {editing === t.id && (
                            <div className="mt-3 grid gap-2 rounded-lg bg-[var(--gray-50)] p-3 sm:grid-cols-2">
                              <input className={`${inputCls} sm:col-span-2`} defaultValue={t.title} onBlur={(e) => e.target.value !== t.title && patch(t.id, { title: e.target.value })} />
                              <textarea className={`${inputCls} sm:col-span-2`} rows={2} placeholder="Notes" defaultValue={t.description || ''} onBlur={(e) => e.target.value !== (t.description || '') && patch(t.id, { description: e.target.value })} />
                              <select className={inputCls} value={t.assignee_id || ''} onChange={(e) => patch(t.id, { assignee_id: e.target.value || null })}>
                                <option value="">Unassigned</option>
                                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                              </select>
                              <input className={inputCls} type="date" defaultValue={t.due_date || ''} onChange={(e) => patch(t.id, { due_date: e.target.value || null })} />
                              <select className={inputCls} value={t.priority} onChange={(e) => patch(t.id, { priority: e.target.value as Task['priority'] })}>
                                <option value="low">Low priority</option><option value="normal">Normal priority</option><option value="high">High priority</option>
                              </select>
                              <input className={inputCls} defaultValue={(t.tags || []).join(', ')} onBlur={(e) => patch(t.id, { tags: e.target.value.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) })} />
                              {t.description && <p className="sm:col-span-2 text-xs text-[var(--gray-500)]" />}
                              <button onClick={() => remove(t.id)} className={`${btnGhost} sm:col-span-2`}><Trash2 className="h-3.5 w-3.5" />Delete task</button>
                            </div>
                          )}
                          {editing !== t.id && t.description && <p className="mt-1 text-xs text-[var(--gray-500)] line-clamp-2">{t.description}</p>}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
