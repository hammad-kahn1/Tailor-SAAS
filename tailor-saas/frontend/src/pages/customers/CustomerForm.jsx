import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'

export default function CustomerForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}`).then(r => reset(r.data.data)).catch(() => toast.error('Failed to load customer.'))
    }
  }, [id, isEdit, reset])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, values)
        toast.success('Customer updated.')
      } else {
        const { data } = await api.post('/customers', values)
        toast.success('Customer created.')
        navigate(`/customers/${data.data.id}`)
        return
      }
      navigate(`/customers/${id}`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2"><ArrowLeft size={17} /></button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Customer' : 'New Customer'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update customer information' : 'Add a new customer to your shop'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Full Name *</label>
            <input id="full_name" className={`input ${errors.full_name ? 'input-error' : ''}`}
              placeholder="Hassan Raza"
              {...register('full_name', { required: 'Full name is required' })} />
            {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number *</label>
            <input id="phone" className={`input ${errors.phone ? 'input-error' : ''}`}
              placeholder="0300-1234567"
              {...register('phone', { required: 'Phone is required' })} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input id="email" type="email" className="input" placeholder="customer@example.com"
              {...register('email')} />
          </div>

          <div>
            <label className="label">Gender</label>
            <select id="gender" className="input" {...register('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <textarea className="input" rows={2} placeholder="Street, City, Province"
              {...register('address')} />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={3} placeholder="Any special requirements or notes…"
              {...register('notes')} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? 'Update Customer' : 'Create Customer'}
          </button>
        </div>
      </form>
    </div>
  )
}
