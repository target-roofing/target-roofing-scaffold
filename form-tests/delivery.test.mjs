import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const plain = (value) => JSON.parse(JSON.stringify(value))

function load(relativePath, mocks = {}, globals = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(path.join(root, relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const loadedModule = { exports: {} }
  vm.runInNewContext(compiled, {
    module: loadedModule, exports: loadedModule.exports, URLSearchParams,
    process: { env: {} }, console: { error() {}, warn() {}, log() {} },
    require(name) {
      if (!Object.hasOwn(mocks, name)) throw new Error(`Unexpected import: ${name}`)
      return mocks[name]
    },
    ...globals,
  }, { filename: relativePath })
  return loadedModule.exports
}

function harness({ env = {}, saveError = null, missingRow = false, mailSent = true } = {}) {
  const inserts = [], messages = [], updates = [], order = []
  const notify = load('src/lib/notify.ts', { 'server-only': {}, nodemailer: {} })
  const staff = load('src/lib/intake-staff.ts', { 'server-only': {} })
  const mocks = {
    '@/lib/supabase': { supabase: { from(table) {
      return {
        insert(record) {
          order.push('save')
          inserts.push({ table, record: plain(record) })
          return { select: () => ({ single: async () => ({
            data: saveError || missingRow ? null : { id: `test-lead-${inserts.length}` }, error: saveError,
          }) }) }
        },
        update(record) { return { eq: async (field, id) => { updates.push({ table, record: plain(record), field, id }); return { error: null } } } },
      }
    } } },
    '@/lib/ops/session': { setAdminSession() {}, clearAdminSession() {}, requireAdmin() {} },
    '@/lib/notify': {
      recipientList: notify.recipientList,
      async sendNotification(message) { order.push('notify'); messages.push(plain(message)); return { sent: mailSent, error: mailSent ? undefined : 'SMTP unavailable' } },
    },
    '@/lib/intake-staff': staff,
  }
  const globals = { process: { env } }
  return { actions: load('src/app/actions.ts', mocks, globals), intake: load('src/app/prospect-intake-form/actions.ts', mocks, globals), inserts, messages, updates, order }
}

const contact = {
  firstName: 'Test', lastName: 'Customer', phone: '202-555-0123', email: 'customer@example.com',
  streetAddress: 'Test address', city: 'Fort Myers', zip: '33917', service: 'roof-repair', message: 'TEST - no dispatch',
}
const cleaning = { firstName: 'Test', lastName: 'Customer', email: 'customer@example.com', phone: '202-555-0123', serviceAddress: 'Test address' }
const prospect = {
  customerFirstName: 'Test', customerLastName: 'Customer', createdBy: 'Sarah Taylor', customerEmail: 'customer@example.com',
  customerPhone: '202-555-0123', salesperson: 'Trey Peters', projectName: 'TEST - no dispatch', bidDueDate: '', comments: '',
}

test('shared contact page keeps explicit estimate intent, including CTA query strings', () => {
  const { contactFormSource, cleaningFormSource } = load('src/lib/form-intent.ts')
  assert.equal(contactFormSource('roof-repair', ''), 'contact-page')
  assert.equal(contactFormSource('roof-repair', '?service=free-estimate&utm_source=test'), 'estimate')
  assert.equal(contactFormSource('free-estimate', ''), 'estimate')
  assert.equal(cleaningFormSource('?request=roof-cleaning&utm_source=test'), 'roof-cleaning')
  assert.equal(cleaningFormSource('?utm_source=test'), 'softwash')
})

for (const [name, input, recipient, formName] of [
  ['Contact Us', { ...contact, source: 'contact-page' }, 'service@targetroofers.com', 'Contact Us'],
  ['Free Estimate', { ...contact, service: 'reroofing', source: 'estimate' }, 'projects@targetroofers.com', 'Free Estimate'],
  ['Free Estimate chosen on Contact Us', { ...contact, source: 'contact-page', service: 'free-estimate' }, 'projects@targetroofers.com', 'Free Estimate'],
]) {
  test(`${name}: saves first, then notifies the intended recipient with customer reply-to`, async () => {
    const h = harness()
    const result = await h.actions.submitContactLead({ ...input, email: ' customer@example.com ', attribution: 'utm_source=test' })
    assert.deepEqual(plain(result), { success: true, leadId: 'test-lead-1', notified: true })
    assert.deepEqual(h.order, ['save', 'notify'])
    assert.equal(h.inserts[0].table, 'leads')
    assert.equal(h.inserts[0].record.email, 'customer@example.com')
    assert.match(h.inserts[0].record.message, /utm_source=test/)
    assert.ok(h.inserts[0].record.message.endsWith(`Website form: ${formName}`))
    assert.deepEqual(h.messages[0].to, [recipient])
    assert.equal(h.messages[0].replyTo, 'customer@example.com')
    assert.ok(h.messages[0].fields.some(([field, value]) => field === 'Lead ID' && value === result.leadId))
  })
}

for (const service of ['repairs', 'roof-repair', 'emergency-storm-repair']) {
  test(`${service} requested through an estimate form notifies Service after saving`, async () => {
    const h = harness()
    const result = await h.actions.submitContactLead({ ...contact, service, source: 'estimate' })
    assert.equal(result.notified, true)
    assert.deepEqual(h.order, ['save', 'notify'])
    assert.deepEqual(h.messages[0].to, ['service@targetroofers.com'])
    assert.equal(h.messages[0].replyTo, 'customer@example.com')
    assert.equal(h.messages[0].subject, 'Website Lead')
    assert.equal(h.messages[0].heading, 'New estimate request from the website')
    assert.ok(h.messages[0].fields.some(([label, value]) => label === 'Page' && value === 'Estimate form'))
    assert.equal(h.inserts[0].record.service, service)
    assert.match(h.inserts[0].record.message, /Website form: Free Estimate/)
  })
}

test('repair routing normalizes the selection and keeps Contact Us identity', async () => {
  const h = harness()
  await h.actions.submitContactLead({ ...contact, service: ' REPAIRS ', source: 'contact-page' })
  assert.deepEqual(h.messages[0].to, ['service@targetroofers.com'])
  assert.equal(h.messages[0].subject, 'Target Roofing - New submission from Contact US')
  assert.match(h.inserts[0].record.message, /Website form: Contact Us/)
  assert.equal(h.inserts[0].record.service, ' REPAIRS ')
})

test('repair selections without a source use Service and preserve the default estimate identity', async () => {
  const h = harness()
  await h.actions.submitContactLead({ ...contact, service: ' REPAIRS ' })
  assert.deepEqual(h.messages[0].to, ['service@targetroofers.com'])
  assert.equal(h.messages[0].subject, 'Website Lead')
  assert.match(h.inserts[0].record.message, /Website form: Free Estimate/)
})

for (const service of ['reroofing', 'new-roofs', 'inspection', 'maintenance-plans', 'repairs-estimate', 'service@outside.example']) {
  test(`${service} on an estimate form keeps Projects despite repair words in the message`, async () => {
    const h = harness({ env: { CONTACT_NOTIFY_TO: 'service-team@example.com', LEAD_NOTIFY_TO: 'sales@example.com' } })
    await h.actions.submitContactLead({ ...contact, service, source: 'estimate', message: 'Replacement quote for a roof with leaks and previous repairs' })
    assert.deepEqual(h.messages[0].to, ['sales@example.com'])
  })
}

test('repair estimates preserve the configured Service recipient and phone-only reply address', async () => {
  const h = harness({ env: { CONTACT_NOTIFY_TO: 'service-team@example.com', LEAD_NOTIFY_TO: 'sales@example.com' } })
  await h.actions.submitContactLead({ ...contact, service: 'repairs', source: 'estimate', email: '' })
  assert.deepEqual(h.messages[0].to, ['service-team@example.com'])
  assert.equal(h.messages[0].replyTo, 'service-team@example.com')
})

for (const [source, recipient, service] of [
  ['softwash', 'service@targetroofers.com', 'Softwash'],
  ['roof-cleaning', 'projects@targetroofers.com', 'Roof Cleaning Estimate'],
]) {
  test(`${source}: correct recipient, saved service identity, attribution, and customer reply-to`, async () => {
    const h = harness()
    const result = await h.actions.submitSoftwashLead({ ...cleaning, source, attribution: 'utm_source=test' })
    assert.equal(result.notified, true)
    assert.deepEqual(h.order, ['save', 'notify'])
    assert.equal(h.inserts[0].table, 'leads')
    assert.equal(h.inserts[0].record.service, service)
    assert.match(h.inserts[0].record.message, /utm_source=test/)
    assert.deepEqual(h.messages[0].to, [recipient])
    assert.equal(h.messages[0].replyTo, 'customer@example.com')
  })
}

for (const [salesperson, email] of [
  ['Rast Bryant', 'Rast@targetroofers.com'], ['Brad North', 'Brad@targetroofers.com'],
  ['Trey Peters', 'Trey@targetroofers.com'], ['Colton Peterson', 'Colton@targetroofers.com'],
  ['Andrew Weiczorek', 'Andrew@targetroofers.com'], ['Jason Odom', 'Jason@targetroofers.com'],
]) {
  test(`Prospect Intake assigned to ${salesperson}: salesperson plus office, with office reply-to`, async () => {
    const h = harness()
    const result = await h.intake.submitProspectIntake({ ...prospect, salesperson })
    assert.equal(result.success, true)
    assert.equal(result.notified, true)
    assert.equal(h.inserts[0].table, 'prospect_intakes')
    assert.equal(h.inserts[0].record.salesperson_email, email)
    assert.deepEqual(h.messages[0].to, [email, 'projects@targetroofers.com'])
    assert.equal(h.messages[0].replyTo, 'admin@targetroofers.com')
    assert.ok(!h.messages[0].to.includes('sarah@targetroofers.com'))
    assert.deepEqual(h.updates, [{ table: 'prospect_intakes', record: { notified: true }, field: 'id', id: 'test-lead-1' }])
  })
}

test('office copy and intake reply address remain configurable; duplicate recipients are removed', async () => {
  const h = harness({ env: { INTAKE_NOTIFY_TO: 'service@targetroofers.com, trey@targetroofers.com', INTAKE_REPLY_TO: 'service@targetroofers.com' } })
  await h.intake.submitProspectIntake({ ...prospect, createdBy: 'Janely Santamaria' })
  assert.deepEqual(h.messages[0].to, ['Trey@targetroofers.com', 'service@targetroofers.com'])
  assert.equal(h.messages[0].replyTo, 'service@targetroofers.com')
})

test('configured recipient overrides are preserved, and phone-only leads reply to the office', async () => {
  const h = harness({ env: { CONTACT_NOTIFY_TO: 'office@example.com' } })
  await h.actions.submitContactLead({ ...contact, email: '', source: 'contact-page' })
  assert.deepEqual(h.messages[0].to, ['office@example.com'])
  assert.equal(h.messages[0].replyTo, 'office@example.com')
})

test('invalid submissions never save or send', async () => {
  const h = harness()
  for (const result of [
    await h.actions.submitContactLead({ ...contact, phone: 'invalid' }),
    await h.actions.submitSoftwashLead({ ...cleaning, email: 'invalid' }),
    await h.intake.submitProspectIntake({ ...prospect, salesperson: 'Unknown' }),
  ]) assert.equal(result.success, false)
  assert.deepEqual(h.inserts, [])
  assert.deepEqual(h.messages, [])
})

for (const config of [{ saveError: { message: 'Save failed' } }, { missingRow: true }]) {
  test(`database failure or missing saved ID never reports success or sends mail: ${JSON.stringify(config)}`, async () => {
    const h = harness(config)
    assert.equal((await h.actions.submitContactLead(contact)).success, false)
    assert.equal((await h.intake.submitProspectIntake(prospect)).success, false)
    assert.deepEqual(h.messages, [])
  })
}

test('SMTP failure preserves saved records and reports notified=false for leads and Intake', async () => {
  const h = harness({ mailSent: false })
  const lead = await h.actions.submitContactLead(contact)
  const intake = await h.intake.submitProspectIntake(prospect)
  assert.equal(lead.success, true)
  assert.equal(lead.notified, false)
  assert.equal(lead.leadId, 'test-lead-1')
  assert.deepEqual(plain(intake), { success: true, notified: false })
  assert.equal(h.inserts.length, 2)
  assert.deepEqual(h.updates, [])
})

function smtpHarness(sendMail, { env = { SMTP_HOST: 'smtp.example.com', SMTP_USER: 'test', SMTP_PASS: 'test-only', NOTIFY_FROM: 'website@example.com' }, timeoutNow = false } = {}) {
  const messages = [], cleared = []
  const notify = load('src/lib/notify.ts', {
    'server-only': {}, nodemailer: { createTransport: () => ({ sendMail(message) { messages.push(plain(message)); return sendMail(message) } }) },
  }, {
    process: { env },
    setTimeout(callback) { if (timeoutNow) queueMicrotask(callback); return 1 },
    clearTimeout(id) { cleared.push(id) },
  })
  return { notify, messages, cleared }
}

const notice = { to: ['rep@example.com', 'office@example.com'], subject: 'TEST', heading: 'TEST', fields: [['Customer', '<script>test</script>']], replyTo: 'customer@example.com' }

test('SMTP acceptance retains the customer reply header and escapes customer-provided HTML', async () => {
  const h = smtpHarness(async () => ({ accepted: notice.to, rejected: [] }))
  assert.equal((await h.notify.sendNotification(notice)).sent, true)
  assert.equal(h.messages[0].replyTo, 'customer@example.com')
  assert.match(h.messages[0].html, /&lt;script&gt;test&lt;\/script&gt;/)
  assert.deepEqual(h.cleared, [1])
})

for (const info of [
  { accepted: ['rep@example.com'], rejected: ['office@example.com'] },
  { accepted: ['rep@example.com'], rejected: [] },
  { accepted: [], rejected: [] },
]) test('partial or absent SMTP acceptance cannot mark the whole notification sent', async () => {
  const h = smtpHarness(async () => info)
  assert.equal((await h.notify.sendNotification(notice)).sent, false)
  assert.deepEqual(h.cleared, [1])
})

test('missing credentials, rejected sends, and timeouts return an explicit notification failure', async () => {
  const absent = smtpHarness(async () => { throw new Error('Must not send') }, { env: {} })
  assert.equal((await absent.notify.sendNotification(notice)).sent, false)
  assert.equal(absent.messages.length, 0)
  const rejected = smtpHarness(async () => { throw new Error('Authentication failed') })
  assert.equal((await rejected.notify.sendNotification(notice)).sent, false)
  const timeout = smtpHarness(() => new Promise(() => {}), { timeoutNow: true })
  assert.equal((await timeout.notify.sendNotification(notice)).sent, false)
  assert.deepEqual(timeout.cleared, [1])
})

function chatHarness(leadData, { env = {}, mailSent = true, saveError = null } = {}) {
  const inserts = [], messages = [], order = [], modelInstructions = []
  const notify = load('src/lib/notify.ts', { 'server-only': {}, nodemailer: {} })
  const markers = load('src/lib/chat-lead-marker.ts')
  class GoogleGenAI {
    models = { generateContent: async request => {
      modelInstructions.push(request.config.systemInstruction)
      return { text: `[SUBMIT_LEAD:${JSON.stringify(leadData)}]` }
    } }
  }
  const mocks = {
    'next/server': { NextResponse: { json: (body, options) => ({ body: plain(body), status: options?.status ?? 200 }) } },
    '@google/genai': { GoogleGenAI },
    '@/lib/chat-lead-marker': markers,
    '@/lib/supabase': { supabase: { from: table => ({ insert: record => {
      order.push('save'); inserts.push({ table, record: plain(record) })
      return { select: () => ({ single: async () => ({ data: saveError ? null : { id: 'chat-test-1' }, error: saveError }) }) }
    } }) } },
    '@/lib/notify': { recipientList: notify.recipientList, sendNotification: async message => {
      order.push('notify'); messages.push(plain(message)); return { sent: mailSent, error: mailSent ? undefined : 'Test-only SMTP failure' }
    } },
  }
  return { ...load('src/app/api/chat/route.ts', mocks, { process: { env: { GOOGLE_AI_API_KEY: 'mock-only', ...env } } }), inserts, messages, order, modelInstructions }
}

const chatLead = { firstName: 'Test', lastName: 'Customer', email: 'customer@example.com', phone: '202-555-0123', address: 'TEST ONLY', roofType: 'Metal', issue: 'Leaking roof' }
const chatRequest = { json: async () => ({ messages: [{ role: 'user', content: 'TEST ONLY' }] }) }

test('structured repair chatbot requests notify Service and retain save order, subject and customer Reply-To', async () => {
  const h = chatHarness({ ...chatLead, requestType: 'service' })
  const response = await h.POST(chatRequest)
  assert.deepEqual(h.order, ['save', 'notify'])
  assert.deepEqual(h.messages[0].to, ['service@targetroofers.com'])
  assert.equal(h.messages[0].replyTo, 'customer@example.com')
  assert.equal(h.messages[0].subject, 'Website Lead - Chatbot')
  assert.equal(h.inserts[0].record.service, 'Metal')
  assert.equal(response.body.lead.notified, true)
  assert.match(h.modelInstructions[0], /requestType/)
})

for (const requestType of ['estimate', undefined, 'unknown', 'service@outside.example', 'Service', ' service ', null, true, ['service'], { type: 'service' }]) {
  test(`chatbot ${String(requestType)} request retains the existing projects recipient`, async () => {
    const h = chatHarness({ ...chatLead, requestType })
    await h.POST(chatRequest)
    assert.deepEqual(h.messages[0].to, ['projects@targetroofers.com'])
  })
}

test('structured chatbot Service route honors existing recipient configuration', async () => {
  const h = chatHarness({ ...chatLead, requestType: 'service' }, { env: { CONTACT_NOTIFY_TO: 'service-team@example.com', LEAD_NOTIFY_TO: 'sales@example.com' } })
  await h.POST(chatRequest)
  assert.deepEqual(h.messages[0].to, ['service-team@example.com'])
})

test('chatbot estimates honor configured Projects recipients', async () => {
  const h = chatHarness({ ...chatLead, requestType: 'estimate' }, { env: { CONTACT_NOTIFY_TO: 'service-team@example.com', LEAD_NOTIFY_TO: 'sales@example.com' } })
  await h.POST(chatRequest)
  assert.deepEqual(h.messages[0].to, ['sales@example.com'])
})

test('chatbot notification failure keeps the saved lead and reports notified=false', async () => {
  const h = chatHarness({ ...chatLead, requestType: 'service' }, { mailSent: false })
  const response = await h.POST(chatRequest)
  assert.equal(h.inserts.length, 1)
  assert.equal(response.body.lead.notified, false)
  assert.match(response.body.message, /could not notify/)
})

test('chatbot save failure never attempts a notification', async () => {
  const h = chatHarness({ ...chatLead, requestType: 'service' }, { saveError: { message: 'Test-only database failure' } })
  const response = await h.POST(chatRequest)
  assert.equal(response.status, 500)
  assert.deepEqual(h.messages, [])
})
