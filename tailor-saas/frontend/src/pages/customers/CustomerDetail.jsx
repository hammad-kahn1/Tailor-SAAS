import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Plus, Ruler, ShoppingBag, Phone, MapPin, User, Mail, FileText } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

function MeasurementCard({ m }) {
  const entries = Object.entries(m.data || {})
  return (
    <div className="card p-4 space-y-3 hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-navy capitalize">{m.type}</span>
        <span className="badge bg-mulberry-light text-mulberry border border-mulberry/20">v{m.version}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {entries.map(([k, v]) => (
          typeof v === 'object' ? null :
          <div key={k} className="text-center p-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 capitalize mb-0.5">{k}</div>
            <div className="text-sm font-bold text-navy">{v}"</div>
          </div>
        ))}
      </div>
      {m.notes && <p className="text-xs text-slate-400 italic">{m.notes}</p>}
      <p className="text-[10px] text-slate-400">
        Recorded by {m.recorded_by?.name} · {new Date(m.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [history, setHistory] = useState({ measurements: [], orders: [] })
  const [tab, setTab] = useState('measurements')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/customers/${id}`),
      api.get(`/customers/${id}/history`),
    ]).then(([cr, hr]) => {
      setCustomer(cr.data.data)
      setHistory(hr.data.data)
    }).catch(() => toast.error('Failed to load customer.'))
    .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-7 w-7 animate-spin rounded-full border-4 border-mulberry border-t-transparent" />
    </div>
  )
  if (!customer) return <div className="text-center py-20 text-slate-400">Customer not found.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2 mt-1"><ArrowLeft size={17} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy font-display">{customer.full_name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Customer profile & history</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/customers/${id}/measurements/new`} className="btn-secondary btn-sm">
            <Ruler size={14} /> Measure
          </Link>
          <Link to={`/customers/${id}/edit`} className="btn-primary btn-sm">
            <Edit size={14} /> Edit
          </Link>
        </div>
      </div>

      {/* Info Card */}
      <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2.5 text-sm text-slate-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Phone size={14} className="text-blue-600" />
          </div>
          {customer.phone}
        </div>
        {customer.email && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
              <Mail size={14} className="text-mulberry" />
            </div>
            {customer.email}
          </div>
        )}
        {customer.address && (
          <div className="flex items-center gap-2.5 text-sm text-slate-600 sm:col-span-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 shrink-0">
              <MapPin size={14} className="text-amber-600" />
            </div>
            {customer.address}
          </div>
        )}
        <div className="flex items-center gap-2.5 text-sm text-slate-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <User size={14} className="text-slate-500" />
          </div>
          <span className="capitalize">{customer.gender || 'Not specified'}</span>
        </div>
        {customer.notes && (
          <div className="col-span-full text-sm text-slate-500 italic border-t border-slate-100 pt-3 mt-1 flex items-start gap-2">
            <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <span>{customer.notes}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[['measurements', 'Measurements', history.measurements?.length],
          ['orders', 'Orders', history.orders?.length]
        ].map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key
                ? 'bg-white text-navy shadow-sm'
                : 'text-slate-500 hover:text-navy'
            )}>
            {label}
            <span className={clsx(
              'ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold',
              tab === key ? 'bg-mulberry-light text-mulberry' : 'bg-slate-200 text-slate-500'
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'measurements' && (
        <div>
          {history.measurements?.length === 0 ? (
            <div className="card py-12 text-center text-slate-400">
              <Ruler size={36} className="mx-auto mb-2 opacity-30" />
              <p>No measurements recorded yet.</p>
              <Link to={`/customers/${id}/measurements/new`} className="btn-primary btn-sm mt-4 inline-flex">
                <Plus size={14} /> Add Measurements
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.measurements?.map(m => <MeasurementCard key={m.id} m={m} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="card overflow-hidden">
          {history.orders?.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="table-wrapper border-0 rounded-none">
              <table className="table">
                <thead><tr><th>Order #</th><th>Status</th><th>Total</th><th>Delivery</th><th></th></tr></thead>
                <tbody>
                  {history.orders?.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs text-mulberry font-semibold">
                        <Link to={`/orders/${o.id}`} className="hover:underline">{o.order_number}</Link>
                      </td>
                      <td><span className={`badge-${o.status}`}>{o.status.replace('_',' ')}</span></td>
                      <td className="font-semibold text-navy">PKR {Number(o.total_price).toLocaleString()}</td>
                      <td className="text-xs text-slate-500">{o.delivery_date}</td>
                      <td><Link to={`/orders/${o.id}`} className="btn-ghost btn-sm text-xs">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
