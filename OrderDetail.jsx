import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Printer, Download, UserPlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['pending', 'assigned', 'in_progress', 'ready', 'delivered', 'cancelled']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [tailors, setTailors] = useState([])
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const { hasRole } = useAuth()

  const load = useCallback(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data))
  }, [id])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (hasRole(['shop_owner', 'manager'])) {
      api.get('/users/tailors').then(({ data }) => setTailors(data.data))
    }
  }, [hasRole])

  const updateStatus = async (status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status })
      toast.success('Status updated.')
      load()
    } catch {
      toast.error('Could not update status.')
    }
  }

  const downloadReceipt = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/orders/${id}/receipt/pdf`, '_blank')
  }

  if (!order) return <p className="text-stone-500">Loading...</p>

  return (
    <div>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-ink-800">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <PageHeader
        title={order.order_number}
        subtitle={order.customer?.full_name}
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={downloadReceipt}><Download size={16} /> Receipt PDF</button>
            <button className="btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print</button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 font-medium text-stone-700">Items</h3>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-stone-400">
                <tr><th className="pb-2">Item</th><th className="pb-2">Qty</th><th className="pb-2 text-right">Unit</th><th className="pb-2 text-right">Subtotal</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items?.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2">{i.item_name}</td>
                    <td className="py-2">{i.quantity}</td>
                    <td className="py-2 text-right">{Number(i.unit_price).toLocaleString()}</td>
                    <td className="py-2 text-right">{Number(i.subtotal).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {order.notes && <p className="mt-3 text-sm text-stone-500">Notes: {order.notes}</p>}
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-stone-700">Status</h3>
              <StatusBadge status={order.status} />
            </div>
            {hasRole(['shop_owner', 'manager', 'receptionist']) && (
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={s === order.status}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize disabled:opacity-40 ${s === order.status ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-stone-200 hover:bg-stone-50'}`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-stone-700">Tailor Assignment</h3>
              {hasRole(['shop_owner', 'manager']) && (
                <button onClick={() => setAssignModalOpen(true)} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                  <UserPlus size={14} /> {order.assignment ? 'Reassign' : 'Assign'}
                </button>
              )}
            </div>
            {order.assignment ? (
              <div className="text-sm">
                <p><span className="text-stone-400">Tailor:</span> {order.assignment.tailor}</p>
                <p className="mt-1"><span className="text-stone-400">Work Status:</span> <StatusBadge status={order.assignment.status} /></p>
              </div>
            ) : <p className="text-sm text-stone-500">Not yet assigned to a tailor.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-3 font-medium text-stone-700">Payment Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-stone-500">Total</dt><dd className="font-medium">Rs. {Number(order.total_price).toLocaleString()}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-500">Advance Paid</dt><dd>Rs. {Number(order.advance_payment).toLocaleString()}</dd></div>
              <div className="flex justify-between border-t border-stone-100 pt-2"><dt className="font-medium text-ink-800">Remaining</dt><dd className="font-semibold text-brand-600">Rs. {Number(order.remaining_payment).toLocaleString()}</dd></div>
            </dl>
            {hasRole(['shop_owner', 'manager', 'receptionist']) && order.remaining_payment > 0 && (
              <button onClick={() => setPaymentModalOpen(true)} className="btn-primary w-full mt-4">Record Payment</button>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-2 font-medium text-stone-700">Delivery Date</h3>
            <p className="text-sm text-stone-600">{order.delivery_date}</p>
          </div>
        </div>
      </div>

      <AssignModal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} tailors={tailors} orderId={id} onAssigned={() => { setAssignModalOpen(false); load() }} />
      <PaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} orderId={id} remaining={order.remaining_payment} onSaved={() => { setPaymentModalOpen(false); load() }} />
    </div>
  )
}

function AssignModal({ open, onClose, tailors, orderId, onAssigned }) {
  const [tailorId, setTailorId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!tailorId) return
    setSubmitting(true)
    try {
      await api.post(`/orders/${orderId}/assign`, { tailor_id: tailorId })
      toast.success('Order assigned.')
      onAssigned()
    } catch {
      toast.error('Could not assign order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Assign to Tailor">
      <div className="space-y-4">
        <select className="input" value={tailorId} onChange={(e) => setTailorId(e.target.value)}>
          <option value="">Select tailor</option>
          {tailors.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={submitting}>
            {submitting && <Loader2 size={16} className="animate-spin" />} Assign
          </button>
        </div>
      </div>
    </Modal>
  )
}

function PaymentModal({ open, onClose, orderId, remaining, onSaved }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    try {
      const type = Number(amount) >= Number(remaining) ? 'final' : 'partial'
      await api.post(`/orders/${orderId}/payments`, { amount: Number(amount), method, type })
      toast.success('Payment recorded.')
      onSaved()
    } catch {
      toast.error('Could not record payment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record Payment">
      <div className="space-y-4">
        <div>
          <label className="label">Amount (Remaining: Rs. {Number(remaining).toLocaleString()})</label>
          <input type="number" step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="label">Method</label>
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_wallet">Mobile Wallet</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={submitting || !amount}>
            {submitting && <Loader2 size={16} className="animate-spin" />} Record
          </button>
        </div>
      </div>
    </Modal>
  )
}
