import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Loader2, CheckCircle } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_NEXT = { assigned: 'in_progress', in_progress: 'completed' }

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/assignments/my', { params: { status: filter || undefined } })
      .then(r => setAssignments(r.data.data || r.data))
      .catch(() => toast.error('Failed to load assignments.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter])

  const advance = async (a) => {
    const next = STATUS_NEXT[a.status]
    if (!next) return
    setUpdating(a.id)
    try {
      await api.patch(`/assignments/${a.id}/status`, { status: next })
      toast.success(`Marked as ${next.replace('_',' ')}`)
      load()
    } catch { toast.error('Update failed.') }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Assignments</h1>
          <p className="page-subtitle">Your current work queue</p>
        </div>
        <select className="input w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="card py-16 text-center text-ink-400">
          <CheckCircle size={36} className="mx-auto mb-2 opacity-30" />
          <p>No assignments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/orders/${a.order?.id}`} className="font-mono text-sm font-bold text-brand-600 hover:underline">
                    {a.order?.order_number}
                  </Link>
                  <span className={`badge-${a.status}`}>{a.status.replace('_',' ')}</span>
                </div>
                <p className="font-semibold text-ink-800">{a.order?.customer?.full_name}</p>
                <p className="text-xs text-ink-400">{a.order?.customer?.phone}</p>
                <div className="flex items-center gap-1 text-xs text-ink-500 mt-1">
                  <Calendar size={12} />
                  Delivery: {a.order?.delivery_date}
                </div>
                {a.order?.items?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.order.items.map((item, i) => (
                      <span key={i} className="badge bg-ink-100 text-ink-600">{item.item_name} ×{item.quantity}</span>
                    ))}
                  </div>
                )}
              </div>
              {STATUS_NEXT[a.status] && (
                <button onClick={() => advance(a)} disabled={updating === a.id}
                  className="btn-primary btn-sm self-start sm:self-center">
                  {updating === a.id ? <Loader2 size={13} className="animate-spin" /> : null}
                  {a.status === 'assigned' ? 'Start Work' : 'Mark Complete'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
