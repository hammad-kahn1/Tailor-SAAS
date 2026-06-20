import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { ArrowLeft, Loader2, Plus, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'

export default function OrderForm() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searching, setSearching] = useState(false)

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: { items: [{ item_name: '', quantity: 1, unit_price: '' }], advance_payment: 0 }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.unit_price) || 0), 0)

  const searchCustomers = async () => {
    if (!customerSearch.trim()) return
    setSearching(true)
    try {
      const { data } = await api.get('/customers', { params: { search: customerSearch, per_page: 8 } })
      setCustomers(data.data)
    } finally { setSearching(false) }
  }

  const onSubmit = async (values) => {
    if (!selectedCustomer) return toast.error('Please select a customer.')
    setSaving(true)
    try {
      const payload = {
        customer_id:     selectedCustomer.id,
        delivery_date:   values.delivery_date,
        advance_payment: Number(values.advance_payment) || 0,
        notes:           values.notes,
        items:           values.items.map(i => ({
          item_name:  i.item_name,
          quantity:   Number(i.quantity),
          unit_price: Number(i.unit_price),
        })),
      }
      const { data } = await api.post('/orders', payload)
      toast.success(`Order ${data.data.order_number} created!`)
      navigate(`/orders/${data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order.')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2"><ArrowLeft size={17} /></button>
        <div>
          <h1 className="page-title">New Order</h1>
          <p className="page-subtitle">Create a stitching order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Customer Selection */}
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-bold text-ink-800">1. Select Customer</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input pl-9" placeholder="Search customer by name or phone…"
                value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchCustomers())} />
            </div>
            <button type="button" onClick={searchCustomers} disabled={searching} className="btn-secondary btn-sm px-4">
              {searching ? <Loader2 size={13} className="animate-spin" /> : 'Search'}
            </button>
          </div>
          {customers.length > 0 && !selectedCustomer && (
            <div className="border border-brand-400/20 rounded-none divide-y divide-ink-100 overflow-hidden">
              {customers.map(c => (
                <button key={c.id} type="button"
                  onClick={() => { setSelectedCustomer(c); setCustomers([]) }}
                  className="w-full text-left px-4 py-2.5 hover:bg-brand-50/50 transition-colors text-sm">
                  <span className="font-semibold text-ink-800">{c.full_name}</span>
                  <span className="text-ink-400 ml-2 font-mono">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
          {selectedCustomer && (
            <div className="flex items-center justify-between rounded-none bg-brand-50/50 border border-brand-400/20 px-4 py-2.5">
              <div>
                <span className="font-semibold text-brand-850">{selectedCustomer.full_name}</span>
                <span className="text-brand-600 ml-2 text-xs font-mono">{selectedCustomer.phone}</span>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="text-[10px] font-bold uppercase tracking-wider text-brand-500 hover:text-brand-700">Change</button>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-bold text-ink-800">2. Order Items</h2>
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <input className="input flex-[2]" placeholder="Item name (e.g. Shirt)"
                  {...register(`items.${idx}.item_name`, { required: true })} />
                <input type="number" className="input w-20" placeholder="Qty" min={1}
                  {...register(`items.${idx}.quantity`, { required: true, min: 1 })} />
                <input type="number" className="input w-28" placeholder="Price"
                  {...register(`items.${idx}.unit_price`, { required: true, min: 1 })} />
                <button type="button" onClick={() => remove(idx)} className="btn-ghost btn-sm p-2 text-red-400 hover:bg-red-50 mt-0.5">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => append({ item_name:'', quantity:1, unit_price:'' })}
            className="btn-secondary btn-sm">
            <Plus size={13} /> Add Item
          </button>
          <div className="flex justify-end pt-2 border-t border-ink-100">
            <div className="text-right">
              <p className="text-xs text-ink-500">Total</p>
              <p className="text-xl font-bold text-ink-900">PKR {total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Delivery & Payment */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-bold text-ink-800">3. Delivery & Payment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Delivery Date *</label>
              <input type="date" className={`input ${errors.delivery_date ? 'input-error' : ''}`}
                min={new Date().toISOString().split('T')[0]}
                {...register('delivery_date', { required: 'Delivery date is required' })} />
              {errors.delivery_date && <p className="mt-1 text-xs text-red-600">{errors.delivery_date.message}</p>}
            </div>
            <div>
              <label className="label">Advance Payment (PKR)</label>
              <input type="number" className="input" placeholder="0" min={0}
                {...register('advance_payment')} />
              <p className="mt-1 text-xs text-ink-400">
                Balance: PKR {Math.max(0, total - Number(watch('advance_payment') || 0)).toLocaleString()}
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input" rows={2} placeholder="Slim fit preferred, special fabric, etc."
                {...register('notes')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            Create Order
          </button>
        </div>
      </form>
    </div>
  )
}
