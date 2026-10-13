'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'
import { verifyAdminLogin } from '@/app/actions'

export default function AdminLogin({googleLogin='/office/login?next=%2Foffice%2Fadministration'}:{googleLogin?:string}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await verifyAdminLogin(email, password)
    if (result.success) router.refresh()
    else { setError(result.error || 'Invalid admin credentials. Access Denied.'); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[var(--gray-50)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-[var(--gray-200)] rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--red)]/10 px-4 py-1.5 text-xs font-bold text-[var(--red)] uppercase tracking-wider select-none">
            <Shield className="h-4 w-4" />
            Admin Access
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] uppercase tracking-tight text-[var(--black)]">Target Management</h1>
          <p className="text-xs text-[var(--gray-400)] font-semibold mt-1">Target Roofing Administrative Console</p>
        </div>
        <a href={googleLogin} className="mb-6 flex w-full items-center justify-center rounded-lg bg-[var(--red)] px-4 py-3 text-sm font-bold text-white">Continue with your Office Google account</a>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs font-semibold">{error}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--gray-500)] mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@targetroofers.com" autoComplete="username email"
              className="w-full px-4 py-3 rounded-lg border border-[var(--gray-300)] bg-white text-base text-[var(--black)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--gray-500)] mb-1.5">Access Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"
              className="w-full px-4 py-3 rounded-lg border border-[var(--gray-300)] bg-white text-base text-[var(--black)] focus:outline-none focus:ring-2 focus:ring-[var(--red)]" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-4 bg-[var(--red)] hover:bg-[var(--red-dark)] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md disabled:opacity-50 font-[family-name:var(--font-display)]">
            {loading ? 'Authenticating...' : 'Sign In to Console'}
          </button>
        </form>
      </div>
    </div>
  )
}
