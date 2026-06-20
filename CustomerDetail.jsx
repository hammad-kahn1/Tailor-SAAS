import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Ruler, Plus, ArrowLeft } from 'lucide-react'
import api from '../../api/axios'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import MeasurementForm from '../measurements/MeasurementForm'

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [history, setHistory] = useState(null)
  const [tab, setTab] = useState('orders')
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false)

  const load = useCallback(() => {
    api.get(`/customers/${id}`).then(({ data }) => setCustomer(data.data))
    api.get(`/customers/${id}/history`).then(({ data }) => setHistory(data.data))
  }, [id])

  useEffect(() => { load() }, [load])

  if (!customer) return <p className="text-stone-500">Loading...</p>

  return (
    <div>
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-ink-800">
        <ArrowLeft size={14} /> Back to customers
      </Link>

      <PageHeader
        title={customer.full_name}
        subtitle={`${customer.phone}${customer.gender ? ' · ' + customer.gender : ''}`}
        action={
          <button className="btn-primary" onClick={() => setMeasurementModalOpen(true)}>
            <Ruler size={16} /> Record Measurement
          </button>
        }
      />

      {customer.notes && (
        <div className="card mb-6 p-4 text-sm text-stone-600">
          <span className="font-medium text-ink-700">Notes: </span>{customer.notes}
        </div>
      )}

      <div className="mb-4 flex gap-2 border-b border-stone-200">
        {['orders', 'measurements'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-stone-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        history?.orders?.length ? (
          <div className="space-y-3">
            {history.orders.map((o) => (
              <Link to={`/orders/${o.id}`} key={o.id} className="card flex items-center justify-between p-4 hover:border-brand-300">
                <div>
                  <p className="font-medium text-ink-800">{o.order_number}</p>
                  <p className="text-sm text-stone-500">
                    {o.items?.map((i) => `${i.item_name} x${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-600">Rs. {Number(o.total_price).toLocaleString()}</p>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : <EmptyState title="No orders yet" />
      )}

      {tab === 'measurements' && (
        history?.measurements?.length ? (
          <div className="space-y-3">
            {history.measurements.map((m) => (
              <div key={m.id} className="card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium capitalize text-ink-800">{m.type} — v{m.version}</p>
                  <p className="text-xs text-stone-400">{new Date(m.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-600">
                  {Object.entries(flatten(m.data)).map(([k, v]) => (
                    <span key={k}><span className="text-stone-400 capitalize">{k.replaceAll('.', ' ')}:</span> {v}</span>
                  ))}
                </div>
                {m.notes && <p className="mt-2 text-xs text-stone-500">{m.notes}</p>}
              </div>
            ))}
          </div>
        ) : <EmptyState title="No measurements recorded" action={
          <button className="btn-primary mt-2" onClick={() => setMeasurementModalOpen(true)}><Plus size={14} /> Add Measurement</button>
        } />
      )}

      <Modal open={measurementModalOpen} onClose={() => setMeasurementModalOpen(false)} title="Record Measurement" wide>
        <MeasurementForm
          customerId={id}
          onSaved={() => { setMeasurementModalOpen(false); load() }}
          onCancel={() => setMeasurementModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

function flatten(obj, prefix = '') {
  return Object.entries(obj || {}).reduce((acc, [k, v]) => {
    if (v && typeof v === 'object') {
      Object.assign(acc, flatten(v, `${prefix}${k}.`))
    } else {
      acc[`${prefix}${k}`] = v
    }
    return acc
  }, {})
}
