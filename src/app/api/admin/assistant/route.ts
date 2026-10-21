import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/ops/session'
import { chatWithTools } from '@/lib/ops/chat'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: Request) {
  const session=await getAdminSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { messages, actor } = await req.json()
  const history = (messages as { role: 'user' | 'assistant'; text: string }[]).slice(-16).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }))
  try {
    const reply = await chatWithTools(history as never, { channel: 'admin', actorName: session.source==='office'?(session.name||session.email):(actor||null) })
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
