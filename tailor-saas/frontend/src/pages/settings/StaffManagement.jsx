import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Loader2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import clsx from 'clsx'

const ROLES = ['manager','tailor','receptionist']
const ROLE_COLORS = {
  manager: 'bg-blue-50 text-blue-700 border border-blue-200',
  tailor: 'bg-pink-50 text-mulberry border border-mulberry/20',
  receptionist: 'bg-amber-50 text-amber-700 border border-amber-200',
  shop_owner: 'bg-navy text-white border border-navy'
}

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const loadStaff = () => {
    setLoading(true)
    api.get('/users').then(r => setStaff(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => { loadStaff() }, [])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      await api.post('/users', values)
      toast.success('Staff member created!')
      reset()
      setShowForm(false)
      loadStaff()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed.')
    } finally { setSaving(false) }
  }

  const toggleActive = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active })
      toast.success(`${user.name} ${user.is_active ? 'deactivated' : 'activated'}.`)
      loadStaff()
    } catch { toast.error('Update failed.') }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">Manage your shop's team members</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="card p-5 space-y-4 border-brand-200">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-navy">New Staff Member</h2>
            <button onClick={() => setShowForm(false)} className="btn-ghost btn-sm p-1"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name', { required: true })} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email', { required: true })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register('phone')} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" {...register('role', { required: true })}>
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Password *</label>
              <input type="password" className={`input ${errors.password ? 'input-error' : ''}`}
                {...register('password', { required: true, minLength: 8 })} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Create Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-mulberry border-t-transparent" />
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {staff.map(u => (
                <tr key={u.id}>
                  <td className="font-semibold text-navy">{u.name}</td>
                  <td className="text-sm text-slate-500 font-mono">{u.email}</td>
                  <td><span className={clsx('badge capitalize', ROLE_COLORS[u.role] || 'bg-ink-100 text-ink-600')}>{u.role.replace('_',' ')}</span></td>
                  <td>
                    <span className={clsx('badge capitalize', u.is_active ? 'bg-mint-50 text-mint-700 border border-mint-200' : 'bg-red-50 text-red-700 border border-red-200')}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'shop_owner' && (
                      <button onClick={() => toggleActive(u)}
                        className={clsx('btn-ghost btn-sm text-xs', u.is_active ? 'text-red-500' : 'text-emerald-600')}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
