'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Wrench,
  Home,
  HardHat,
  ShieldCheck,
  Layers,
  Factory,
  Droplets,
  SprayCan,
  CloudLightning,
  ClipboardCheck,
  DollarSign,
  Building2,
  Users,
  Star,
  Award,
  FileCheck,
  MapPin,
  Newspaper,
  Video,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react'

// ─── Mega menu data ──────────────────────────────────────────────

interface MegaLink {
  name: string
  href: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MegaColumn {
  heading: string
  links: MegaLink[]
}

interface MegaFeatured {
  type: 'cta' | 'stats'
  heading: string
  body: string
  href: string
  linkText: string
  stats?: { value: string; label: string }[]
}

interface MegaPanel {
  columns: MegaColumn[]
  featured?: MegaFeatured
}

interface NavItem {
  name: string
  href: string
  mega?: MegaPanel
  // locations is a special grid panel
  locationGrid?: { name: string; slug: string }[]
  // simple children for mobile fallback & News
  children?: { name: string; href: string; description?: string; icon?: React.ComponentType<{ className?: string }> }[]
}

const servicesMega: MegaPanel = {
  columns: [
    {
      heading: 'Core Services',
      links: [
        { name: 'Roof Repairs', href: '/roofing-services/roof-repair', description: 'Expert leak detection & repair', icon: Wrench },
        { name: 'Commercial Roof Repair', href: '/roofing-services/commercial-roof-repair', description: 'Repair planning for occupied properties', icon: Building2 },
        { name: 'Emergency Storm Repair', href: '/roofing-services/emergency-storm-repair', description: '24/7 storm damage response', icon: CloudLightning },
        { name: 'Maintenance Plans', href: '/commercial-hoa-roof-maintenance', description: 'Proactive roof care programs', icon: ShieldCheck },
        { name: 'Roof Replacement', href: '/roofing-services/roof-replacement', description: 'Complete roof replacement', icon: Home },
        { name: 'New Roofs', href: '/roofing-services#new-roofs', description: 'New construction roofing', icon: HardHat },
      ],
    },
    {
      heading: 'Specialty Systems',
      links: [
        { name: 'TPO & PVC Membranes', href: '/roofing-services/tpo-pvc-membrane-roofing', description: 'Single-ply commercial roofing', icon: Layers },
        { name: 'Metal Roofing', href: '/roofing-services/metal-roofing-systems', description: 'Standing seam & corrugated', icon: Factory },
        { name: 'Tile Roofing', href: '/roofing-services/tile-roofing', description: 'Clay & concrete tile roof systems', icon: Layers },
        { name: 'Asphalt Shingles', href: '/roofing-services/asphalt-shingle-roofing', description: 'Popular residential roofing solutions', icon: Home },
        { name: 'Built-Up Roofing (BUR)', href: '/roofing-services/built-up-roofing-bur', description: 'Multi-layer asphalt systems', icon: Layers },
        { name: 'Waterproofing & Coatings', href: '/roofing-services/waterproofing-coating-systems', description: 'Silicone & elastomeric systems', icon: Droplets },
      ],
    },
    {
      heading: 'Additional Services',
      links: [
        { name: 'Softwash Cleaning', href: '/softwash', description: 'Safe, thorough roof cleaning', icon: SprayCan },
        { name: 'Roof Inspections & Surveys', href: '/roofing-services/roof-inspections-surveys', description: 'Comprehensive condition reports', icon: ClipboardCheck },
      ],
    },
  ],
  featured: {
    type: 'cta',
    heading: 'Need a Repair?',
    body: 'Get a free estimate from our expert team. We respond to most requests within 24 hours.',
    href: '/contact?service=free-estimate',
    linkText: 'Request Free Estimate',
  },
}

const aboutMega: MegaPanel = {
  columns: [
    {
      heading: 'Our Company',
      links: [
        { name: 'About Us', href: '/about', description: 'Our story and mission', icon: Building2 },
        { name: 'Our Process', href: '/our-process', description: 'How we deliver quality', icon: ClipboardCheck },
        { name: 'Our Team', href: '/our-team', description: 'Meet the experts', icon: Users },
        { name: 'Careers', href: '/careers', description: 'Join our growing team', icon: HardHat },
      ],
    },
    {
      heading: 'Trust & Quality',
      links: [
        { name: 'Reviews', href: '/reviews', description: 'What our clients say', icon: Star },
        { name: 'Certifications', href: '/about#certifications', description: 'Industry-recognized credentials', icon: Award },
        { name: 'Warranties', href: '/warranties', description: 'Our commitment to you', icon: FileCheck },
        { name: 'Financing', href: '/financing', description: 'Flexible payment options', icon: DollarSign },
      ],
    },
  ],
  featured: {
    type: 'stats',
    heading: 'Proven Track Record',
    body: 'Decades of excellence across Southwest Florida.',
    href: '/about',
    linkText: 'Learn Our Story',
    stats: [
      { value: '30+', label: 'Years Experience' },
      { value: '10,000+', label: 'Projects Completed' },
    ],
  },
}

const locationCities = [
  { name: 'Fort Myers', slug: 'fort-myers' },
  { name: 'Cape Coral', slug: 'cape-coral' },
  { name: 'Naples', slug: 'naples' },
  { name: 'Bonita Springs', slug: 'bonita-springs' },
  { name: 'Sanibel', slug: 'sanibel' },
  { name: 'Punta Gorda', slug: 'punta-gorda' },
  { name: 'Port Charlotte', slug: 'port-charlotte' },
  { name: 'Sarasota', slug: 'sarasota' },
  { name: 'Arcadia', slug: 'arcadia' },
  { name: 'Southwest Florida', slug: 'southwest-florida' },
]

const navigation: NavItem[] = [
  { name: 'Home', href: '/' },
  {
    name: 'Services',
    href: '/roofing-services',
    mega: servicesMega,
  },
  {
    name: 'About',
    href: '/about',
    mega: aboutMega,
  },
  { name: 'Portfolio', href: '/our-projects' },
  {
    name: 'Locations',
    href: '/locations',
    locationGrid: locationCities,
  },
  {
    name: 'News',
    href: '/target-news',
    children: [
      { name: 'Target News', href: '/target-news', description: 'Industry tips & company updates', icon: Newspaper },
      { name: 'Video Gallery', href: '/video-gallery', description: 'Project walkthroughs & how-tos', icon: Video },
    ],
  },
  { name: 'Contact', href: '/contact' },
]

// ─── Services mega panel (promo + columns + service bar) ────────

function SlashMark() {
  return (
    <span className="flex gap-[3px]" aria-hidden="true">
      <span className="block h-3.5 w-[5px] -skew-x-[20deg] bg-[var(--red)]" />
      <span className="block h-3.5 w-[5px] -skew-x-[20deg] bg-[var(--red)]" />
    </span>
  )
}

function ServicesMegaPanel({ mega, onNavigate }: { mega: MegaPanel; onNavigate: () => void }) {
  return (
    <div className="flex items-stretch">
      {/* ── Left promo panel ── */}
      <div className="relative hidden w-[400px] shrink-0 xl:block 2xl:w-[440px]">
        {/* Red diagonal backdrop */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--red-light)] via-[var(--red)] to-[var(--red-dark)]"
          style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 7rem) 100%, 0 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.5) 0 2px, transparent 2px 12px)' }}
          />
          {/* Oversized reticle watermark, bleeding off the bottom-left */}
          <Image
            src="/images/brand/reticle.png"
            alt=""
            aria-hidden="true"
            width={508}
            height={509}
            className="pointer-events-none absolute -bottom-24 -left-24 h-[460px] w-[460px] max-w-none -rotate-12 opacity-[0.18] brightness-0 invert"
          />
        </div>

        <div className="relative flex h-full flex-col py-9 pl-10 pr-28 pb-32">
          <div className="inline-flex self-start bg-[#0b0b0b] px-4 py-1.5 -skew-x-[14deg]">
            <span className="block skew-x-[14deg] text-[11px] font-bold italic uppercase tracking-[0.2em] text-white font-[family-name:var(--font-display)]">
              Roofing & Exterior Experts
            </span>
          </div>
          <p className="mt-5 text-[2.5rem] font-extrabold italic uppercase leading-[1.05] text-white font-[family-name:var(--font-display)]">
            Built to Protect.
            <br />
            Built to Last.
          </p>
          <div className="mt-5 h-px w-44 bg-white/50" />
          <p className="mt-4 max-w-[17rem] text-sm leading-relaxed text-white/90">
            From roof repairs to complete replacements, we deliver high-performance solutions backed by experience and integrity.
          </p>
        </div>

        {/* Estimate banner - overlaps the diagonal edge */}
        <Link
          href="/contact?service=free-estimate"
          onClick={onNavigate}
          className="group/cta absolute bottom-9 left-0 right-4 flex items-center gap-4 bg-[#0b0b0b] py-4 pl-10 pr-8 transition-colors hover:bg-black"
          style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 2rem) 100%, 0 100%)' }}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--red)] text-white">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold uppercase tracking-wide text-white font-[family-name:var(--font-display)]">
              Need a Free Estimate?
            </span>
            <span className="block text-xs text-white/70">Fast response. No obligation.</span>
          </span>
          <ArrowRight className="mr-4 h-5 w-5 shrink-0 text-white transition-transform group-hover/cta:translate-x-1" />
        </Link>
      </div>

      {/* ── Service columns + bottom bar ── */}
      <div className="min-w-0 flex-1 px-6 py-8 lg:px-10 xl:pl-12">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {mega.columns.map((col, i) => (
            <div key={col.heading} className={i === 0 ? 'pr-6' : i === mega.columns.length - 1 ? 'pl-6' : 'px-6'}>
              <div className="mb-3">
                <div className="flex items-center gap-2.5">
                  <SlashMark />
                  <h3 className="text-sm font-bold italic uppercase tracking-wider text-[var(--black)] font-[family-name:var(--font-display)]">
                    {col.heading}
                  </h3>
                </div>
                <div className="mt-2.5 h-px bg-gray-300" />
              </div>
              <ul>
                {col.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group flex items-center gap-3.5 rounded-lg px-2 py-3 transition-colors hover:bg-gray-50"
                        onClick={onNavigate}
                      >
                        {Icon && (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--red)]/10 bg-[var(--red)]/[0.07] text-[var(--red)] transition-colors group-hover:bg-[var(--red)] group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-bold uppercase tracking-wide text-[var(--black)] transition-colors group-hover:text-[var(--red)] font-[family-name:var(--font-display)]">
                            {link.name}
                          </span>
                          {link.description && (
                            <span className="mt-0.5 block text-xs leading-snug text-gray-500">{link.description}</span>
                          )}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--red)]/70 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Same-day service bar ── */}
        <div
          className="mt-6 flex items-center gap-5 bg-gradient-to-r from-gray-200/70 via-gray-100 to-gray-100 py-3.5 pl-9 pr-8"
          style={{ clipPath: 'polygon(1.75rem 0, 100% 0, calc(100% - 1.75rem) 100%, 0 100%)' }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--red)] text-white"
            style={{ clipPath: 'polygon(25% 3%, 75% 3%, 98% 50%, 75% 97%, 25% 97%, 2% 50%)' }}
          >
            <Phone className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold italic uppercase tracking-wide text-[var(--black)] font-[family-name:var(--font-display)]">
              Same-Day Service Available
            </span>
            <span className="block text-xs text-gray-600">We respond to most requests within 24 hours.</span>
          </span>
          <span className="mx-3 hidden h-10 w-px -skew-x-[18deg] bg-gray-300 lg:block" aria-hidden="true" />
          <Link
            href="/contact?service=free-estimate"
            onClick={onNavigate}
            className="ml-auto shrink-0 -skew-x-[14deg] bg-gradient-to-r from-[var(--red-light)] to-[var(--red)] px-9 py-3 shadow-md transition-all hover:from-[var(--red)] hover:to-[var(--red-dark)] hover:shadow-lg"
          >
            <span className="flex skew-x-[14deg] items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-white font-[family-name:var(--font-display)]">
              Request Free Estimate
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 2xl:flex" aria-hidden="true">
            <span className="h-10 w-3 -skew-x-[14deg] bg-[var(--red)]" />
            <span className="h-10 w-1.5 -skew-x-[14deg] bg-[var(--red)]/70" />
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMega, setActiveMega] = useState<string | null>(null)
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Helper: generate stable IDs for ARIA linkage
  const panelId = (name: string) => `mega-panel-${name.toLowerCase().replace(/\s+/g, '-')}`
  const accordionId = (name: string) => `mobile-accordion-${name.toLowerCase().replace(/\s+/g, '-')}`

  // Close mega menu on Escape & return focus to trigger
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeMega) {
        const trigger = triggerRefs.current.get(activeMega)
        setActiveMega(null)
        trigger?.focus()
      }
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
        mobileMenuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeMega, mobileMenuOpen])

  // Close mega menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMega(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cleanup hover timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleMouseEnter = useCallback((name: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setActiveMega(name)
  }, [])

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setActiveMega(null)
    }, 150)
  }, [])

  // Keyboard support: ArrowDown or Space opens mega menu from trigger
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent, item: NavItem) => {
    if (!(item.mega || item.locationGrid || item.children)) return
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      setActiveMega(item.name)
    }
  }, [])

  const hasMega = (item: NavItem) => item.mega || item.locationGrid || item.children

  // Flatten all mega/children links for mobile
  const getMobileLinks = (item: NavItem): { name: string; href: string; description?: string }[] => {
    if (item.mega) {
      return item.mega.columns.flatMap((col) =>
        col.links.map((l) => ({ name: l.name, href: l.href, description: l.description }))
      )
    }
    if (item.locationGrid) {
      return item.locationGrid.map((c) => ({
        name: c.name,
        href: `/locations/${c.slug}`,
      }))
    }
    if (item.children) {
      return item.children.map((c) => ({ name: c.name, href: c.href, description: c.description }))
    }
    return []
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 max-w-full" ref={navRef}>
        {/* ── Top red bar ── */}
        <div className="bg-[var(--red)] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center justify-between h-12 text-sm">
              <div className="hidden items-center gap-6 sm:flex">
                <span className="hidden sm:inline">License #CCC1334168</span>
                <span className="hidden lg:inline">Serving Fort Myers, Cape Coral, Naples &amp; Sarasota</span>
              </div>
              <div className="flex w-full min-w-0 items-center justify-between gap-1 sm:w-auto sm:justify-end sm:gap-4">
                <Link
                  href="/roofing-services/emergency-storm-repair"
                  className="flex min-w-0 items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide transition-colors hover:text-white/90 min-h-[48px] sm:px-2 sm:text-sm"
                >
                  <CloudLightning className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">24/7 Emergency</span>
                </Link>
                <span className="hidden sm:inline h-4 w-px bg-white/30" aria-hidden="true" />
                <a
                  href="tel:+12393325707"
                  className="flex min-w-0 items-center justify-end gap-1.5 whitespace-nowrap px-1 text-xs font-semibold transition-colors hover:text-white/90 min-h-[48px] sm:gap-2 sm:px-2 sm:text-sm"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  239-332-5707
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main nav bar ── */}
        <nav className="bg-white shadow-lg relative" aria-label="Main navigation">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center justify-between h-20">
              {/* Logo */}
              <Link
                href="/"
                className="min-w-0 flex-shrink"
                onClick={() => { setMobileMenuOpen(false); setActiveMega(null) }}
              >
                <Image
                  src="/images/logos/target-roofing-logo.png"
                  alt="Target Roofing"
                  width={220}
                  height={50}
                  className="h-12 w-auto max-w-[calc(100vw-7rem)] object-contain object-left"
                  priority
                />
              </Link>

              {/* Desktop nav links */}
              <div className="hidden lg:flex items-center gap-0.5">
                {navigation.map((item) => (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => hasMega(item) ? handleMouseEnter(item.name) : setActiveMega(null)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      ref={(el) => { if (el && hasMega(item)) triggerRefs.current.set(item.name, el) }}
                      className={`flex items-center gap-1 px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors font-[family-name:var(--font-display)] ${
                        activeMega === item.name
                          ? 'text-[var(--red)]'
                          : 'text-[var(--black)] hover:text-[var(--red)]'
                      }`}
                      onClick={() => setActiveMega(null)}
                      onKeyDown={(e) => handleTriggerKeyDown(e, item)}
                      aria-expanded={hasMega(item) ? activeMega === item.name : undefined}
                      aria-haspopup={hasMega(item) ? 'true' : undefined}
                      aria-controls={hasMega(item) ? panelId(item.name) : undefined}
                    >
                      {item.name}
                      {hasMega(item) && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            activeMega === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </Link>
                  </div>
                ))}

              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-3 text-[var(--black)] min-h-[48px] min-w-[48px]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                ref={mobileMenuButtonRef}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* ── Desktop mega menu panels ── */}
          {navigation.map((item) => {
            if (!hasMega(item)) return null
            const isOpen = activeMega === item.name

            return (
              <div
                key={item.name}
                id={panelId(item.name)}
                role="region"
                aria-label={`${item.name} submenu`}
                className={`absolute left-0 right-0 top-full bg-white shadow-2xl border-t-[3px] border-[var(--red)] transition-all duration-300 ease-in-out origin-top hidden lg:block ${
                  isOpen
                    ? 'opacity-100 translate-y-0 visible pointer-events-auto'
                    : 'opacity-0 -translate-y-2 invisible pointer-events-none'
                }`}
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                {item.name === 'Services' && item.mega ? (
                  <ServicesMegaPanel mega={item.mega} onNavigate={() => setActiveMega(null)} />
                ) : (
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
                  {/* About mega panel */}
                  {item.mega && (
                    <div className="grid grid-cols-4 gap-8">
                      {item.mega.columns.map((col) => (
                        <div key={col.heading}>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--red)] mb-4 font-[family-name:var(--font-display)]">
                            {col.heading}
                          </h3>
                          <ul className="space-y-1">
                            {col.links.map((link) => {
                              const Icon = link.icon
                              return (
                                <li key={link.name}>
                                  <Link
                                    href={link.href}
                                    className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
                                    onClick={() => setActiveMega(null)}
                                  >
                                    {Icon && (
                                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--red)]/10 text-[var(--red)] group-hover:bg-[var(--red)] group-hover:text-white transition-colors">
                                        <Icon className="h-4 w-4" />
                                      </span>
                                    )}
                                    <div>
                                      <span className="block text-sm font-semibold text-[var(--black)] group-hover:text-[var(--red)] transition-colors">
                                        {link.name}
                                      </span>
                                      {link.description && (
                                        <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                                          {link.description}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ))}

                      {/* Featured card */}
                      {item.mega.featured && (
                        <div
                          className={`rounded-xl p-6 flex flex-col justify-between ${
                            item.mega.featured.type === 'cta'
                              ? 'bg-gradient-to-br from-[var(--red)] to-[var(--red-dark)] text-white'
                              : 'bg-gray-50 border border-gray-100'
                          }`}
                        >
                          <div>
                            <h3
                              className={`text-lg font-bold font-[family-name:var(--font-display)] mb-2 ${
                                item.mega.featured.type === 'stats' ? 'text-[var(--black)]' : ''
                              }`}
                            >
                              {item.mega.featured.heading}
                            </h3>
                            <p
                              className={`text-sm leading-relaxed mb-4 ${
                                item.mega.featured.type === 'cta' ? 'text-white/90' : 'text-gray-600'
                              }`}
                            >
                              {item.mega.featured.body}
                            </p>

                            {/* Stats */}
                            {item.mega.featured.stats && (
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                {item.mega.featured.stats.map((stat) => (
                                  <div key={stat.label} className="text-center">
                                    <div className="text-2xl font-bold text-[var(--red)] font-[family-name:var(--font-display)]">
                                      {stat.value}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Link
                            href={item.mega.featured.href}
                            className={`inline-flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2.5 transition-colors text-center justify-center ${
                              item.mega.featured.type === 'cta'
                                ? 'bg-white text-[var(--red)] hover:bg-white/90'
                                : 'bg-[var(--red)] text-white hover:bg-[var(--red-dark)]'
                            }`}
                            onClick={() => setActiveMega(null)}
                          >
                            {item.mega.featured.linkText}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}

                      {/* If fewer than 3 columns and no featured, pad grid */}
                      {item.mega.columns.length < 3 && !item.mega.featured && (
                        <div className="col-span-1" />
                      )}
                    </div>
                  )}

                  {/* Locations grid panel */}
                  {item.locationGrid && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--red)] font-[family-name:var(--font-display)]">
                            Service Areas
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Expert roofing services across Southwest Florida
                          </p>
                        </div>
                        <Link
                          href="/locations"
                          className="text-sm font-semibold text-[var(--red)] hover:text-[var(--red-dark)] transition-colors flex items-center gap-1"
                          onClick={() => setActiveMega(null)}
                        >
                          View All Locations
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {item.locationGrid.map((city) => (
                          <Link
                            key={city.slug}
                            href={`/locations/${city.slug}`}
                            className="group flex items-center gap-2.5 rounded-lg border border-gray-100 px-4 py-3 hover:border-[var(--red)]/30 hover:bg-[var(--red)]/5 transition-all"
                            onClick={() => setActiveMega(null)}
                          >
                            <MapPin className="h-4 w-4 text-gray-400 group-hover:text-[var(--red)] transition-colors shrink-0" />
                            <span className="text-sm font-semibold text-[var(--black)] group-hover:text-[var(--red)] transition-colors">
                              {city.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* News simple panel */}
                  {item.children && !item.mega && !item.locationGrid && (
                    <div className="grid grid-cols-4 gap-8">
                      <div className="col-span-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--red)] mb-4 font-[family-name:var(--font-display)]">
                          Stay Updated
                        </h3>
                        <ul className="space-y-1">
                          {item.children.map((child) => {
                            const Icon = child.icon
                            return (
                              <li key={child.name}>
                                <Link
                                  href={child.href}
                                  className="group flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors"
                                  onClick={() => setActiveMega(null)}
                                >
                                  {Icon && (
                                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--red)]/10 text-[var(--red)] group-hover:bg-[var(--red)] group-hover:text-white transition-colors">
                                      <Icon className="h-4 w-4" />
                                    </span>
                                  )}
                                  <div>
                                    <span className="block text-sm font-semibold text-[var(--black)] group-hover:text-[var(--red)] transition-colors">
                                      {child.name}
                                    </span>
                                    {child.description && (
                                      <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                                        {child.description}
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Mobile menu ── */}
        <div
          id="mobile-menu"
          role="region"
          aria-label="Mobile navigation"
          className={`lg:hidden bg-white border-t transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen
              ? 'max-h-[calc(100vh-132px)] opacity-100'
              : 'max-h-0 opacity-0 pointer-events-none invisible'
          }`}
        >
          <div className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-132px)]">
            {navigation.map((item) => {
              const links = getMobileLinks(item)
              const hasChildren = links.length > 0
              const isAccordionOpen = mobileAccordion === item.name

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      type="button"
                      className="flex items-center justify-between w-full px-4 py-3.5 min-h-[48px] text-sm font-semibold uppercase text-[var(--black)] hover:text-[var(--red)] hover:bg-[var(--gray-50)] rounded transition-colors font-[family-name:var(--font-display)]"
                      onClick={() =>
                        setMobileAccordion(isAccordionOpen ? null : item.name)
                      }
                      aria-expanded={isAccordionOpen}
                      aria-controls={accordionId(item.name)}
                    >
                      {item.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isAccordionOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center px-4 py-3.5 min-h-[48px] text-sm font-semibold uppercase text-[var(--black)] hover:text-[var(--red)] hover:bg-[var(--gray-50)] rounded transition-colors font-[family-name:var(--font-display)]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Accordion content */}
                  {hasChildren && (
                    <div
                      id={accordionId(item.name)}
                      role="region"
                      aria-label={`${item.name} links`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isAccordionOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {/* Show column headings on mobile for mega menus */}
                      {item.mega && item.mega.columns.map((col) => (
                        <div key={col.heading} className="pl-4 mb-2">
                          <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-widest text-[var(--red)] font-[family-name:var(--font-display)]">
                            {col.heading}
                          </div>
                          {col.links.map((link) => (
                            <Link
                              key={link.name}
                              href={link.href}
                              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-[var(--gray-600)] hover:text-[var(--red)] transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <ChevronRight className="h-3 w-3 text-gray-300" />
                              {link.name}
                            </Link>
                          ))}
                        </div>
                      ))}

                      {/* Location grid on mobile */}
                      {item.locationGrid && (
                        <div className="pl-4 grid grid-cols-2 gap-1">
                          {item.locationGrid.map((city) => (
                            <Link
                              key={city.slug}
                              href={`/locations/${city.slug}`}
                              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-[var(--gray-600)] hover:text-[var(--red)] transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {city.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Simple children (News) */}
                      {item.children && !item.mega && !item.locationGrid && (
                        <div className="pl-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-[var(--gray-600)] hover:text-[var(--red)] transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <ChevronRight className="h-3 w-3 text-gray-300" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Featured CTA on mobile */}
                      {item.mega?.featured && (
                        <div className="mx-4 mt-3 mb-2">
                          <Link
                            href={item.mega.featured.href}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--red)] text-white text-sm font-bold rounded-lg hover:bg-[var(--red-dark)] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {item.mega.featured.linkText}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Backdrop overlay ── */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 hidden lg:block ${
          activeMega ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={() => setActiveMega(null)}
        aria-hidden="true"
      />
    </>
  )
}
