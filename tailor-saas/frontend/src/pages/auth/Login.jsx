import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Scissors, Loader2, Eye, EyeOff, ChevronLeft, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* ── Left: decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2744 0%, #2d3f6b 40%, #8B1A4A 100%)' }}>
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-8 h-40 w-40 rounded-full bg-brand-400/10" />

        <div className="relative z-10 text-center px-12 max-w-md">
          {/* Logo mark */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <Scissors size={28} className="text-white" />
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight text-white font-display">
            Where Precision<br />
            <span className="italic text-pink-300">Meets Elegance</span>
          </h2>

          <p className="text-white/70 text-base leading-relaxed mb-10">
            Manage your tailoring house with the same care and attention to detail that goes into every stitch.
          </p>

          {/* Features */}
          <div className="space-y-3 text-left">
            {[
              'Customer measurement history',
              'Order tracking & tailor assignments',
              'Revenue reports & thermal receipts',
              'Multi-tenant SaaS architecture',
            ].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-white/10 border border-white/20 shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-300" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login form ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-navy transition-colors text-sm font-medium">
            <ChevronLeft size={15} />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-mulberry shadow-sm">
              <Scissors size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide text-navy font-display">TailorSaaS</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-100 mb-5">
                <Sparkles size={12} className="text-mulberry" />
                <span className="text-[11px] font-semibold text-mulberry tracking-wider">Welcome Back</span>
              </div>
              <h1 className="text-3xl font-bold text-navy mb-2 font-display tracking-tight">
                Sign in to your shop
              </h1>
              <p className="text-slate-400 text-sm">Access your dashboard and manage your tailoring business.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="owner@yourshop.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-mulberry transition-colors">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>}
                <div className="mt-2 text-right">
                  <Link to="/forgot-password" className="text-[12px] font-semibold text-slate-400 hover:text-mulberry transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-1">
                <button id="login-btn" type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                  Enter Your Shop
                </button>
              </div>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔑</span> Demo Access
              </p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>owner@royalstitches.test / <span className="font-mono font-bold text-navy">password</span></p>
                <p>admin@tailorsaas.com / <span className="font-mono font-bold text-navy">password</span></p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              New establishment?{' '}
              <Link to="/register" className="font-semibold text-mulberry hover:text-mulberry-dark transition-colors">
                Register your shop
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
