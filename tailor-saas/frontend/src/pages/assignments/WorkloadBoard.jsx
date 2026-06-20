import { useEffect, useState } from 'react'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function WorkloadBoard() {
  const [workload, setWorkload] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/assignments/workload')
      .then(r => setWorkload(r.data.data))
      .catch(() => toast.error('Failed to load workload.'))
      .finally(() => setLoading(false))
  }, [])

  const total = (t) => (t.assigned_count + t.in_progress_count + t.completed_count) || 1

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tailor Workload</h1>
          <p className="page-subtitle">Current assignment distribution</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : workload.length === 0 ? (
        <div className="card py-16 text-center text-ink-400">No tailors found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workload.map(tailor => {
            const pct = n => Math.round((n / total(tailor)) * 100)
            return (
              <div key={tailor.id} className="card p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-none bg-ink-900 flex items-center justify-center text-brand-400 font-bold text-sm border border-brand-400/20">
                    {tailor.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-ink-800">{tailor.name}</p>
                    <p className="text-xs text-ink-400 font-mono">{tailor.email}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Assigned',    count: tailor.assigned_count,    color: 'bg-ink-400' },
                    { label: 'In Progress', count: tailor.in_progress_count, color: 'bg-brand-400' },
                    { label: 'Completed',   count: tailor.completed_count,   color: 'bg-ink-900' },
                  ].map(row => (
                    <div key={row.label}>
                      <div className="flex justify-between text-xs text-ink-500 mb-1">
                        <span>{row.label}</span><span className="font-semibold">{row.count}</span>
                      </div>
                      <div className="h-1.5 rounded-none bg-ink-100 overflow-hidden">
                        <div className={clsx('h-full rounded-none transition-all', row.color)}
                          style={{ width: `${pct(row.count)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-xs font-semibold text-ink-500 border-t border-ink-100 pt-2">
                  <span>Total active</span>
                  <span className="text-ink-800">{tailor.assigned_count + tailor.in_progress_count}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
