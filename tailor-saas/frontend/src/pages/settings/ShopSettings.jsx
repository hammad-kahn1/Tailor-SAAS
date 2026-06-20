import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'

export default function ShopSettings() {
  const { refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    api.get('/auth/me').then(r => {
      const t = r.data.data.tenant
      reset({
        name:    t.name,
        phone:   t.phone,
        address: t.address,
        currency:       t.settings?.currency || 'PKR',
        timezone:       t.settings?.timezone || 'Asia/Karachi',
        receipt_footer: t.settings?.receipt_footer || '',
      })
    })
  }, [reset])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      await api.put('/shop/profile', {
        name: values.name, phone: values.phone, address: values.address,
        settings: { currency: values.currency, timezone: values.timezone, receipt_footer: values.receipt_footer },
      })
      await refreshUser()
      toast.success('Shop settings updated!')
    } catch { toast.error('Failed to save settings.') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="page-title">Shop Settings</h1>
        <p className="page-subtitle">Manage your shop profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Shop Name</label>
            <input className="input" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Currency</label>
            <select className="input" {...register('currency')}>
              <option value="PKR">PKR — Pakistani Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="SAR">SAR — Saudi Riyal</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <textarea className="input" rows={2} {...register('address')} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Receipt Footer Message</label>
            <input className="input" placeholder="e.g. Thank you for your business!" {...register('receipt_footer')} />
          </div>
          <div>
            <label className="label">Timezone</label>
            <select className="input" {...register('timezone')}>
              <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Riyadh">Asia/Riyadh (AST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
