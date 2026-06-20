import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Plus, Calendar } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUSES = ['','pending','assigned','in_progress','ready','delivered','cancelled']

export default function OrderList() {
  const [params] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(params.get('status') || '')
  const [page, setPage] = useState(1)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/orders', { params: { search, status, page, per_page: 15 } })
      setOrders(data.data)
      setMeta(data.meta)
    } catch { toast.error('Failed to load orders.') }
    finally { setLoading(false) }
  }, [search, status, page])

  useEffect(() => { fetch() }, [fetch])

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{meta?.total ?? '—'} total orders</p>
        </div>
        <Link to="/orders/new" id="new-order-btn" className="btn-primary">
          <Plus size={15} /> New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search order # or customer…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select className="input sm:w-44" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s ? s.replace('_',' ') : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-ink-400">No orders found.</div>
        ) : (
          <div className="table-wrapper border-0 rounded-none">
            <table className="table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Balance</th><th>Delivery</th><th>Status</th><th></th></tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono text-xs text-ink-900 font-bold hover:text-brand-500 transition-colors hover:underline">
                      <Link to={`/orders/${o.id}`}>{o.order_number}</Link>
                    </td>
                    <td>
                      <Link to={`/customers/${o.customer?.id}`} className="font-semibold text-ink-800 hover:text-brand-500 transition-colors">
                        {o.customer?.full_name}
                      </Link>
                      <div className="text-xs text-ink-400 font-mono">{o.customer?.phone}</div>
                    </td>
                    <td className="text-xs text-ink-500">{o.items?.length ?? '—'} item(s)</td>
                    <td className="font-semibold">PKR {Number(o.total_price).toLocaleString()}</td>
                    <td className={clsx('text-xs font-semibold', Number(o.remaining_payment) > 0 ? 'text-brand-600' : 'text-ink-400 font-normal')}>
                      PKR {Number(o.remaining_payment).toLocaleString()}
                    </td>
                    <td className="text-xs text-ink-600">
                      <div className="flex items-center gap-1"><Calendar size={12} className="text-brand-400" />{o.delivery_date}</div>
                    </td>
                    <td><span className={`badge-${o.status}`}>{o.status.replace('_',' ')}</span></td>
                    <td>
                      <Link to={`/orders/${o.id}`} className="btn-ghost btn-sm text-xs">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta?.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100">
            <p className="text-xs text-ink-500">Page {meta.current_page} of {meta.last_page} ({meta.total} orders)</p>
            <div className="flex gap-1">
              {[...Array(meta.last_page)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={clsx('btn btn-sm w-8 h-8 p-0 justify-center text-xs rounded-none',
                    page === i+1 ? 'btn-primary' : 'btn-secondary')}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
