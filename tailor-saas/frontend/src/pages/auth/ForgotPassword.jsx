import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Scissors, Loader2, ArrowLeft, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async ({ email }) => {
    setSubmitting(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-mulberry shadow-md mb-5">
            <Scissors size={24} className="text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-100 mb-4">
            <span className="text-[11px] font-semibold text-mulberry tracking-wider">Password Recovery</span>
          </div>
          <h1 className="text-3xl font-bold text-navy font-display tracking-tight">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-2">We'll send a recovery link to your email.</p>
        </div>

        <div className="card p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-50 border border-mint-200 mb-4">
                <Mail size={24} className="text-mint-700" />
              </div>
              <p className="font-semibold text-navy text-lg">Check your inbox</p>
              <p className="text-sm text-slate-400 mt-2 max-w-[220px] mx-auto">
                If that email exists in our records, a secure reset link has been dispatched.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="owner@yourshop.com"
                  {...register('email', { required: 'Email is required' })} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Send Recovery Link
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-mulberry transition-colors">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
