import { Link } from 'react-router-dom'
import { Scissors, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-850 flex items-center justify-center p-6 font-sans">
      {/* Decorative background overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a853' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />

      <div className="text-center relative z-10 max-w-sm">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-none bg-ink-900 border border-brand-400/30 mb-4 shadow-card">
          <Scissors size={20} className="text-brand-400" />
        </div>
        <h1 className="text-7xl font-black text-ink-900/10 mb-2 font-display">404</h1>
        <h2 className="text-2xl font-bold text-ink-900 mb-2 font-display">Page Not Found</h2>
        <p className="text-ink-500 text-sm mb-6">This page doesn't exist or you don't have permission to view it.</p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
