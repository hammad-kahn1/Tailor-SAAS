import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import api from '../../api/axios'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import Pagination from '../../components/Pagination'
import EmptyState from '../../components/EmptyState'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['pending', 'assigned', 'in_progress', 'ready', 'delivered', 'cancelled']

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const { hasRole } = useAuth()

  const load = useCallback(() => {
    setLoading(true)
    api.get('/orders', { params: { search, status, page } })
      .then(({ data }) => { setOrders(data.data); setMeta(data.meta) })
      .finally(() => setLoading(false))
  }, [search, status, page])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Track stitching orders from intake to delivery."
        action={
          hasRole(['shop_owner', 'manager', 'receptionist']) && (
            <Link to="/orders/new" className="btn-primary"><Plus size={16} /> New Order</Link>
          )
        }
      />

      <div className="card">
        <div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Search size={16} className="text-stone-400" />
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="Search order # or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="input sm:w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-stone-500">Loading...</p>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Order #</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3 hidden md:table-cell">Tailor</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Delivery</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="cursor-pointer hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-ink-800">
                        <Link to={`/orders/${o.id}`}>{o.order_number}</Link>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{o.customer?.full_name}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-stone-600">{o.assignment?.tailor || '-'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-stone-600">{o.delivery_date}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3 text-right font-medium">Rs. {Number(o.total_price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
