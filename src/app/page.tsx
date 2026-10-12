'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield,
  Wrench,
  Building,
  ChevronRight,
  ChevronLeft,
  Star,
  Award,
  ArrowRight,
  Home,
  CalendarCheck,
  CheckCircle,
  Quote,
  MapPin,
  Play,
  Crosshair,
  ShieldCheck,
  Phone,
  CloudLightning,
} from 'lucide-react'
import InlineLeadForm from '@/components/InlineLeadForm'
import AnimateIn from '@/components/AnimateIn'
import { getShowcaseVideos } from '@/app/actions'
import { googleReviews } from '@/lib/google-reviews'
import FALLBACK_VIDEOS from '@/data/showcase-videos.json'

/* ------------------------------------------------------------------ */
/*  Animated Counter Hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(end)
  useEffect(() => {
    if (!start || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let startTime: number | null = null
    let raf: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, start])
  return count
}

/* ------------------------------------------------------------------ */
/*  Intersection Observer Hook                                         */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ================================================================== */
/*  HOMEPAGE                                                           */
/* ================================================================== */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustSignalsSection />
      <ServicesSection />
      <VideoShowcaseSection />
      <RepairFormSection />
      <StatsSection />
      <CommunitySection />
      <PortfolioSection />
      <TestimonialsSection />
      <NewsSection />
      <PartnersSection />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  TRUST SIGNALS                                                      */
/* ------------------------------------------------------------------ */
function TrustSignalsSection() {
  return (
    <section className="bg-blueprint-dark py-6 border-b border-white/10 text-white relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center text-center">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 flex-shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-bold text-sm tracking-wider uppercase font-[family-name:var(--font-display)]">GAF Master Elite</div>
              <div className="text-xs text-[var(--gray-400)]">Certified Contractor</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 flex-shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-bold text-sm tracking-wider uppercase font-[family-name:var(--font-display)]">A+ Accredited</div>
              <div className="text-xs text-[var(--gray-400)]">Better Business Bureau</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 flex-shrink-0">
              <Star className="h-6 w-6 fill-current text-[var(--red)]" />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-bold text-sm tracking-wider uppercase font-[family-name:var(--font-display)]">{googleReviews.rating} Google Rating</div>
              <div className="text-xs text-[var(--gray-400)]">{googleReviews.count} Google Reviews</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 flex-shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="text-center sm:text-left">
              <div className="font-bold text-sm tracking-wider uppercase font-[family-name:var(--font-display)]">Licensed & Insured</div>
              <div className="text-xs text-[var(--gray-400)]">License #CCC1334168</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  1. HERO                                                            */
/* ------------------------------------------------------------------ */
function HeroSection() {
  const [showBackgroundVideo, setShowBackgroundVideo] = useState(false)
  useEffect(() => {
    // CSS hiding alone still lets the mobile browser load YouTube scripts.
    const desktop = window.matchMedia('(min-width: 768px)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & {connection?: {saveData?: boolean}}).connection
    const update = () => setShowBackgroundVideo(desktop.matches && !motion.matches && !connection?.saveData)
    update()
    desktop.addEventListener('change', update)
    motion.addEventListener('change', update)
    return () => {desktop.removeEventListener('change', update); motion.removeEventListener('change', update)}
  }, [])
  const audiences = ['Homeowners', 'Property Managers', 'Property Owners', 'Condos/HOAs', 'Contractors']

  return (
    <section className="mobile-home-hero relative -mt-[7.5rem] min-h-screen lg:h-screen overflow-hidden flex items-center pt-36 pb-12 lg:pt-[7.5rem] lg:pb-0 bg-[var(--black)]">
      {/* YouTube video background
          - bg-black prevents flash of white while iframe loads
          - YouTube params handle autoplay, muted, loop, playsInline
          - preload="metadata" not applicable to iframes
          - TODO: Add a WebP poster image for the video container to improve
            perceived load time (show static frame while YouTube iframe loads) */}
      <div className="absolute inset-0 z-0 bg-black">
        {showBackgroundVideo && <iframe
          className="hidden md:block absolute top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ minWidth: '100vw', minHeight: '100vh' }}
          src="https://www.youtube.com/embed/yz5H6FkrWhs?autoplay=1&mute=1&loop=1&playlist=yz5H6FkrWhs&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&enablejsapi=1&start=3&origin=https://targetroofers.com"
          title="Target Roofing Background Video"
          allow="autoplay; encrypted-media"
          allowFullScreen
          loading="lazy"
        />}
        {/* Mobile fallback: no iframe/video load on small screens for performance */}
        <div hidden={showBackgroundVideo} className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black">
          <Image
            src="/images/backgrounds/hero-fallback.jpg"
            alt="Target Roofing Background Fallback"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-50"
          />
        </div>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/85 via-black/70 to-black/85" />

      {/* Content */}
      <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="hero-content-grid grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="col-span-1 lg:col-span-7 text-left text-white flex flex-col justify-center">
            <h1 className="animate-fade-in-up mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl font-[family-name:var(--font-display)] uppercase leading-[0.82]">
              Extend Your Roof&apos;s Life<br />
              <span className="text-[var(--red)]">With Expert Repairs</span>
            </h1>

            <p className="hidden sm:block animate-fade-in-up mb-6 text-base sm:text-lg text-white/90 leading-relaxed font-light font-[family-name:var(--font-body)]"
               style={{ animationDelay: '0.15s' }}>
              A small leak fixed today is a re-roof you don&apos;t pay for next year. We repair and maintain residential and commercial roofs across Southwest Florida &mdash; and when a roof truly is done, we&apos;ll show you the photos and manage the replacement ourselves.
            </p>

            <p className="sm:hidden mb-5 text-base text-white/90 leading-relaxed">
              Roof leaks, storm damage or routine maintenance? Get a roof survey and a clear repair estimate from your local Target Roofing team.
            </p>

            <p className="animate-fade-in-up mb-6 text-sm sm:text-base font-semibold tracking-wide text-white/80 uppercase font-[family-name:var(--font-display)]"
              style={{ animationDelay: '0.2s' }}
            >
              Serving Fort Myers, Cape Coral, Naples &amp; Sarasota
            </p>

            {/* Audience pills */}
            <div
              className="animate-fade-in-up mb-8 hidden sm:flex flex-wrap gap-2.5"
              style={{ animationDelay: '0.3s' }}
            >
              {audiences.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm transition-colors hover:bg-[var(--red)] hover:border-[var(--red)]"
                >
                  {a}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div
              className="animate-fade-in-up flex flex-col gap-4 sm:flex-row"
              style={{ animationDelay: '0.4s' }}
            >
              <a
                href="#hero-request"
                className="inline-flex items-center justify-center gap-2 rounded bg-brand-gradient hover-bg-brand-gradient px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                <Wrench className="h-4.5 w-4.5" />
                Schedule Repair
              </a>
              <a
                href="tel:+12393325707"
                className="group hidden sm:inline-flex items-center justify-center gap-2 rounded border-2 border-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[var(--black)]"
              >
                <CloudLightning className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                24/7 Emergency? Call Now
              </a>
            </div>
          </div>

          {/* Right Column: Lead Capture Form */}
          <div id="hero-request"
            className="animate-fade-in-up col-span-1 lg:col-span-5 w-full relative z-10"
            style={{ animationDelay: '0.45s' }}
          >
            <InlineLeadForm
              defaultService="repairs"
              darkTheme={true}
              title="Get a Roof Repair Survey"
              subtitle="SWFL's local, reliable roofing experts. 24-hour response."
              buttonText="Schedule Inspection Survey"
              formId="hero"
              headingLevel={2}
            />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-[2] -translate-x-1/2 animate-bounce hidden lg:block">
        <div className="h-10 w-6 rounded-full border-2 border-white/40 flex items-start justify-center pt-2">
          <div className="h-2 w-1 bg-white/70 rounded-full" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  2. SERVICES                                                        */
/* ------------------------------------------------------------------ */
const services = [
  {
    iconSrc: '/images/icons/roof-repair.png',
    title: 'Roof Repair',
    desc: 'Leak tracing, storm damage, and worn flashing fixed fast — before a small problem becomes a new roof.',
    href: '/roofing-services/roof-repair',
  },
  {
    iconSrc: '/images/icons/replacement-transition.png',
    title: 'Roof Replacement',
    desc: 'When a repair no longer makes financial sense, we tell you straight and manage the re-roof start to finish.',
    href: '/roofing-services/roof-replacement',
  },
  {
    iconSrc: '/images/icons/proactive-maintenance.png',
    title: 'Proactive Maintenance',
    desc: 'Preventative checkups and minor repairs designed to maximize roof service life and satisfy warranties.',
    href: '/commercial-hoa-roof-maintenance',
  },
  {
    iconSrc: '/images/icons/new-construction.png',
    title: 'New Construction',
    desc: 'Delivering top-tier new roof installations on-time and on-budget, built to withstand harsh weather.',
    href: '/roofing-services#new-roofs',
  },
]

function ServicesSection() {
  return (
    <section className="bg-blueprint-light py-24 lg:py-32 relative">
      {/* Subtle monochrome background texture */}
      <div className="absolute inset-0">
        <Image src="/images/backgrounds/bg-tpo-mono.jpg" alt="" fill className="object-cover opacity-[0.12]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimateIn animation="fade-up" className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--black)] font-[family-name:var(--font-display)] uppercase mb-6">
            Roof Repair for Homes &amp; Commercial Buildings
          </h2>
          <p className="text-lg text-[var(--gray-600)] leading-relaxed">
            We fix leaks fast and keep your roof going for years. You&apos;ll get photo reports, itemized pricing, and a straight answer on whether you need a repair or a replacement &mdash; and when it&apos;s time to replace, we plan it around your home or operations.
          </p>
        </AnimateIn>

        {/* Service cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            return (
              <AnimateIn key={service.title} animation="fade-up" delay={i * 100}>
                <Link
                  href={service.href}
                  className="group relative rounded-lg border border-[var(--gray-200)] bg-white p-8 text-center shadow-sm transition-all duration-500 hover:shadow-xl hover:border-[var(--red)] hover:-translate-y-1 block h-full"
                >
                  {/* Red top accent */}
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-lg bg-[var(--red)] scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />

                  <div className="mb-5 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--red)]/10 transition-colors group-hover:bg-[var(--red)]/15 overflow-hidden">
                    <Image src={service.iconSrc} alt={service.title} width={56} height={56} className="w-14 h-14 object-contain" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold uppercase text-[var(--black)] font-[family-name:var(--font-display)]">
                    {service.title}
                  </h3>
                  <p className="mb-5 text-[var(--gray-600)] leading-relaxed text-sm">
                    {service.desc}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-[var(--red)] group-hover:gap-2 transition-all">
                    Learn More <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </AnimateIn>
            )
          })}
        </div>

        {/* Service Areas */}
        <AnimateIn animation="fade-up" delay={200} className="mt-16">
          <div className="rounded-lg border border-[var(--gray-200)] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-5 w-5 text-[var(--red)]" />
              <h3 className="text-lg font-bold uppercase tracking-wide text-[var(--black)] font-[family-name:var(--font-display)]">
                Service Areas
              </h3>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible scrollbar-hide">
              {[
                { name: 'Fort Myers', slug: 'fort-myers' },
                { name: 'Naples', slug: 'naples' },
                { name: 'Cape Coral', slug: 'cape-coral' },
                { name: 'Sarasota', slug: 'sarasota' },
                { name: 'Bonita Springs', slug: 'bonita-springs' },
                { name: 'Punta Gorda', slug: 'punta-gorda' },
                { name: 'Port Charlotte', slug: 'port-charlotte' },
                { name: 'Sanibel', slug: 'sanibel' },
              ].map((area) => (
                <Link
                  key={area.slug}
                  href={`/locations/${area.slug}/roof-repair`}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--gray-300)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--black)] transition-all duration-200 hover:bg-[var(--red)] hover:border-[var(--red)] hover:text-white flex-shrink-0"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Bottom CTA */}
        <AnimateIn animation="fade-up" delay={300} className="mt-10 text-center">
          <Link
            href="/our-process"
            className="inline-flex items-center gap-2 text-lg font-semibold text-[var(--black)] hover:text-[var(--red)] transition-colors group"
          >
            Learn About Our Process... and Why Customers Love It
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Lead Capture Form Section                                         */
/* ------------------------------------------------------------------ */
function RepairFormSection() {
  return (
    <section id="repair-form" className="bg-[var(--red)] py-20 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimateIn animation="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Form */}
            <div className="col-span-1 lg:col-span-7">
              <InlineLeadForm
                defaultService="repairs"
                title="Schedule Your Roof Repair Inspection"
                subtitle="Timely repairs extend roof life. Describe your leak or damage, and our certified crew in red polos will perform a comprehensive survey and provide an itemized estimate."
                buttonText="Schedule Inspection Survey"
                formId="repair"
                headingLevel={2}
                darkTheme={true}
              />
            </div>
            {/* Right Column: Visual Infographic */}
            <div className="hidden lg:block lg:col-span-5 relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/crew/crew-roof-inspection-hires.png"
                alt="Target Roofing crew member performing a commercial roof inspection"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  3. STATS COUNTER                                                   */
/* ------------------------------------------------------------------ */
function StatsSection() {
  const { ref, inView } = useInView(0.3)
  const projects = useCountUp(10000, 2200, inView)
  const professionals = useCountUp(75, 1800, inView)
  const response = useCountUp(24, 1400, inView)

  const stats = [
    { value: projects, suffix: '+', label: 'Completed Projects' },
    { value: professionals, suffix: '+', label: 'Full Time Professionals' },
    { value: response, suffix: '', label: 'Hour Response Rate' },
  ]

  return (
    <>
      {/* Slash divider into dark */}
      <div className="-black relative h-0">
        <div className="absolute bottom-0 left-0 right-0 h-20" />
      </div>

      <section
        ref={ref}
        className="relative bg-[var(--black)] py-24 lg:py-32 noise-overlay"
      >
        {/* Subtle monochrome background texture */}
        <div className="absolute inset-0">
          <Image src="/images/backgrounds/bg-welding-mono.jpg" alt="" fill className="object-cover opacity-[0.05]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <AnimateIn
                key={stat.label}
                animation="scale"
                delay={i * 200}
                className="text-center"
              >
                <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[var(--red)] font-[family-name:var(--font-display)]">
                  {stat.value.toLocaleString()}
                  <span>{stat.suffix}</span>
                </div>
                <div className="mt-3 text-lg font-semibold uppercase tracking-widest text-white/80 font-[family-name:var(--font-display)]">
                  {stat.label}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Slash divider out of dark */}
      <div className="-reverse relative bg-[var(--black)]">
        <div className="h-0" />
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0% 100%)',
            background: 'var(--gray-50)',
          }}
        />
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  4. COMMUNITY PARTNER                                               */
/* ------------------------------------------------------------------ */
const communityEvents = [
  { img: '/images/community/year-in-review-2019.jpg', title: '2019 Year in Review' },
  { img: '/images/community/hurricane-dorian-relief.jpg', title: 'Hurricane Dorian Relief - Bahamas' },
  { img: '/images/community/john-morgan.jpg', title: 'Community Event' },
  { img: '/images/community/easter-golisano.jpg', title: 'Easter at Golisano Children\'s Hospital' },
]

function CommunitySection() {
  return (
    <section className="bg-[var(--gray-50)] py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle monochrome background texture */}
      <div className="absolute inset-0">
        <Image src="/images/backgrounds/bg-aerial-mono.jpg" alt="" fill className="object-cover opacity-[0.03]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimateIn animation="fade-up" className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--black)] font-[family-name:var(--font-display)] uppercase mb-6">
            A Community Partner
          </h2>
          <p className="text-lg text-[var(--gray-600)] leading-relaxed">
            Target Roofing is proud of its reputation as Southwest Florida&apos;s top commercial roofer, but equally gratifying are our partnerships with community-based organizations and foundations that generously serve the residents of this community.
          </p>
        </AnimateIn>

        {/* Team photo feature */}
        <AnimateIn animation="fade-up" delay={100} className="mb-12">
          <div className="relative h-72 lg:h-96 rounded-lg overflow-hidden">
            <Image
              src="/images/crew/crew-team-photo.png"
              alt="Target Roofing crew installing a TPO membrane roof"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white text-xl font-bold font-[family-name:var(--font-display)] uppercase tracking-wide drop-shadow-lg">
                Our Crew. Our Community.
              </p>
            </div>
          </div>
        </AnimateIn>

        {/* Event cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {communityEvents.map((event, i) => (
            <AnimateIn key={event.title} animation="fade-up" delay={i * 100 + 200}>
              <article className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1 h-full">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={event.img}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--black)] font-[family-name:var(--font-display)]">
                    {event.title}
                  </h3>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  5. PORTFOLIO SHOWCASE                                              */
/* ------------------------------------------------------------------ */
const projects = [
  { img: '/images/portfolio/bay-colony-beach-club.jpg', title: 'Bay Colony Beach Club' },
  { img: '/images/portfolio/barron-collier-high-school.jpg', title: 'Barron Collier High School' },
  { img: '/images/portfolio/admiralty-house.jpg', title: 'Admiralty House' },
]

function PortfolioSection() {
  return (
    <section className="bg-white py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle monochrome background texture */}
      <div className="absolute inset-0">
        <Image src="/images/backgrounds/bg-crane-mono.jpg" alt="" fill className="object-cover opacity-[0.04]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimateIn animation="fade-up" className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--black)] font-[family-name:var(--font-display)] uppercase mb-6">
            Roofs We&apos;ve Repaired &amp; Replaced<br className="hidden sm:block" /> Across Southwest Florida
          </h2>
          <p className="text-lg text-[var(--gray-600)] leading-relaxed">
            From single-leak repairs to full retrofits &mdash; see the commercial and residential roofs we&apos;ve kept watertight across SWFL.
          </p>
        </AnimateIn>

        {/* Project cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {projects.map((project, i) => (
            <AnimateIn key={project.title} animation="fade-up" delay={i * 150}>
              <article className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={project.img}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-lg font-bold uppercase text-white font-[family-name:var(--font-display)] drop-shadow-lg">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>

        {/* Crew action images row */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimateIn animation="fade-up" delay={0}>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/images/crew/generated/18-emergency-tarp-install.png"
                alt="Target Roofing crew installing an emergency tarp after storm damage"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-bold uppercase tracking-wide font-[family-name:var(--font-display)] drop-shadow-lg">
                  Emergency Storm Response
                </p>
              </div>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={150}>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/images/crew/crew-tpo-welding.png"
                alt="Close-up of hands welding TPO seams"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-bold uppercase tracking-wide font-[family-name:var(--font-display)] drop-shadow-lg">
                  Precision Welding
                </p>
              </div>
            </div>
          </AnimateIn>
          <AnimateIn animation="fade-up" delay={300}>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
              <Image
                src="/images/crew/generated/07-roof-aerial-crew.png"
                alt="Aerial view of a Target Roofing crew working on a commercial roof"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-bold uppercase tracking-wide font-[family-name:var(--font-display)] drop-shadow-lg">
                  Coordinated Crews
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>

        {/* CTA */}
        <AnimateIn animation="fade-up" delay={200} className="mt-14 text-center">
          <Link
            href="/our-projects"
            className="inline-flex items-center gap-2 rounded bg-brand-gradient hover-bg-brand-gradient px-8 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            View All Projects
            <ArrowRight className="h-5 w-5" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  6. TESTIMONIALS                                                    */
/* ------------------------------------------------------------------ */
const testimonials = [
  {
    name: 'Casey B.',
    text: 'I always know that I can count on the team at Target Roofing! Casey, Trey, and Shannon are all great people...',
  },
  {
    name: 'Katie Edmunds',
    text: 'Having worked with other, well-known roofing companies around SWFL, Target Roofing is, by far, second to none...',
  },
  {
    name: 'Orlando C.',
    text: 'Great overall service and product. I was absolutely blown away by the professionalism...',
  },
  {
    name: 'Omar A.',
    text: 'I want to say thank you to Target Roofing! And a bigger thanks to Trey!...',
  },
  {
    name: 'Jessica C.',
    text: 'We use this company for most of the properties we manage in the Fort Myers Area...',
  },
  {
    name: 'Nicole A.',
    text: 'Such friendly and accommodating workers! The service was incredible...',
  },
]

function TestimonialsSection() {
  return (
    <>
      {/* Slash divider into red/dark */}
      <div className="relative bg-white">
        <div className="h-0" />
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            clipPath: 'polygon(0 60%, 100% 0, 100% 100%, 0% 100%)',
            background: 'var(--black)',
          }}
        />
      </div>

      <section className="relative bg-[var(--black)] py-24 lg:py-32 noise-overlay">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimateIn animation="fade-up" className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-display)] uppercase mb-4">
              What Customers Say About<br className="hidden sm:block" /> Target Roofing
            </h2>
          </AnimateIn>

          {/* Testimonial grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimateIn key={t.name} animation="fade-up" delay={i * 150}>
                <article className="relative rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 h-full">
                  {/* Quote icon */}
                  <Quote className="absolute top-6 right-6 h-8 w-8 text-[var(--red)]/30" />

                  {/* Quote text */}
                  <p className="mb-6 text-white/80 leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--red)] text-white font-bold text-sm font-[family-name:var(--font-display)]">
                      {t.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-white text-sm">
                      {t.name}
                    </span>
                  </div>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Slash divider out of dark */}
      <div className="relative bg-[var(--black)]">
        <div className="h-0" />
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            clipPath: 'polygon(0 0, 100% 60%, 100% 100%, 0% 100%)',
            background: 'white',
          }}
        />
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  7. NEWS                                                            */
/* ------------------------------------------------------------------ */
const blogPosts = [
  {
    img: '/images/blog/good-service-header.webp',
    title: "Here's What a Great Roofing Service Team Looks Like",
    href: '/target-news/great-roofing-service-team',
  },
  {
    img: '/images/blog/hurricane-preparedness.jpg',
    title: 'Hurricane Preparedness',
    href: '/target-news/hurricane-preparedness',
  },
  {
    img: '/images/blog/rainy-season.jpg',
    title: 'Preparing Your Commercial Roof for Rainy Season',
    href: '/target-news/preparing-commercial-roof-rainy-season',
  },
]

function NewsSection() {
  return (
    <section className="bg-white py-24 lg:py-32 relative overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimateIn animation="fade-up" className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--black)] font-[family-name:var(--font-display)] uppercase mb-6">
            News About Target Roofing
          </h2>
          <p className="text-lg text-[var(--gray-600)] leading-relaxed">
            You&apos;re seeing our name all over and we&apos;re proud to be making our mark.
          </p>
        </AnimateIn>

        {/* Blog cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {blogPosts.map((post, i) => (
            <AnimateIn key={post.title} animation="fade-up" delay={i * 150}>
              <Link
                href={post.href}
                className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border border-[var(--gray-200)] block h-full"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.img}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold uppercase text-[var(--black)] font-[family-name:var(--font-display)] group-hover:text-[var(--red)] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-[var(--red)]">
                    Read More <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>

        {/* Crew action strip */}
        <AnimateIn animation="fade-up" delay={200} className="mt-12">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative h-48 lg:h-64 rounded-lg overflow-hidden">
              <Image
                src="/images/crew/crew-repairing-roof.png"
                alt="Target Roofing project manager greeting a commercial client on site"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="relative h-48 lg:h-64 rounded-lg overflow-hidden">
              <Image
                src="/images/crew/crew-tpo-welding.png"
                alt="Target Roofing crew welding TPO membrane"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </AnimateIn>

        {/* CTA */}
        <AnimateIn animation="fade-up" delay={300} className="mt-14 text-center">
          <Link
            href="/target-news"
            className="inline-flex items-center gap-2 rounded bg-brand-gradient hover-bg-brand-gradient px-8 py-4 text-base font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Visit Our Blog
            <ArrowRight className="h-5 w-5" />
          </Link>
        </AnimateIn>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  8b. VIDEO SHOWCASE                                                 */
/* ------------------------------------------------------------------ */
const PAGE_SIZE = 5

function VideoShowcaseSection() {
  const { ref: playerRef, inView: playerInView } = useInView(0.01)
  const [activeIdx, setActiveIdx] = useState(0)
  const [page, setPage] = useState(0)
  const [showcaseVideos, setShowcaseVideos] = useState(FALLBACK_VIDEOS)

  useEffect(() => {
    getShowcaseVideos().then(videos => {
      if (videos.length > 0) setShowcaseVideos(videos)
    })
  }, [])

  const totalPages = Math.ceil(showcaseVideos.length / PAGE_SIZE)
  const pageVideos = showcaseVideos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const active = showcaseVideos[activeIdx]

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background image - full bleed */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgrounds/bg-learn-from-pros.png"
          alt=""
          fill
          className="object-fill"
          sizes="100vw"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimateIn animation="fade-up" className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-[var(--red)] text-2xl font-bold tracking-widest">&raquo;&raquo;&raquo;</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-display)] uppercase leading-[0.95]">
              Watch <span className="text-[var(--red)]">Target Roofing</span>
            </h2>
            <span className="text-[var(--red)] text-2xl font-bold tracking-widest">&laquo;&laquo;&laquo;</span>
          </div>
          <div className="w-16 h-[3px] bg-[var(--red)] mx-auto mb-4" />
          <p className="text-lg text-[var(--gray-600)] max-w-2xl mx-auto">
            Project walkthroughs, inspections, and behind-the-scenes footage from Southwest Florida&apos;s top commercial roofing team.
          </p>
        </AnimateIn>

        {/* Video grid */}
        <AnimateIn animation="fade-up" delay={150}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main player */}
            <div className="flex-1 min-w-0">
              <div ref={playerRef} className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-black">
                {playerInView && <iframe
                  key={active.id}
                  src={`https://www.youtube.com/embed/${active.id}?rel=0&modestbranding=1`}
                  title={active.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />}
              </div>
              {/* Now playing info */}
              <div className="mt-4 flex items-start gap-3">
                <span className="flex-shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--red)] text-white">
                  <Play className="w-4 h-4 fill-current" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[var(--black)] font-[family-name:var(--font-display)] uppercase">
                    {active.title}
                  </h3>
                  <p className="text-sm text-[var(--gray-500)]">{active.description}</p>
                </div>
              </div>
            </div>

            {/* Sidebar playlist - matches video aspect ratio height */}
            <div className="lg:w-80 xl:w-96 flex flex-col">
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 flex-1">
                {pageVideos.map((video) => {
                  const globalIdx = showcaseVideos.findIndex(v => v.id === video.id)
                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveIdx(globalIdx)}
                      className={`group flex-shrink-0 w-64 lg:w-full flex items-start gap-3 p-2.5 rounded-lg transition-all text-left ${
                        globalIdx === activeIdx
                          ? 'bg-[var(--red)] text-white shadow-lg'
                          : 'bg-white/80 hover:bg-white shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div className="relative flex-shrink-0 w-24 aspect-video rounded overflow-hidden">
                        <Image
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center ${globalIdx === activeIdx ? 'bg-black/20' : 'bg-black/30'}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${globalIdx === activeIdx ? 'bg-white/90' : 'bg-white/80'}`}>
                            <Play className={`w-3 h-3 fill-current ${globalIdx === activeIdx ? 'text-[var(--red)]' : 'text-[var(--black)]'}`} />
                          </div>
                        </div>
                        <span className={`absolute bottom-0.5 right-0.5 text-[9px] font-bold px-1 py-0.5 rounded ${globalIdx === activeIdx ? 'bg-white text-[var(--red)]' : 'bg-black/70 text-white'}`}>
                          {video.duration}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold font-[family-name:var(--font-display)] uppercase leading-tight ${globalIdx === activeIdx ? 'text-white' : 'text-[var(--black)]'}`}>
                          {video.title}
                        </h4>
                        <p className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${globalIdx === activeIdx ? 'text-white/80' : 'text-[var(--gray-500)]'}`}>
                          {video.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 px-1">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--gray-600)] hover:text-[var(--red)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <span className="text-xs text-[var(--gray-500)] font-semibold">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-[var(--gray-600)] hover:text-[var(--red)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </AnimateIn>

        {/* CTA button */}
        <AnimateIn animation="fade-up" delay={300} className="mt-10 text-center">
          <Link
            href="/video-gallery"
            className="inline-flex items-center gap-3 bg-[var(--red)] hover:bg-[var(--red-dark)] text-white font-bold uppercase tracking-wider text-sm px-10 py-4 rounded shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 fill-current" />
            Watch All Videos
            <ChevronRight className="w-5 h-5" />
          </Link>
        </AnimateIn>
      </div>

      {/* Bottom black bar */}
      <div className="relative z-10 mt-20 bg-[var(--black)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--red)]/20">
                <ShieldCheck className="w-5 h-5 text-[var(--red)]" />
              </span>
              <div>
                <p className="text-sm font-bold text-[var(--red)] uppercase tracking-wide font-[family-name:var(--font-display)]">
                  Real Knowledge. Real Protection.
                </p>
                <p className="text-xs text-[var(--gray-400)]">
                  Trusted advice from the roofing experts at Target Roofing.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Crosshair className="w-6 h-6 text-[var(--gray-500)]" />
              <p className="text-sm font-bold text-[var(--red)] uppercase tracking-wide font-[family-name:var(--font-display)]">
                Learn More. Protect More. Worry Less.
              </p>
              <div className="hidden md:flex gap-1 ml-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-2 h-8 bg-[var(--red)] -skew-x-12" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  9. PARTNERS                                                        */
/* ------------------------------------------------------------------ */
const partners = [
  { img: '/images/partners/englert.jpg', name: 'Englert', sizeClass: 'max-h-32' },
  { img: '/images/partners/genflex.jpg', name: 'GenFlex', sizeClass: 'max-h-24' },
  { img: '/images/partners/soprema.jpg', name: 'Soprema', sizeClass: 'max-h-24' },
  { img: '/images/partners/tropical-roofing.jpg', name: 'Tropical Roofing Products', sizeClass: 'max-h-24' },
  { img: '/images/partners/polyglass.png', name: 'Polyglass', sizeClass: 'max-h-24' },
  { img: '/images/partners/gaf.png', name: 'GAF', sizeClass: 'max-h-20' },
  { img: '/images/partners/carlisle.png', name: 'Carlisle', sizeClass: 'max-h-24' },
]

function PartnersSection() {
  return (
    <section className="border-t border-[var(--gray-200)] bg-[var(--gray-50)] py-20 lg:py-24 w-full">
      <div className="w-full px-4 sm:px-12 lg:px-24">
        {/* Header */}
        <AnimateIn animation="fade-up" className="mx-auto max-w-3xl text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--black)] font-[family-name:var(--font-display)] uppercase mb-4">
            Target Roofing Partners
          </h2>
          <p className="text-lg text-[var(--gray-600)] leading-relaxed">
            To provide the best commercial roofing services to you, we partner with the best.
          </p>
        </AnimateIn>

        {/* Partner logos */}
        <AnimateIn animation="blur" delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center justify-items-center">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="group flex h-32 w-full items-center justify-center max-w-[200px]"
              >
                <Image
                  src={partner.img}
                  alt={partner.name}
                  width={180}
                  height={90}
                  className={`${partner.sizeClass} w-auto object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0`}
                />
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
