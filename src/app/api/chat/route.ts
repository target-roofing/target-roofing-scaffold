import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '@/lib/supabase'
import { recipientList, sendNotification } from '@/lib/notify'
import { extractChatLeadMarkers } from '@/lib/chat-lead-marker'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! })

const SYSTEM_PROMPT = `You are the Target Roofing virtual assistant on their website. Target Roofing is a commercial and residential roofing company in Southwest Florida (Fort Myers, Naples, Sarasota, Cape Coral, etc.), license #CCC1334168.

Your job is to be helpful, answer roofing questions, AND guide the visitor toward scheduling a free roof inspection or getting a quote. You are friendly, professional, and knowledgeable about roofing.

CONVERSATION FLOW:
1. Greet them and ask how you can help
2. Answer any roofing questions they have (leak repair, roof types, maintenance, storm damage, etc.)
3. When appropriate, offer to schedule a free inspection or get them a quote
4. To schedule, you need to collect: name, email, phone, property address, roof type (if known), and what the issue/need is
5. Once you have their address, tell them you're pulling up a satellite view of their property so they can confirm it's the right location. Include the marker: [SHOW_SATELLITE:ADDRESS] where ADDRESS is their full address.
6. After they confirm the property, collect remaining details and submit the lead
7. When you have all info ready to submit, include the marker: [SUBMIT_LEAD:JSON] where JSON contains: {"firstName","lastName","email","phone","address","roofType","issue","requestType"}. Set requestType to "service" for a repair, leak or emergency request; use "estimate" for replacement/new-roof estimates, a general inspection, or an unclear request. Keep roofType as the roof material, not the request type.

IMPORTANT RULES:
- Keep responses SHORT (2-3 sentences max). Be conversational, not robotic.
- Do not introduce yourself as AI unless asked. If a visitor asks whether you are a person, bot, or AI, or who is responding, say clearly that you are an automated Target Roofing assistant. Never imply a human is typing.
- Don't ask for all info at once - collect it naturally over the conversation
- You can answer general roofing questions without collecting info
- If they ask about pricing, say Target Roofing offers free estimates and you'd love to get them connected
- Services: new roofs, reroofing/replacement, repairs, maintenance plans, softwash, waterproofing, TPO/PVC, metal roofing, built-up roofing
- Phone: 239-332-5707
- Address: 7011 Nalle Grade Rd, North Fort Myers, FL 33917
- Hours: Mon-Sat 8am-5pm
- Do NOT make up prices or timelines
- If asked something you don't know, offer to connect them with the team`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages, attribution } = (await request.json()) as { messages: ChatMessage[]; attribution?: string }

    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }))

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: { systemInstruction: SYSTEM_PROMPT },
    })

    const text = result.text || ''

    const { markers, cleanText } = extractChatLeadMarkers(text)
    const leadMatch = markers[0]
    if (leadMatch) {
      try {
        const leadData = JSON.parse(leadMatch.json)
        const suppliedFirstName = (leadData.firstName || '').trim()
        const nameParts = suppliedFirstName.split(/\s+/)
        const firstName = leadData.lastName ? suppliedFirstName : nameParts[0]
        const lastName = leadData.lastName || nameParts.slice(1).join(' ') || ''
        const { data: lead, error } = await supabase.from('leads').insert({
          form_type: 'contact',
          first_name: firstName,
          last_name: lastName,
          email: leadData.email,
          phone: leadData.phone,
          street_address: leadData.address,
          service: leadData.roofType || 'Inspection',
          message: [leadData.issue || 'Inspection request', 'Lead channel: website chat', typeof attribution === 'string' ? attribution.slice(0, 3000) : ''].filter(Boolean).join('\n\n'),
        }).select('id').single()
        if (error) throw error

        let notified = false
        try {
          const notification = await sendNotification({
            to: recipientList(leadData.requestType === 'service'
              ? process.env.CONTACT_NOTIFY_TO || 'service@targetroofers.com'
              : process.env.LEAD_NOTIFY_TO || 'projects@targetroofers.com'),
            subject: 'Website Lead - Chatbot',
            heading: 'New chatbot inspection request',
            fromName: 'Website Inquiry',
            replyTo: leadData.email,
            fields: [
              ['Name', [firstName, lastName].filter(Boolean).join(' ')],
              ['Phone', leadData.phone],
              ['Email', leadData.email],
              ['Property address', leadData.address],
              ['Roof type', leadData.roofType],
              ['Issue', leadData.issue],
              ['Lead ID', lead?.id],
              ['Lead manager', (process.env.NEXT_PUBLIC_SITE_URL || 'https://targetroofers.com') + '/admin'],
            ],
          })
          notified = notification.sent
          if (!notified) console.error('[chat] Lead saved but notification not sent:', lead?.id, notification.error)
        } catch (notificationError) {
          console.error('[chat] Lead saved but notification failed:', lead?.id, notificationError)
        }
        return NextResponse.json({
          message: notified
            ? 'Your request is saved. Our team will follow up to discuss the next step.'
            : 'Your request is saved, but I could not notify the team. Please call 239-332-5707 and mention your website request.',
          lead: { id: String(lead.id), notified },
        })
      } catch (error) {
        console.error('[chat] Could not save chatbot lead:', error)
        return NextResponse.json({
          message: 'I could not submit your request. Please call us at 239-332-5707 so we can help you directly.',
        }, { status: 500 })
      }
    }

    return NextResponse.json({ message: cleanText })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: 'Sorry, I\'m having trouble right now. Please call us at 239-332-5707 for immediate help!' },
      { status: 500 }
    )
  }
}
