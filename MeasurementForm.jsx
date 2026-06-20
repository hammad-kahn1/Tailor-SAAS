import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, RotateCcw } from 'lucide-react'
import api from '../../api/axios'

const FIELD_SETS = {
  shirt: [
    ['chest', 'Chest'], ['waist', 'Waist'], ['shoulder', 'Shoulder'],
    ['sleeve', 'Sleeve'], ['neck', 'Neck'], ['length', 'Length'],
  ],
  pant: [
    ['waist', 'Waist'], ['hip', 'Hip'], ['length', 'Length'], ['bottom', 'Bottom'],
  ],
}

/**
 * Renders the correct measurement fields for the selected type.
 * "Suit" combines a Coat (shirt-like) + Trouser (pant-like) field set.
 * Supports "Quick Reuse": fetches the customer's latest measurement of the
 * selected type and pre-fills the form, so re-measuring is just adjusting deltas.
 */
export default function MeasurementForm({ customerId, defaultType = 'shirt', onSaved, onCancel }) {
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: { type: defaultType, data: {} } })
  const [submitting, setSubmitting] = useState(false)
  const [reusing, setReusing] = useState(false)
  const type = watch('type')

  const quickReuse = async () => {
    setReusing(true)
    try {
      const { data } = await api.get(`/customers/${customerId}/measurements/latest/${type}`)
      if (data.data) {
        reset({ type, data: data.data.data })
      }
    } finally {
      setReusing(false)
    }
  }

  useEffect(() => { reset({ type, data: {} }) }, [type, reset])

  const submit = async (values) => {
    setSubmitting(true)
    try {
      await api.post('/measurements', { customer_id: customerId, type: values.type, data: values.data, notes: values.notes })
      onSaved()
    } finally {
      setSubmitting(false)
    }
  }

  const renderFields = (prefix, fields) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {fields.map(([key, label]) => (
        <div key={key}>
          <label className="label">{label} (in)</label>
          <input type="number" step="0.1" className="input" {...register(`data.${prefix}${key}`)} />
        </div>
      ))}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="label">Measurement Type</label>
          <select className="input" {...register('type')}>
            <option value="shirt">Shirt</option>
            <option value="pant">Pant</option>
            <option value="suit">Suit (Coat + Trouser)</option>
          </select>
        </div>
        <button type="button" onClick={quickReuse} disabled={reusing} className="btn-secondary">
          <RotateCcw size={14} className={reusing ? 'animate-spin' : ''} /> Quick Reuse
        </button>
      </div>

      {type === 'shirt' && renderFields('', FIELD_SETS.shirt)}
      {type === 'pant' && renderFields('', FIELD_SETS.pant)}
      {type === 'suit' && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-700">Coat</p>
            {renderFields('coat.', FIELD_SETS.shirt)}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink-700">Trouser</p>
            {renderFields('trouser.', FIELD_SETS.pant)}
          </div>
        </div>
      )}

      <div>
        <label className="label">Notes</label>
        <textarea className="input" rows={2} {...register('notes')} />
      </div>

      <p className="text-xs text-stone-400">
        Saving creates a new version — previous measurements are kept for history and never overwritten.
      </p>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Save Measurement
        </button>
      </div>
    </form>
  )
}
