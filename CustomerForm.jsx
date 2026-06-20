import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function CustomerForm({ initialValues, onSubmit, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initialValues || {} })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { reset(initialValues || {}) }, [initialValues, reset])

  const submit = async (values) => {
    setSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="label">Full Name *</label>
        <input className="input" {...register('full_name', { required: 'Full name is required' })} />
        {errors.full_name && <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Phone Number *</label>
          <input className="input" {...register('phone', { required: 'Phone is required' })} />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" {...register('gender')}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Email (optional, for notifications)</label>
        <input type="email" className="input" {...register('email')} />
      </div>

      <div>
        <label className="label">Address</label>
        <textarea className="input" rows={2} {...register('address')} />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} placeholder="Preferences, fit notes, etc." {...register('notes')} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Save Customer
        </button>
      </div>
    </form>
  )
}
