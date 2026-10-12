'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import { trackLead, attributionSummary } from '@/lib/tracking'
import { CHAT_GREETING, withEarlyPhoneOption } from '@/lib/chat-copy'

const chatUrlTransform = (url: string) => url === 'tel:+12393325707' ? url : defaultUrlTransform(url)

interface Message {
  role: 'user' | 'assistant'
  content: string
  satellite?: string
  substantive?: boolean
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: CHAT_GREETING }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          attribution: attributionSummary(),
        }),
      })
      const data = await res.json()
      if (res.ok && typeof data.lead?.id === 'string') {
        trackLead(data.lead.id, { form_id: 'chat' })
      }
      const modelText = typeof data.message === 'string' ? data.message : ''
      let content = modelText || 'Sorry, something went wrong.'
      let satellite: string | undefined

      const satMatch = content.match(/\[SHOW_SATELLITE:(.*?)\]/)
      if (satMatch) {
        satellite = satMatch[1].trim()
        content = content.replace(/\[SHOW_SATELLITE:.*?\]/g, '').trim()
      }

      const substantive = res.ok && !!modelText.trim() && !!content.trim()
      if (substantive) {
        const previousReplies = newMessages.filter(message => message.role === 'assistant' && message.substantive).length
        content = withEarlyPhoneOption(content, previousReplies)
      }

      setMessages(prev => [...prev, { role: 'assistant', content, satellite, substantive }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. You can reach us at 239-332-5707!',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat bubble */}
      {!open && (
        <button
          aria-label="Chat with Target Roofing"
          onClick={() => setOpen(true)}
          className="mobile-chat-trigger fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[var(--red)] hover:bg-[var(--red-dark)] text-white px-5 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-bold uppercase tracking-wide font-[family-name:var(--font-display)] hidden sm:inline">
            Chat with us
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="mobile-chat-panel fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-[var(--gray-200)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--red)] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Image
                  src="/images/logos/target-roofing-logo.png"
                  alt="Target Roofing"
                  width={28}
                  height={28}
                  className="w-7 h-auto brightness-0 invert"
                />
              </div>
              <div>
                <p className="text-sm font-bold font-[family-name:var(--font-display)] uppercase tracking-wide">Target Roofing</p>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a aria-label="Call Target Roofing" href="tel:+12393325707" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <button aria-label="Close chat" onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--gray-50)]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--red)] text-white rounded-br-sm'
                        : 'bg-white text-[var(--gray-800)] shadow-sm border border-[var(--gray-100)] rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Markdown
                        urlTransform={chatUrlTransform}
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-1.5 space-y-0.5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-1.5 space-y-0.5">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          a: ({ href, children }) => <a href={href} className="text-[var(--red)] underline hover:no-underline" target={href?.startsWith('tel:') ? undefined : '_blank'} rel={href?.startsWith('tel:') ? undefined : 'noopener noreferrer'}>{children}</a>,
                        }}
                      >
                        {msg.content}
                      </Markdown>
                    ) : msg.content}
                  </div>
                  {msg.satellite && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[var(--gray-200)] shadow-sm">
                      <div className="bg-white px-3 py-1.5 flex items-center gap-2 border-b border-[var(--gray-100)]">
                        <MapPin className="w-3.5 h-3.5 text-[var(--red)]" />
                        <span className="text-[11px] text-[var(--gray-600)] font-semibold truncate">{msg.satellite}</span>
                      </div>
                      <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(msg.satellite)}&t=k&z=19&output=embed`}
                        className="w-full h-40"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <div className="bg-white px-3 py-2 text-center">
                        <p className="text-[11px] text-[var(--gray-500)]">Is this your property? Let me know!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-[var(--gray-100)] px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[var(--gray-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--gray-400)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--gray-400)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex-shrink-0 border-t border-[var(--gray-200)] bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3.5 py-2.5 bg-[var(--gray-50)] border border-[var(--gray-200)] rounded-full text-sm text-[var(--gray-800)] placeholder:text-[var(--gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]/30 focus:border-[var(--red)]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full bg-[var(--red)] hover:bg-[var(--red-dark)] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
