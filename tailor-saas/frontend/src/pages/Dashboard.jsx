import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Users, CheckCircle, TrendingUp,
  Calendar, Clock, ArrowRight, Package, DollarSign
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import api from '@/api/axios'
import clsx from 'clsx'
import { format } from 'date-fns'

const STATUS_COLORS = {
  pending:     '#F59E0B',
  assigned:    '#3B82F6',
  in_progress: '#8B1A4A',
  ready:       '#22C55E',
  delivered:   '#15803D',
  cancelled:   '#EF4444',
}

const STAT_CONFIG = [
  { key: 'todays_orders',    label: "Today's Orders",  icon: ShoppingBag,  color: 'from-brand-400 to-brand-500',   bg: 'bg-pink-50',   text: 'text-brand-600' },
  { key: 'pending_orders',   label: 'Pending Orders',  icon: Clock,        color: 'from-amber-400 to-amber-500',   bg: 'bg-amber-50',  text: 'text-amber-600' },
  { key: 'completed_orders', label: 'Completed',       icon: CheckCircle,  color: 'from-mint-500 to-mint-600',     bg: 'bg-mint-50',   text: 'text-mint-700' },
  { key: 'revenue_today',    label: 'Revenue Today',   icon: DollarSign,   color: 'from-navy to-navy-light',       bg: 'bg-blue-50',   text: 'text-navy' },
]

function StatCard({ icon: Icon, label, value, sub, color, bg, text }) {
  return (
    <div className="card p-6 flex items-start gap-4 hover:shadow-card-hover transition-all duration-300 cursor-default">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-sm`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-navy font-display tracking-tight">{value ?? '—'}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-lg rounded-xl p-3 text-sm">
        <p className="font-semibold text-navy capitalize">{label}</p>
        <p className="text-mulberry font-bold">{payload[0]?.value} orders</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-mulberry border-t-transparent" />
    </div>
  )

  const breakdownData = Object.entries(data?.status_breakdown || {}).map(([k, v]) => ({
    name: k.replace('_', ' '), value: v, color: STATUS_COLORS[k]
  }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Shop Overview</h1>
          <p className="text-sm text-slate-400 mt-0.5">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
        </div>
        <Link to="/orders/new" className="btn-primary">
          <Package size={15} /> New Order
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CONFIG.map(cfg => (
          <StatCard
            key={cfg.key}
            icon={cfg.icon}
            label={cfg.label}
            color={cfg.color}
            bg={cfg.bg}
            text={cfg.text}
            value={
              cfg.key === 'revenue_today'
                ? `Rs. ${(data?.revenue_today || 0).toLocaleString()}`
                : data?.[cfg.key]
            }
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Revenue</p>
              <p className="text-3xl font-bold text-navy mt-1 font-display">
                Rs. {(data?.monthly_revenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50">
              <TrendingUp size={18} className="text-mulberry" />
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={breakdownData}>
                <defs>
                  <linearGradient id="gradMulberry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B1A4A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B1A4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#8B1A4A" fill="url(#gradMulberry)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Order Status</p>
              <p className="text-xl font-bold text-navy mt-1">Breakdown</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingBag size={18} className="text-blue-600" />
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(139,26,74,0.04)' }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {breakdownData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Deliveries */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-navy text-[15px]">Upcoming Deliveries</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Orders due for delivery soon</p>
          </div>
          <Link to="/orders?status=in_progress" className="text-[12px] font-semibold text-mulberry flex items-center gap-1 hover:gap-2 transition-all duration-200">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {data?.upcoming_deliveries?.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No upcoming deliveries</div>
        ) : (
          <div className="table-wrapper border-0 rounded-none">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Delivery Date</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {data?.upcoming_deliveries?.map(order => (
                  <tr key={order.id}>
                    <td className="font-mono text-[12px] text-mulberry font-bold">
                      <Link to={`/orders/${order.id}`} className="hover:underline">{order.order_number}</Link>
                    </td>
                    <td className="font-semibold text-navy">{order.customer?.full_name}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[12px]">
                        <Calendar size={13} className="text-brand-500" />
                        {order.delivery_date}
                      </div>
                    </td>
                    <td><span className={`badge-${order.status}`}>{order.status.replace('_',' ')}</span></td>
                    <td className="text-right">
                      <Link to={`/orders/${order.id}`} className="text-[12px] font-semibold text-mulberry hover:text-mulberry-dark transition-colors">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
