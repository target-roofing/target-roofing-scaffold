import Link from 'next/link'

export default function MobileActions() {
  return <nav className="mobile-actionbar" aria-label="Quick contact">
    <a href="tel:+12393325707" aria-label="Call Target Roofing">Call</a>
    <Link href="/contact">Request service</Link>
  </nav>
}
