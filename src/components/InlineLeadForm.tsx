'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Send, CheckCircle, Phone } from 'lucide-react'
import { submitContactLead } from '@/app/actions'
import { trackLead, attributionSummary } from '@/lib/tracking'

interface InlineLeadFormProps {
  defaultService?: string
  title?: string
  subtitle?: string
  buttonText?: string
  darkTheme?: boolean
  formId?: string
  headingLevel?: 2 | 3
}

export default function InlineLeadForm({
  defaultService = '',
  title = 'Request a Roof Repair Survey',
  subtitle = 'Share your roof concerns and request an evaluation and written estimate.',
  buttonText = 'Submit Repair Request',
  darkTheme = false,
  formId = 'lead',
  headingLevel = 3,
}: InlineLeadFormProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    zip: '',
    service: defaultService,
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notificationFailed, setNotificationFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[e.target.name]
        return next
      })
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setErrors({})
    setSuccess(false)
    setNotificationFailed(false)

    try {
      const res = await submitContactLead({ ...form, attribution: attributionSummary(), source: 'estimate' })
      if (res.success) {
        trackLead(res.leadId, { form_id: formId, service: form.service })
        setNotificationFailed('notified' in res && res.notified === false)
        setSuccess(true)
        setForm({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          streetAddress: '',
          city: '',
          zip: '',
          service: defaultService,
          message: '',
        })
      } else {
        setErrors(res.errors || {})
        setError(res.error || 'Please correct the highlighted fields.')
      }
    } catch (err) {
      setError('A connection error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const textClass = darkTheme ? 'text-white' : 'text-[var(--black)]'
  const subtextClass = darkTheme ? 'text-white/80' : 'text-[var(--gray-600)]'
  const bgClass = darkTheme ? 'bg-black/45 border border-white/15 backdrop-blur-3xl shadow-2xl' : 'bg-white shadow-xl border border-[var(--gray-200)]'
  const labelClass = darkTheme ? 'text-white/95' : 'text-[var(--gray-700)]'
  const optionalClass = darkTheme ? 'text-white/50' : 'text-[var(--gray-400)]'
  const inputClass = (fieldName: string) => `w-full px-4 py-2.5 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
    errors[fieldName]
      ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
      : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
  }`
  // aria props shared by every input that can surface an inline error
  const ariaProps = (fieldName: string, required = false) => ({
    'aria-invalid': errors[fieldName] ? true : undefined,
    'aria-describedby': errors[fieldName] ? `${formId}-${fieldName}-error` : undefined,
    'aria-required': required || undefined,
  })

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-lg p-8 text-center border-t-4 border-[var(--red)] ${bgClass}`}
      >
        <CheckCircle className="h-12 w-12 text-[var(--red)] mx-auto mb-4 animate-bounce" />
        <Heading className={`text-2xl font-bold uppercase mb-2 font-[family-name:var(--font-display)] ${textClass}`}>
          Thank You!
        </Heading>
        <p className={subtextClass}>
          {notificationFailed
            ? 'Your request is saved, but we could not notify the team. Please call 239-332-5707 and mention your website request.'
            : 'Your request is saved. Our team will follow up to discuss the next step.'}
        </p>
        {notificationFailed && <a href="tel:+12393325707" className="inline-block mt-4 font-semibold text-[var(--red)] underline underline-offset-4">Call 239-332-5707</a>}
      </div>
    )
  }

  return (
    <div className={`lead-form relative overflow-hidden rounded-lg p-6 sm:p-8 border-t-4 border-[var(--red)] ${bgClass}`}>
      {/* Oversized reticle watermark, bleeding off the upper-right */}
      {darkTheme && (
        <Image
          src="/images/brand/reticle.png"
          alt=""
          aria-hidden="true"
          width={508}
          height={509}
          className="pointer-events-none absolute -top-24 -right-24 z-0 h-72 w-72 max-w-none rotate-12 opacity-[0.12] brightness-0 invert"
        />
      )}
      <div className="relative z-10 mb-6">
        <Heading className={`text-2xl sm:text-3xl font-bold uppercase tracking-wide font-[family-name:var(--font-display)] ${textClass}`}>
          {title}
        </Heading>
        <p className={`text-sm mt-1 leading-relaxed ${subtextClass}`}>
          {subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-4" noValidate>
        {error && (
          <div role="alert" className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-firstName`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              First Name <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              id={`${formId}-firstName`}
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className={inputClass('firstName')}
              placeholder="First Name"
              autoComplete="given-name"
              {...ariaProps('firstName', true)}
            />
            {errors.firstName && (
              <p id={`${formId}-firstName-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.firstName}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${formId}-lastName`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              Last Name <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              id={`${formId}-lastName`}
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className={inputClass('lastName')}
              placeholder="Last Name"
              autoComplete="family-name"
              {...ariaProps('lastName', true)}
            />
            {errors.lastName && (
              <p id={`${formId}-lastName-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-phone`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              Phone <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="tel"
              id={`${formId}-phone`}
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass('phone')}
              placeholder="(239) 332-5707"
              autoComplete="tel"
              {...ariaProps('phone', true)}
            />
            {errors.phone && (
              <p id={`${formId}-phone-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${formId}-email`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              Email <span className={`normal-case font-normal tracking-normal ${optionalClass}`}>(optional)</span>
            </label>
            <input
              type="email"
              id={`${formId}-email`}
              name="email"
              value={form.email}
              onChange={handleChange}
              className={inputClass('email')}
              placeholder="email@example.com"
              autoComplete="email"
              {...ariaProps('email')}
            />
            {errors.email && (
              <p id={`${formId}-email-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-streetAddress`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
            Street Address <span className={`normal-case font-normal tracking-normal ${optionalClass}`}>(optional)</span>
          </label>
          <input
            type="text"
            id={`${formId}-streetAddress`}
            name="streetAddress"
            value={form.streetAddress}
            onChange={handleChange}
            className={inputClass('streetAddress')}
            placeholder="Property Address"
            autoComplete="street-address"
            {...ariaProps('streetAddress')}
          />
          {errors.streetAddress && (
            <p id={`${formId}-streetAddress-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
              {errors.streetAddress}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-city`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              City <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              id={`${formId}-city`}
              name="city"
              value={form.city}
              onChange={handleChange}
              className={inputClass('city')}
              placeholder="City"
              autoComplete="address-level2"
              {...ariaProps('city', true)}
            />
            {errors.city && (
              <p id={`${formId}-city-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.city}
              </p>
            )}
          </div>
          <div>
            <label htmlFor={`${formId}-zip`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              ZIP Code <span className={`normal-case font-normal tracking-normal ${optionalClass}`}>(optional)</span>
            </label>
            <input
              type="text"
              id={`${formId}-zip`}
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className={inputClass('zip')}
              placeholder="ZIP"
              autoComplete="postal-code"
              inputMode="numeric"
              {...ariaProps('zip')}
            />
            {errors.zip && (
              <p id={`${formId}-zip-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.zip}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label htmlFor={`${formId}-service`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              Service <span className="text-[var(--red)]">*</span>
            </label>
            <select
              id={`${formId}-service`}
              name="service"
              value={form.service}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border rounded bg-white text-base text-[var(--black)] focus:outline-none focus:ring-2 transition-colors appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
              {...ariaProps('service', true)}
            >
              <option value="">Select service...</option>
              <option value="repairs">Roof Repair</option>
                <option value="inspection">Roof Inspection</option>
              <option value="emergency-storm-repair">Emergency / Storm Damage</option>
              <option value="maintenance-plans">Maintenance Plan</option>
              <option value="reroofing">Reroofing</option>
              <option value="new-roofs">New Roof</option>
            </select>
            {errors.service && (
              <p id={`${formId}-service-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.service}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-message`} className={`block text-xs font-semibold mb-1 uppercase tracking-wider font-[family-name:var(--font-display)] ${labelClass}`}>
              Describe Needs <span className="text-[var(--red)]">*</span>
            </label>
            <input
              type="text"
              id={`${formId}-message`}
              name="message"
              value={form.message}
              onChange={handleChange}
              className={inputClass('message')}
              placeholder="e.g. Active leak in main office ceiling"
              {...ariaProps('message', true)}
            />
            {errors.message && (
              <p id={`${formId}-message-error`} className="mt-0.5 text-[10px] font-semibold text-red-600">
                {errors.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--red)] text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-[var(--red-dark)] transition-colors shadow-lg hover:shadow-xl font-[family-name:var(--font-display)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4.5 h-4.5" />
          {loading ? 'Submitting Request...' : buttonText}
        </button>

        {/* For an active leak, call to discuss the situation directly. */}
        <p className={`flex items-center justify-center gap-1.5 text-xs ${subtextClass}`}>
          <Phone className="w-3.5 h-3.5 text-[var(--red)]" aria-hidden="true" />
          Roof emergency?
          <a
            href="tel:+12393325707"
            className="font-bold text-[var(--red)] hover:underline"
          >
            Call (239) 332-5707
          </a>
        </p>

        <p className="text-[10px] text-[var(--gray-400)] leading-relaxed text-center">
          By submitting, you authorize Target Roofing to text/call/email you regarding your request.
        </p>
      </form>
    </div>
  )
}
