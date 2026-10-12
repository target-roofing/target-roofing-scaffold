import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Oswald, Source_Sans_3, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DelayedChatWidget from '@/components/DelayedChatWidget'
import TrackingListeners from '@/components/TrackingListeners'
import MobileActions from '@/components/MobileActions'
import './globals.css'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const viewport: Viewport = {width: 'device-width', initialScale: 1, viewportFit: 'cover'}

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://targetroofers.com'),
  alternates: { canonical: './' },
  title: {
    default: 'Roof Repair & Replacement in SW Florida | Target Roofing',
    template: '%s | Target Roofing',
  },
  description:
    'Fast, reliable roof repair and leak fixes for homes and businesses across Fort Myers, Cape Coral, Naples & Sarasota. 24/7 storm-damage response and free roof surveys. FL Lic #CCC1334168. Call 239-332-5707.',
  keywords: [
    'roof repair',
    'roof leak repair',
    'emergency roof repair',
    'roofing contractor Fort Myers',
    'Southwest Florida roofing',
    'storm damage roof repair',
    'roof replacement',
    'Target Roofing',
  ],
  openGraph: {
    title: 'Roof Repair & Replacement in Southwest Florida | Target Roofing',
    description:
      'Fast roof repair, leak fixes, and 24/7 storm response for homes and businesses across SW Florida. Free surveys. Lic #CCC1334168.',
    url: 'https://targetroofers.com',
    siteName: 'Target Roofing',
    type: 'website',
    images: [
      {
        url: 'https://targetroofers.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Target Roofing crew performing emergency roof repair in Southwest Florida',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roof Repair & Replacement in Southwest Florida | Target Roofing',
    description:
      'Fast roof repair, leak fixes, and 24/7 storm response for homes and businesses across SW Florida.',
    images: ['https://targetroofers.com/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${oswald.variable} ${sourceSans.variable} ${poppins.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[var(--red)] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RoofingContractor',
              'name': 'Target Roofing',
              'image': 'https://targetroofers.com/og-image.jpg',
              'logo': 'https://targetroofers.com/images/logos/target-roofing-logo-2x.png',
              '@id': 'https://targetroofers.com',
              'url': 'https://targetroofers.com',
              'telephone': '+1-239-332-5707',
              'email': 'projects@targetroofers.com',
              'priceRange': '$$',
              'identifier': {
                '@type': 'PropertyValue',
                'propertyID': 'FL Roofing Contractor License',
                'value': 'CCC1334168',
              },
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': '7011 Nalle Grade Rd',
                'addressLocality': 'North Fort Myers',
                'addressRegion': 'FL',
                'postalCode': '33917',
                'addressCountry': 'US',
              },
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 26.7128,
                'longitude': -81.8998,
              },
              'openingHoursSpecification': [
                {
                  '@type': 'OpeningHoursSpecification',
                  'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                  'opens': '08:00',
                  'closes': '17:00',
                },
              ],
              'areaServed': [
                'Fort Myers',
                'Cape Coral',
                'Bonita Springs',
                'Sanibel',
                'Naples',
                'Punta Gorda',
                'Port Charlotte',
                'Sarasota',
                'Arcadia',
              ].map((name) => ({ '@type': 'City', name })),
            }),
          }}
        />
        <Header />
        <main id="main-content" className="pt-[7.5rem]">{children}</main>
        <Footer />
        <MobileActions />
        <DelayedChatWidget />
        <TrackingListeners />
        <Analytics />
        <SpeedInsights />
        {/* OpenAI (ChatGPT Ads) conversion pixel — official setup code, Pixel ID FEohsvWdD9sBAXVH9PngLf.
            Auto-fires page_viewed on init; conversions fire via src/lib/tracking.ts
            (lead_created on form submit, custom "call_click" on phone-number clicks). */}
        <Script id="openai-ads-pixel" strategy="afterInteractive">
          {`if(!/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname))!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");if(window.oaiq){oaiq("init",{pixelId:"FEohsvWdD9sBAXVH9PngLf",debug:true});oaiq("measure","page_viewed",{type:"contents"});}`}
        </Script>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
