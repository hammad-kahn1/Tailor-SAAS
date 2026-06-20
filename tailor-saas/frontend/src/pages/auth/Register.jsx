import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Scissors, Loader2, ChevronLeft, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'

const inputCls = (err) =>
  `input ${err ? 'input-error' : ''}`

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await api.post('/auth/register-tenant', values)
      await login(values.email, values.password)
      toast.success('Shop registered! Welcome aboard 🎉')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left: decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2744 0%, #2d3f6b 50%, #8B1A4A 100%)' }}>
        {/* Pattern */}
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5" />

        <div className="relative z-10 text-center px-10">
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <Store size={28} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4 font-display tracking-tight">
            Open Your Digital<br />
            <span className="italic text-pink-300">Tailor House</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            14 days free. No credit card. Cancel anytime. Your data, your shop, your rules.
          </p>
          <div className="space-y-3 text-left">
            {['Full measurement history','Order lifecycle tracking','Tailor workload management','PDF receipts & reports'].map(f => (
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

      {/* Right: form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-navy transition-colors text-sm font-medium">
            <ChevronLeft size={15} /> Back to home
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-mulberry shadow-sm">
              <Scissors size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide text-navy font-display">TailorSaaS</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-100 mb-5">
                <Store size={12} className="text-mulberry" />
                <span className="text-[11px] font-semibold text-mulberry tracking-wider">New Establishment</span>
              </div>
              <h1 className="text-3xl font-bold text-navy font-display tracking-tight">Register Your Shop</h1>
              <p className="text-slate-400 text-sm mt-2">Set up your tailor shop in under 2 minutes.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Shop Name *</label>
                  <input className={inputCls(errors.shop_name)} placeholder="Royal Stitches Tailoring"
                    {...register('shop_name', { required: true })} />
                </div>
                <div>
                  <label className="label">Your Name *</label>
                  <input className={inputCls(errors.name)} placeholder="Ahmed Khan"
                    {...register('name', { required: true })} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className={inputCls(false)} placeholder="0300-1234567" {...register('phone')} />
                </div>
                <div className="col-span-2">
                  <label className="label">Email *</label>
                  <input type="email" className={inputCls(errors.email)} placeholder="owner@yourshop.com"
                    {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })} />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input type="password" className={inputCls(errors.password)} placeholder="Min 8 chars"
                    {...register('password', { required: true, minLength: 8 })} />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input type="password" className={inputCls(errors.password_confirmation)} placeholder="Repeat"
                    {...register('password_confirmation', { validate: v => v === watch('password') || 'Must match' })} />
                  {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>}
                </div>
              </div>

              <div className="pt-1">
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                  {submitting && <Loader2 size={15} className="animate-spin" />}
                  Open My Shop
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-mulberry hover:text-mulberry-dark transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
