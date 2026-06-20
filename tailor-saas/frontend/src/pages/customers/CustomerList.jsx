import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Plus, Trash2, Eye, Filter, Edit } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

const GENDER_OPTS = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export default function CustomerList() {
  const [params, setParams] = useSearchParams()
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(params.get('search') || '')
  const [gender, setGender] = useState(params.get('gender') || '')
  const { canManage } = useAuth()

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/customers', { params: { search, gender, page, per_page: 15 } })
      setCustomers(data.data)
      setMeta(data.meta)
    } catch { toast.error('Failed to load customers.') }
    finally { setLoading(false) }
  }, [search, gender])

  useEffect(() => { fetchCustomers(parseInt(params.get('page') || '1')) }, [fetchCustomers, params])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/customers/${id}`)
      toast.success('Customer deleted.')
      fetchCustomers()
    } catch { toast.error('Delete failed.') }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{meta?.total ?? '—'} total customers</p>
        </div>
        <Link to="/customers/new" id="new-customer-btn" className="btn-primary">
          <Plus size={15} /> Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input id="customer-search" type="text" className="input pl-9" placeholder="Search by name, phone, email…"
             value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input sm:w-40" value={gender} onChange={e => setGender(e.target.value)}>
          {GENDER_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-mulberry border-t-transparent" />
          </div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Plus size={40} className="mx-auto mb-3 opacity-30" />
            <p>No customers found.</p>
          </div>
        ) : (
          <div className="table-wrapper border-0 rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th><th>Phone</th><th>Gender</th><th>Notes</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/customers/${c.id}`} className="font-semibold text-navy hover:text-mulberry transition-colors hover:underline">
                        {c.full_name}
                      </Link>
                      {c.email && <div className="text-xs text-slate-400 font-mono">{c.email}</div>}
                    </td>
                    <td className="font-mono text-xs text-slate-500">{c.phone}</td>
                    <td>
                      {c.gender && (
                        <span className={clsx('badge', {
                          'bg-blue-50 text-blue-700 border border-blue-200': c.gender === 'male',
                          'bg-pink-50 text-pink-700 border border-pink-200': c.gender === 'female',
                          'bg-slate-100 text-slate-600 border border-slate-200': c.gender === 'other',
                        })}>
                          {c.gender}
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-slate-400 max-w-[200px] truncate">{c.notes || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link to={`/customers/${c.id}`} className="btn-ghost btn-sm p-1.5" title="View">
                          <Eye size={14} />
                        </Link>
                        <Link to={`/customers/${c.id}/edit`} className="btn-ghost btn-sm p-1.5" title="Edit">
                          <Edit size={14} />
                        </Link>
                        {canManage && (
                          <button onClick={() => handleDelete(c.id, c.full_name)}
                            className="btn-ghost btn-sm p-1.5 text-red-500 hover:bg-red-50" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta?.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {meta.current_page} of {meta.last_page}</p>
            <div className="flex gap-2">
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchCustomers(p)}
                  className={clsx('btn btn-sm w-8 h-8 p-0 justify-center',
                    p === meta.current_page ? 'btn-primary' : 'btn-secondary')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
