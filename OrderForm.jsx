import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import PageHeader from '../../components/PageHeader'

export default function OrderForm() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      customer_id: '', measurement_id: '', delivery_date: '', advance_payment: 0, notes: '',
      items: [{ item_name: '', quantity: 1, unit_price: 0 }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = watch('items')
  const customerId = watch('customer_id')

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)

  useEffect(() => {
    api.get('/customers', { params: { per_page: 100 } }).then(({ data }) => setCustomers(data.data))
  }, [])

  useEffect(() => {
    if (!customerId) { setMeasurements([]); return }
    api.get(`/customers/${customerId}/measurements`).then(({ data }) => setMeasurements(data.data))
  }, [customerId])

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        measurement_id: values.measurement_id || null,
        items: values.items.map((i) => ({ ...i, quantity: Number(i.quantity), unit_price: Number(i.unit_price) })),
      }
      const { data } = await api.post('/orders', payload)
      toast.success('Order created.')
      navigate(`/orders/${data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="New Order" subtitle="Create a stitching order for a customer." />

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-3xl space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Customer *</label>
            <select className="input" {...register('customer_id', { required: 'Select a customer' })}>
              <option value="">Select customer</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
            </select>
            {errors.customer_id && <p className="mt-1 text-xs text-red-600">{errors.customer_id.message}</p>}
          </div>

          <div>
            <label className="label">Measurement (optional)</label>
            <select className="input" {...register('measurement_id')} disabled={!customerId}>
              <option value="">None / decide later</option>
              {measurements.map((m) => (
                <option key={m.id} value={m.id}>{m.type} — v{m.version} ({new Date(m.created_at).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Delivery Date *</label>
            <input type="date" className="input" {...register('delivery_date', { required: 'Delivery date is required' })} />
            {errors.delivery_date && <p className="mt-1 text-xs text-red-600">{errors.delivery_date.message}</p>}
          </div>

          <div>
            <label className="label">Advance Payment</label>
            <input type="number" step="0.01" className="input" {...register('advance_payment')} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Order Items *</label>
            <button type="button" onClick={() => append({ item_name: '', quantity: 1, unit_price: 0 })} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              <Plus size={14} /> Add item
            </button>
          </div>
          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <input className="input flex-[2]" placeholder="e.g. Shirt" {...register(`items.${idx}.item_name`, { required: true })} />
                <input type="number" min="1" className="input w-20" placeholder="Qty" {...register(`items.${idx}.quantity`, { required: true })} />
                <input type="number" step="0.01" className="input w-28" placeholder="Unit price" {...register(`items.${idx}.unit_price`, { required: true })} />
                <button type="button" onClick={() => remove(idx)} disabled={fields.length === 1} className="p-2 text-stone-400 hover:text-red-600 disabled:opacity-30">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end text-sm">
          <p className="font-semibold text-ink-900">Total: Rs. {total.toLocaleString()}</p>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={2} {...register('notes')} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Create Order
          </button>
        </div>
      </form>
    </div>
  )
}
