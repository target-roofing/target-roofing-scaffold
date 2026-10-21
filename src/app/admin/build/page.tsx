'use client'

import { useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Card, PageHeader, btnPrimary } from '../_ops/ui'

// The brief Casey pastes into ChatGPT or Claude. It names env vars but never holds a value:
// keys live in Vercel and are pulled locally with `vercel env pull`.
const AI_BRIEF = `You are helping Casey Crowther, owner of Target Roofing (a roofing contractor in North Fort Myers, Southwest Florida), add a new feature or tool to his company website and admin console. Read all of this before suggesting anything.

THE PROJECT
- Live site: https://targetroofers.com. Office: https://targetroofers.com/office. Approved Office administrators open the full console from one Admin tools entry at /office/administration using their Google work sign-in. The original https://targetroofers.com/admin remains available with its existing sign-in.
- Code: GitHub repo target-roofing/target-roofing-scaffold (Casey's organization).
- Hosting: Vercel, team "Target Roofing", project "targetroofing". Every pull request gets its own preview link. Merging to the main branch publishes to targetroofers.com automatically.
- Database: Supabase (Target Roofing organization). Email notifications go out over SMTP.
- Team: Darian (darian@targetroofers.com) reviews and merges pull requests. Winston Fowlkes built the site and can help with setup.

STACK
- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, lucide-react icons.
- Supabase through @supabase/supabase-js. Server code uses the service role key; it must never reach the browser.
- AI features use Google Gemini (@google/genai); the OpenAI SDK is also installed.
- Checks: npm run lint, npm run build, npm run test:forms, npm run test:security, and Playwright end-to-end tests (npm run test:e2e).

HOW THE ADMIN CONSOLE IS BUILT
- src/app/admin/layout.tsx checks the login (src/lib/ops/session.ts) and wraps every admin page in src/app/admin/_ops/AdminShell.tsx, which draws the left sidebar.
- The sidebar and the first-visit guide both read one list: ADMIN_SECTIONS in src/app/admin/_ops/nav.tsx (label, link, icon, summary, "good for"). Icons are in src/app/admin/_ops/icons.tsx.
- To add an admin page: create src/app/admin/<tool-name>/page.tsx, then add an entry to ADMIN_SECTIONS. Keep new admin functions inside the existing grouped Admin tools console rather than adding individual Office cards. Use useConsoleHref from the ConsoleContext component for admin-page links so they stay inside the selected Office or original console view. Shared UI pieces (PageHeader, Card, Pill, input and button styles) are in src/app/admin/_ops/ui.tsx. Match the existing look: Target red (CSS variable --red), black, grays, and the display font var(--font-display).
- Data access goes in server actions ('use server') or route handlers under src/app/api/. Anything that reads or writes admin data must check the session first with requireAdmin() or getAdminSession() from src/lib/ops/session.ts.
- Existing tables: leads, reviews, seo_config, showcase_videos, job_listings, prospect_intakes, team_members, meetings, tasks, meeting_task_suggestions, podcast_name_votes, podcast_settings, podcast_episodes, telegram_chats, assistant_log. Add new tables as a new SQL file in supabase/migrations/ with row level security turned on.
- Public website forms save the lead first and send the notification second. docs/form-routing.md explains where each form goes. Do not change that order.

ENVIRONMENT VARIABLES (names only; the values live in Vercel and are never written into code or pasted into a chat)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET, GOOGLE_AI_API_KEY, GEMINI_OPS_MODEL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_FROM, CONTACT_NOTIFY_TO, LEAD_NOTIFY_TO, SOFTWASH_NOTIFY_TO, INTAKE_NOTIFY_TO, INTAKE_REPLY_TO, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, MEETINGS_INGEST_TOKEN, AGENT_TOOLS_SECRET, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_GA_ID.
To run it on a computer: clone the repo, run npm install, run npx vercel link (team Target Roofing, project targetroofing), run npx vercel env pull .env.local, then npm run dev.

TWO PLACES A NEW TOOL CAN LIVE
1. Inside this admin console. Best when the tool uses the site's leads, tasks, team or other data, and it gets the login and sidebar for free. Build it as a new admin page and deliver it as a pull request.
2. As its own app on a subdomain of targetroofers.com, for example estimates.targetroofers.com. Best for bigger standalone tools. Create a separate Vercel project in the Target Roofing team, add the subdomain under that project's Settings > Domains, then add the CNAME record Vercel shows in GoDaddy, where the targetroofers.com DNS lives. Never touch the existing Google email records (MX and TXT). The admin sidebar can link out to it.

HOW TO WORK
- Before writing code, ask Casey what the tool should do, who will use it, what information it needs, and where it should live (option 1 or 2 above).
- Work on a new branch and open a pull request. Never push straight to main.
- Never commit or paste secrets. If something needs a key, say which environment variable it needs and stop; Winston or Darian will add the value in Vercel.
- Explain things in plain language. Casey runs a roofing company, not a software team.

WHAT CASEY WANTS TO BUILD
[Describe your idea here: what it should do, who uses it, and anything it should connect to.]`

const SUBDOMAIN_IDEAS = [
  { host: 'estimates.targetroofers.com', use: 'A quick roof estimate calculator for the sales team or homeowners' },
  { host: 'inspect.targetroofers.com', use: 'Inspection reports with photos you can send to a homeowner or insurer' },
  { host: 'crew.targetroofers.com', use: 'Crew schedules, job checklists and material lists' },
  { host: 'tools.targetroofers.com', use: 'A home for smaller internal tools as they come up' },
]

export default function BuildToolPage() {
  const [copied, setCopied] = useState(false)
  const boxRef = useRef<HTMLTextAreaElement>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AI_BRIEF)
    } catch {
      boxRef.current?.select()
      document.execCommand('copy')
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div>
      <PageHeader title="Add a Tool" subtitle="Casey, this console is built to grow. If you have an idea for a feature or a tool, your own ChatGPT or Claude can build it with you. Copy the brief below into a new chat and it will know how this site works, without any passwords or keys in it.">
        <button onClick={copy} className={btnPrimary}>
          {copied ? <><Check className="h-4 w-4" />Copied</> : <><Copy className="h-4 w-4" />Copy the brief</>}
        </button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="1. The brief for ChatGPT or Claude" className="xl:col-span-2" right={
          <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--red)] hover:underline">
            {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
          </button>
        }>
          <p className="mb-3 text-sm text-[var(--gray-600)]">Paste it as your first message, then replace the last line with your idea. It covers how the site is built, where things live, how changes go live, and the rules for keeping it safe.</p>
          <textarea ref={boxRef} readOnly value={AI_BRIEF} rows={27} onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-y rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] p-4 font-mono text-[12px] leading-relaxed text-[var(--gray-700)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]" />
        </Card>

        <div className="space-y-6">
          <Card title="2. Getting access">
            <ol className="space-y-3 text-sm text-[var(--gray-600)]">
              <li><span className="font-bold text-[var(--black)]">Code.</span> You own the target-roofing organization on GitHub. In ChatGPT, connect Codex to GitHub and give it the target-roofing-scaffold repo. Claude Code works the same way. It makes changes on a branch and opens a pull request.</li>
              <li><span className="font-bold text-[var(--black)]">Preview.</span> Every pull request gets its own preview link from Vercel, so you can click through the change before anything goes live.</li>
              <li><span className="font-bold text-[var(--black)]">Go live.</span> Darian or Winston reviews the pull request and merges it. Merging publishes it to targetroofers.com.</li>
              <li><span className="font-bold text-[var(--black)]">Keys.</span> Never paste a key or password into a chat. Writing the code does not need them. When something needs a new key, Darian or Winston adds it in Vercel.</li>
            </ol>
          </Card>

          <Card title="3. Where it lives">
            <p className="text-sm text-[var(--gray-600)]"><span className="font-bold text-[var(--black)]">Inside this console</span> when it uses your leads, tasks or team. It gets the login and the sidebar automatically.</p>
            <p className="mt-3 text-sm text-[var(--gray-600)]"><span className="font-bold text-[var(--black)]">On its own subdomain</span> for a bigger standalone tool. We can point any name you like at it. A few ideas:</p>
            <ul className="mt-3 space-y-2">
              {SUBDOMAIN_IDEAS.map((s) => (
                <li key={s.host} className="rounded-lg border border-[var(--gray-200)] px-3 py-2">
                  <p className="font-mono text-[12px] font-bold text-[var(--red)]">{s.host}</p>
                  <p className="text-xs text-[var(--gray-500)]">{s.use}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[var(--gray-500)]">Tell Winston or Darian which name you want and we will set it up and link it from this sidebar.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
