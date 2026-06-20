import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Scissors, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      const dest = location.state?.from?.pathname || '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      const message = err.response?.data?.errors?.email?.[0]
        || err.response?.data?.message
        || 'Unable to log in. Please check your credentials.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Scissors size={24} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">TailorSaaS</h1>
          <p className="text-sm text-stone-500">Sign in to manage your shop</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="owner@yourshop.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            <div className="mt-1 text-right">
              <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          New shop? <Link to="/register" className="text-brand-600 font-medium hover:underline">Start your free trial</Link>
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-stone-300 bg-white p-3 text-xs text-stone-500">
          <p className="font-medium text-stone-600 mb-1">Demo credentials</p>
          owner@royalstitches.test / password
        </div>
      </div>
    </div>
  )
}
