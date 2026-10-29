'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import { submitContactLead } from '@/app/actions'
import { trackLead, attributionSummary } from '@/lib/tracking'
import { contactFormSource } from '@/lib/form-intent'
import AnimateIn from '@/components/AnimateIn'
import RoofSchematic from '@/components/RoofSchematic'

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: '',
    zip: '',
    service: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    // Clear error when field changes
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

    try {
      const source = contactFormSource(form.service, window.location.search)
      const res = await submitContactLead({ ...form, attribution: attributionSummary(), source })
      if (res.success) {
        trackLead(res.leadId, { form_id: source === 'estimate' ? 'free-estimate' : 'contact-page', service: form.service })
        setSuccess(true)
        setForm({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          streetAddress: '',
          city: '',
          zip: '',
          service: '',
          message: '',
        })
      } else {
        setErrors(res.errors || {})
        setError(res.error || 'Please correct the highlighted fields.')
      }
    } catch {
      setError('A connection error occurred. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative bg-[var(--black)] text-white overflow-hidden">
        {/* Roof schematic background */}
        <RoofSchematic className="text-white/[0.04] z-0" />

        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0" />

        {/* Diagonal accent */}
        <div
          className="absolute top-0 right-0 w-1/3 h-full bg-[var(--red)] hidden lg:block"
          style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-28 md:py-36 lg:py-44">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <AnimateIn animation="fade-up">
              <p className="inline-flex items-center gap-2 text-[var(--red-light)] text-sm font-bold uppercase tracking-[0.2em] mb-6 font-[family-name:var(--font-display)]">
                <span className="w-8 h-[2px] bg-[var(--red)]" />
                Get In Touch
              </p>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={100}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] mb-6 font-[family-name:var(--font-display)]">
                Contact <span className="text-[var(--red)]">Us</span>
              </h1>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={200}>
              <p className="text-xl md:text-2xl font-semibold text-white mb-4 font-[family-name:var(--font-display)]">
                You Call. We Respond. It&apos;s That Simple.
              </p>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={300}>
              <p className="text-lg md:text-xl text-[var(--gray-300)] leading-relaxed max-w-2xl">
                Hiring a roofer shouldn&apos;t be difficult. Target Roofing is
                ready to respond to your call 24 hours a day, seven days a week,
                365 days a year.
              </p>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ─── FORM + CONTACT INFO ─── */}
      <section className="relative bg-[var(--gray-50)] py-20 md:py-28 overflow-hidden">
        {/* Monochrome aerial background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/bg-aerial-mono.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.04]"
            sizes="100vw"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* ── Left: Contact Form ── */}
            <AnimateIn animation="fade-up" className="lg:col-span-3">
              <div className="bg-white rounded-sm shadow-xl p-4 xs:p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--black)] mb-2 font-[family-name:var(--font-display)]">
                  Request a Free Estimate
                </h2>
                <p className="text-[var(--gray-500)] mb-8">
                  Fill out the form below and we&apos;ll get back to you as soon
                  as possible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {success && (
                    <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-sm font-semibold">
                      Thank you for your inquiry! A member of our team will be in touch shortly.
                    </div>
                  )}
                  {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-semibold">
                      {error}
                    </div>
                  )}
                  {/* First + Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                      >
                        First Name <span className="text-[var(--red)]">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                          errors.firstName
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                            : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                        }`}
                        placeholder="John"
                        autoComplete="given-name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                      >
                        Last Name <span className="text-[var(--red)]">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                          errors.lastName
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                            : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                        }`}
                        placeholder="Smith"
                        autoComplete="family-name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                      >
                        Phone <span className="text-[var(--red)]">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                          errors.phone
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                            : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                        }`}
                        placeholder="(239) 555-0100"
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                      >
                        Email <span className="text-[var(--red)]">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                          errors.email
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                            : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                        }`}
                        placeholder="john@example.com"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label
                      htmlFor="streetAddress"
                      className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                    >
                      Street Address <span className="text-[var(--red)]">*</span>
                    </label>
                    <input
                      type="text"
                      id="streetAddress"
                      name="streetAddress"
                      value={form.streetAddress}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                        errors.streetAddress
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                      }`}
                      placeholder="123 Main Street"
                      autoComplete="street-address"
                    />
                    {errors.streetAddress && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {errors.streetAddress}
                      </p>
                    )}
                  </div>

                  {/* City + ZIP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                      >
                        City <span className="text-[var(--red)]">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                          errors.city
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                            : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                        }`}
                        placeholder="Fort Myers"
                        autoComplete="address-level2"
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="zip"
                        className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                      >
                        ZIP Code <span className="text-[var(--red)]">*</span>
                      </label>
                      <input
                        type="text"
                        id="zip"
                        name="zip"
                        value={form.zip}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors ${
                          errors.zip
                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                            : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                        }`}
                        placeholder="33901"
                        autoComplete="postal-code"
                      />
                      {errors.zip && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                          {errors.zip}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Service of Interest */}
                  <div>
                    <label
                      htmlFor="service"
                      className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                    >
                      Service of Interest{' '}
                      <span className="text-[var(--red)]">*</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] focus:outline-none focus:ring-2 transition-colors appearance-none ${
                        errors.service
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                      }}
                    >
                      <option value="">Select a service...</option>
                      <option value="repairs">Roof Repair</option>
                      <option value="emergency-storm-repair">Emergency / Storm Damage</option>
                      <option value="maintenance-plans">Maintenance Plans</option>
                      <option value="reroofing">Reroofing</option>
                      <option value="new-roofs">New Roofs</option>
                      <option value="free-estimate">Free Estimate</option>
                    </select>
                    {errors.service && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {errors.service}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-[var(--gray-700)] mb-1.5"
                    >
                      Describe Your Needs{' '}
                      <span className="text-[var(--red)]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded bg-white text-base text-[var(--black)] placeholder-[var(--gray-400)] focus:outline-none focus:ring-2 transition-colors resize-vertical ${
                        errors.message
                          ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                          : 'border-[var(--gray-300)] focus:ring-[var(--red)] focus:border-[var(--red)]'
                      }`}
                      placeholder="Tell us about your roofing project..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--red)] text-white text-sm font-bold uppercase tracking-wide rounded hover:bg-[var(--red-dark)] transition-colors shadow-lg hover:shadow-xl font-[family-name:var(--font-display)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending Request...' : 'Request Free Estimate'}
                  </button>

                  {/* Disclaimer */}
                  <p className="text-xs text-[var(--gray-400)] leading-relaxed">
                    By submitting this form, you authorize Target Roofing to
                    text, call, and email you regarding your inquiry. Message and
                    data rates may apply.
                  </p>
                </form>
              </div>
            </AnimateIn>

            {/* ── Right: Contact Info Cards ── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Headquarters */}
              <AnimateIn animation="fade-up" delay={100}>
              <div className="group bg-white rounded-sm shadow-md p-4 sm:p-6 border-l-4 border-[var(--red)] hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--red)]/10 rounded-sm flex items-center justify-center group-hover:bg-[var(--red)] transition-colors">
                    <MapPin className="w-6 h-6 text-[var(--red)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--gray-400)] mb-1 font-[family-name:var(--font-display)]">
                      Headquarters
                    </h3>
                    <p className="text-[var(--black)] font-medium leading-relaxed text-sm sm:text-base">
                      7011 Nalle Grade Rd
                      <br />
                      North Fort Myers, Florida 33917
                    </p>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=7011+Nalle+Grade+Rd+North+Fort+Myers+FL+33917"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-xs font-bold uppercase tracking-wider text-[var(--red)] hover:text-[var(--red-dark)] transition-colors min-h-[44px] px-2 py-1"
                    >
                      Get Directions &rarr;
                    </a>
                  </div>
                </div>
              </div>
              </AnimateIn>

              {/* Phone */}
              <AnimateIn animation="fade-up" delay={200}>
              <div className="group bg-white rounded-sm shadow-md p-4 sm:p-6 border-l-4 border-[var(--red)] hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--red)]/10 rounded-sm flex items-center justify-center group-hover:bg-[var(--red)] transition-colors">
                    <Phone className="w-6 h-6 text-[var(--red)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--gray-400)] mb-1 font-[family-name:var(--font-display)]">
                      Phone
                    </h3>
                    <a
                      href="tel:+12393325707"
                      className="text-[var(--black)] font-medium text-base sm:text-lg hover:text-[var(--red)] transition-colors break-all inline-block py-3 px-2"
                    >
                      (239) 332-5707
                    </a>
                  </div>
                </div>
              </div>
              </AnimateIn>

              {/* Email */}
              <AnimateIn animation="fade-up" delay={300}>
              <div className="group bg-white rounded-sm shadow-md p-4 sm:p-6 border-l-4 border-[var(--red)] hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--red)]/10 rounded-sm flex items-center justify-center group-hover:bg-[var(--red)] transition-colors">
                    <Mail className="w-6 h-6 text-[var(--red)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--gray-400)] mb-1 font-[family-name:var(--font-display)]">
                      Email
                    </h3>
                    <a
                      href="mailto:projects@targetroofers.com"
                      className="text-[var(--black)] font-medium text-sm sm:text-base hover:text-[var(--red)] transition-colors break-all inline-block py-3 px-2"
                    >
                      projects@targetroofers.com
                    </a>
                  </div>
                </div>
              </div>
              </AnimateIn>

              {/* Hours */}
              <AnimateIn animation="fade-up" delay={400}>
              <div className="group bg-white rounded-sm shadow-md p-4 sm:p-6 border-l-4 border-[var(--red)] hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--red)]/10 rounded-sm flex items-center justify-center group-hover:bg-[var(--red)] transition-colors">
                    <Clock className="w-6 h-6 text-[var(--red)] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--gray-400)] mb-1 font-[family-name:var(--font-display)]">
                      Hours
                    </h3>
                    <p className="text-[var(--black)] font-medium leading-relaxed text-sm sm:text-base">
                      Monday &ndash; Friday: 7:00 AM &ndash; 6:00 PM
                      <br />
                      Saturday: 7:00 AM &ndash; 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
              </AnimateIn>

              {/* Emergency Service */}
              <AnimateIn animation="fade-up" delay={500}>
              <div className="bg-[var(--black)] rounded-sm shadow-md p-4 sm:p-6 text-white">
                <div className="noise-overlay absolute inset-0 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 bg-[var(--red)] rounded-full animate-pulse" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--red-light)] font-[family-name:var(--font-display)]">
                      Emergency Service
                    </h3>
                  </div>
                  <p className="text-[var(--gray-300)] mb-4 text-sm sm:text-base">
                    24/7 Emergency Roof Repairs Available
                  </p>
                  <a
                    href="tel:+12393325707"
                    className="inline-flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-lg xs:text-2xl md:text-3xl font-bold text-white hover:text-[var(--red-light)] transition-colors font-[family-name:var(--font-display)] break-all max-w-full min-h-[44px] py-1.5 px-2"
                  >
                    <Phone className="w-4 h-4 xs:w-7 xs:h-7 flex-shrink-0" />
                    239-332-5707
                  </a>
                </div>
              </div>
              </AnimateIn>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GOOGLE MAPS ─── */}
      <section className="w-full">
        <iframe
          title="Target Roofing Headquarters Location"
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3562.630652637541!2d-81.8415015!3d26.7561601!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88db41e670a84551%3A0xda232052a7b50484!2sTarget%20Roofing!5e0!3m2!1sen!2sus!4v1793300734518!5m2!1sen!2sus"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </section>
    </>
  )
}
