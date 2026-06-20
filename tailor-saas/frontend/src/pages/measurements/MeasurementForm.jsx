import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import clsx from 'clsx'

const SHIRT_FIELDS = ['chest','waist','shoulder','sleeve','neck','length']
const PANT_FIELDS  = ['waist','hip','length','bottom']
const SUIT_COAT    = ['chest','waist','shoulder','sleeve','neck','length']
const SUIT_TROUSER = ['waist','hip','length','bottom']

function FieldGroup({ fields, prefix, register, errors }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {fields.map(f => {
        const key = prefix ? `${prefix}.${f}` : f
        return (
          <div key={key}>
            <label className="label capitalize">{f} (inches)</label>
            <input type="number" step="0.5" className={`input ${errors?.[f] ? 'input-error' : ''}`}
              placeholder="e.g. 40"
              {...register(`data.${key}`, { required: true, min: 1 })} />
          </div>
        )
      })}
    </div>
  )
}

export default function MeasurementForm() {
  const { id: customerId } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState('shirt')
  const [customer, setCustomer] = useState(null)
  const [loadingPrev, setLoadingPrev] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    api.get(`/customers/${customerId}`).then(r => setCustomer(r.data.data))
  }, [customerId])

  const loadPrevious = async () => {
    setLoadingPrev(true)
    try {
      const { data } = await api.get(`/customers/${customerId}/measurements/latest/${type}`)
      reset({ data: data.data?.data, notes: data.data?.notes })
      toast.success(`Loaded previous ${type} measurements (v${data.data?.version})`)
    } catch {
      toast.error('No previous measurements found.')
    } finally {
      setLoadingPrev(false)
    }
  }

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      await api.post('/measurements', { customer_id: parseInt(customerId), type, ...values })
      toast.success('Measurements recorded!')
      navigate(`/customers/${customerId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2"><ArrowLeft size={17} /></button>
        <div>
          <h1 className="page-title">Record Measurements</h1>
          <p className="page-subtitle">{customer?.full_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        {/* Type selector */}
        <div>
          <label className="label">Garment Type</label>
          <div className="flex gap-2">
            {['shirt','pant','suit'].map(t => (
              <button key={t} type="button"
                onClick={() => { setType(t); reset() }}
                className={clsx('flex-1 rounded-none py-2.5 text-xs font-bold uppercase tracking-widest border transition-all capitalize',
                  type === t
                    ? 'bg-ink-900 text-brand-400 border-ink-900 shadow-sm'
                    : 'bg-white text-ink-700 border-brand-400/20 hover:bg-brand-50/50 hover:border-brand-400/40'
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Reuse */}
        <div className="flex justify-end">
          <button type="button" onClick={loadPrevious} disabled={loadingPrev}
            className="btn-secondary btn-sm">
            {loadingPrev ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Reuse Previous
          </button>
        </div>

        {/* Fields */}
        {type === 'shirt' && <FieldGroup fields={SHIRT_FIELDS} prefix="" register={register} errors={errors.data} />}
        {type === 'pant'  && <FieldGroup fields={PANT_FIELDS}  prefix="" register={register} errors={errors.data} />}
        {type === 'suit'  && (
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase text-ink-500">Coat</p>
            <FieldGroup fields={SUIT_COAT} prefix="coat" register={register} errors={errors.data?.coat} />
            <p className="text-xs font-bold uppercase text-ink-500 pt-2 border-t border-ink-100">Trouser</p>
            <FieldGroup fields={SUIT_TROUSER} prefix="trouser" register={register} errors={errors.data?.trouser} />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={2} placeholder="Any special notes about this measurement…"
            {...register('notes')} />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Measurements
          </button>
        </div>
      </form>
    </div>
  )
}
