import { useEffect, useState, useCallback } from 'react'
import { Shield, Search } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ACTION_COLORS = {
  created: 'bg-brand-400 text-ink-950 border border-brand-400',
  updated: 'bg-brand-400/10 text-brand-300 border border-brand-400/20',
  deleted: 'bg-red-950/20 text-red-400 border border-red-900/30',
  status_changed: 'bg-ink-100 text-ink-800 border border-ink-300',
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ from_date:'', to_date:'', model_type:'' })
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/audit-logs', { params: { ...filters, page, per_page: 20 } })
      setLogs(data.data)
      setMeta(data.meta)
    } catch { toast.error('Failed to load audit logs.') }
    finally { setLoading(false) }
  }, [filters, page])

  useEffect(() => { load() }, [load])

  const modelShort = (type) => type?.split('\\').pop() || type

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Shield size={20} className="text-brand-400" /> Audit Log</h1>
        <p className="page-subtitle">Track all user actions in your shop</p>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap gap-3">
        <input type="text" className="input flex-1 min-w-36" placeholder="Filter by model (e.g. Order)"
          value={filters.model_type} onChange={e => setFilters(f => ({ ...f, model_type: e.target.value }))} />
        <input type="date" className="input w-36" value={filters.from_date}
          onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))} />
        <input type="date" className="input w-36" value={filters.to_date}
          onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-ink-400">No audit entries found.</div>
        ) : (
          <div className="table-wrapper border-0 rounded-none">
            <table className="table">
              <thead><tr><th>When</th><th>User</th><th>Action</th><th>Model</th><th>Changes</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-xs text-ink-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="font-medium text-ink-100">{log.user?.name || 'System'}</td>
                    <td>
                      <span className={clsx('badge', ACTION_COLORS[log.action] || 'bg-ink-100 text-ink-600')}>
                        {log.action.replace('_',' ')}
                      </span>
                    </td>
                    <td className="text-xs font-mono text-brand-400">{modelShort(log.model_type)} #{log.model_id}</td>
                    <td className="text-xs text-ink-500 max-w-xs truncate">
                      {log.new_values ? JSON.stringify(log.new_values).slice(0, 80) + '…' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta?.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100">
            <p className="text-xs text-ink-500">Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-1">
              {[...Array(Math.min(meta.last_page, 10))].map((_, i) => (
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
