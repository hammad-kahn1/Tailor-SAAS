import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import EmptyState from '../../components/EmptyState'
import CustomerForm from './CustomerForm'
import { useAuth } from '../../context/AuthContext'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [meta, setMeta] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { hasRole } = useAuth()

  const load = useCallback(() => {
    setLoading(true)
    api.get('/customers', { params: { search, page } })
      .then(({ data }) => {
        setCustomers(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { load() }, [load])

  const handleSave = async (values) => {
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, values)
        toast.success('Customer updated.')
      } else {
        await api.post('/customers', values)
        toast.success('Customer added.')
      }
      setModalOpen(false)
      setEditing(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save customer.')
    }
  }

  const handleDelete = async (customer) => {
    if (!confirm(`Delete ${customer.full_name}? This cannot be undone.`)) return
    try {
      await api.delete(`/customers/${customer.id}`)
      toast.success('Customer deleted.')
      load()
    } catch {
      toast.error('Could not delete customer.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer directory and measurement history."
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Plus size={16} /> Add Customer
          </button>
        }
      />

      <div className="card">
        <div className="flex items-center gap-2 border-b border-stone-200 p-4">
          <Search size={16} className="text-stone-400" />
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        {loading ? (
          <p className="p-6 text-sm text-stone-500">Loading...</p>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers found" description="Add your first customer to get started." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 hidden md:table-cell">Gender</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Added</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-ink-800">{c.full_name}</td>
                      <td className="px-4 py-3 text-stone-600">{c.phone}</td>
                      <td className="px-4 py-3 hidden md:table-cell capitalize text-stone-600">{c.gender || '-'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-stone-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/customers/${c.id}`} className="rounded p-1.5 text-stone-500 hover:bg-stone-100" title="View history">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => { setEditing(c); setModalOpen(true) }} className="rounded p-1.5 text-stone-500 hover:bg-stone-100" title="Edit">
                            <Pencil size={16} />
                          </button>
                          {hasRole(['shop_owner', 'manager']) && (
                            <button onClick={() => handleDelete(c)} className="rounded p-1.5 text-red-500 hover:bg-red-50" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <CustomerForm
          initialValues={editing}
          onSubmit={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
