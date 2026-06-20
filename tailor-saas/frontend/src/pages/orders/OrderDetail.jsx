import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Printer, User, Scissors, CreditCard, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

const TRANSITIONS = {
  pending:     ['assigned','cancelled'],
  assigned:    ['in_progress','cancelled'],
  in_progress: ['ready','cancelled'],
  ready:       ['delivered'],
  delivered:   [],
  cancelled:   [],
}

const STATUS_LABELS = { pending:'Pending', assigned:'Assigned', in_progress:'In Progress', ready:'Ready', delivered:'Delivered', cancelled:'Cancelled' }

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasRole, isTailor } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [tailors, setTailors] = useState([])
  const [assigningTo, setAssigningTo] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('cash')
  const [payType, setPayType] = useState('partial')

  const loadOrder = () => {
    setLoading(true)
    api.get(`/orders/${id}`).then(r => setOrder(r.data.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
    if (hasRole('shop_owner','manager','super_admin')) {
      api.get('/users/tailors').then(r => setTailors(r.data.data))
    }
  }, [id])

  const updateStatus = async (newStatus) => {
    setUpdating(true)
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus })
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`)
      loadOrder()
    } catch { toast.error('Failed to update status.') }
    finally { setUpdating(false) }
  }

  const assignTailor = async () => {
    if (!assigningTo) return toast.error('Select a tailor first.')
    try {
      await api.post(`/orders/${id}/assign`, { tailor_id: parseInt(assigningTo) })
      toast.success('Order assigned!')
      loadOrder()
    } catch { toast.error('Assignment failed.') }
  }

  const recordPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return toast.error('Enter a valid amount.')
    try {
      await api.post(`/orders/${id}/payments`, { amount: Number(payAmount), type: payType, method: payMethod })
      toast.success('Payment recorded!')
      setPayAmount('')
      loadOrder()
    } catch { toast.error('Payment failed.') }
  }

  const downloadReceipt = () => window.open(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/orders/${id}/receipt/pdf`, '_blank')

  if (loading) return <div className="flex justify-center py-20"><div className="h-7 w-7 animate-spin rounded-full border-4 border-mulberry border-t-transparent" /></div>
  if (!order) return <div className="text-center py-20 text-slate-400">Order not found.</div>

  const nextStatuses = TRANSITIONS[order.status] || []

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2 mt-1"><ArrowLeft size={17} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-navy font-mono">{order.order_number}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Created {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge-${order.status} text-sm px-3 py-1`}>{STATUS_LABELS[order.status]}</span>
          {!isTailor && (
            <button onClick={downloadReceipt} className="btn-secondary btn-sm">
              <Printer size={14} /> Receipt PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer & Delivery */}
          <div className="card p-5 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="label">Customer</p>
              <Link to={`/customers/${order.customer?.id}`} className="font-semibold text-navy hover:text-mulberry transition-colors hover:underline">
                {order.customer?.full_name}
              </Link>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{order.customer?.phone}</p>
            </div>
            <div>
              <p className="label">Delivery Date</p>
              <p className="font-semibold text-navy">{order.delivery_date}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <p className="label">Notes</p>
                <p className="text-sm text-slate-500 italic">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-xs uppercase tracking-wider text-slate-500">Order Items</div>
            <div className="table-wrapper border-0 rounded-none">
              <table className="table">
                <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {order.items?.map(item => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.item_name}</td>
                      <td>{item.quantity}</td>
                      <td>PKR {Number(item.unit_price).toLocaleString()}</td>
                      <td className="font-semibold text-navy">PKR {Number(item.subtotal).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-xs"><span className="text-slate-400">Total</span><span className="font-bold text-navy">PKR {Number(order.total_price).toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-400">Advance Paid</span><span className="text-slate-600 font-medium">PKR {Number(order.advance_payment).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-1.5 mt-1">
                <span>Balance Due</span>
                <span className={Number(order.remaining_payment) > 0 ? 'text-mulberry' : 'text-slate-400 font-medium'}>
                  PKR {Number(order.remaining_payment).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payments history */}
          {order.payments?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 font-semibold text-xs uppercase tracking-wider text-slate-500">Payment History</div>
              <div className="table-wrapper border-0 rounded-none">
                <table className="table">
                  <thead><tr><th>Amount</th><th>Type</th><th>Method</th><th>Date</th><th>By</th></tr></thead>
                  <tbody>
                    {order.payments.map(p => (
                      <tr key={p.id}>
                        <td className="font-semibold text-navy">PKR {Number(p.amount).toLocaleString()}</td>
                        <td>
                          <span className={clsx('badge', p.type === 'final' ? 'bg-mint-50 text-mint-700 border border-mint-200' : 'bg-slate-100 text-slate-600 border border-slate-200')}>
                            {p.type}
                          </span>
                        </td>
                        <td className="capitalize text-xs">{p.method}</td>
                        <td className="text-xs font-mono">{new Date(p.paid_at).toLocaleDateString()}</td>
                        <td className="text-xs">{p.received_by?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column — Actions */}
        <div className="space-y-4">
          {/* Status transitions */}
          {nextStatuses.length > 0 && (
            <div className="card p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Update Status</p>
              {nextStatuses.map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={updating}
                  className="btn-secondary w-full justify-center capitalize">
                  {updating ? <Loader2 size={13} className="animate-spin" /> : null}
                  Mark as {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}

          {/* Tailor Assignment */}
          {hasRole('shop_owner','manager','super_admin') && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="card p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Scissors size={12} className="text-mulberry" /> Assign Tailor
              </p>
              {order.assignment && (
                <div className="text-xs text-navy bg-mint-50 border border-mint-200 rounded-xl px-3 py-2 font-medium">
                  ✦ Assigned to {order.assignment.tailor?.name} — <span className="capitalize font-bold text-brand-650">{order.assignment.status.replace('_',' ')}</span>
                </div>
              )}
              <select className="input text-sm" value={assigningTo} onChange={e => setAssigningTo(e.target.value)}>
                <option value="">Select tailor…</option>
                {tailors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button onClick={assignTailor} className="btn-primary w-full justify-center btn-sm">
                {order.assignment ? 'Reassign' : 'Assign'}
              </button>
            </div>
          )}

          {/* Record Payment */}
          {!isTailor && Number(order.remaining_payment) > 0 && (
            <div className="card p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <CreditCard size={12} /> Record Payment
              </p>
              <input type="number" className="input text-sm" placeholder="Amount (PKR)"
                value={payAmount} onChange={e => setPayAmount(e.target.value)} />
              <select className="input text-sm" value={payType} onChange={e => setPayType(e.target.value)}>
                <option value="partial">Partial</option>
                <option value="final">Final</option>
              </select>
              <select className="input text-sm" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_wallet">Mobile Wallet</option>
              </select>
              <button onClick={recordPayment} className="btn-primary w-full justify-center btn-sm">
                Record Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
