import { useState } from 'react'
import { FileText, Download, Loader2, TrendingUp, Calendar, Users, Clock, Package } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'

const REPORTS = [
  { key: 'daily-sales',        label: 'Daily Sales Report',        icon: TrendingUp, params: [{ name:'date', type:'date', label:'Date' }] },
  { key: 'monthly-revenue',    label: 'Monthly Revenue Report',    icon: Calendar,   params: [{ name:'year', type:'number', label:'Year' }, { name:'month', type:'number', label:'Month' }] },
  { key: 'pending-orders',     label: 'Pending Orders Report',     icon: Package,    params: [] },
  { key: 'tailor-performance', label: 'Tailor Performance Report', icon: Users,      params: [] },
  { key: 'delivery-schedule',  label: 'Delivery Schedule Report',  icon: Clock,      params: [{ name:'from', type:'date', label:'From' }, { name:'to', type:'date', label:'To' }] },
]

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(n) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })
}

/* ─── Receipt Header ─────────────────────────────────── */
function ReceiptHeader({ title, subtitle, generated }) {
  return (
    <div className="text-center border-b border-dashed border-slate-200 pb-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-mulberry-light border border-mulberry/20 flex items-center justify-center mx-auto mb-2">
        <FileText size={18} className="text-mulberry" />
      </div>
      <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      <p className="text-[11px] text-slate-300 mt-1">Generated {new Date(generated).toLocaleString('en-PK')}</p>
    </div>
  )
}

/* ─── Stat Row ───────────────────────────────────────── */
function StatRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-mulberry' : 'text-navy'}`}>{value}</span>
    </div>
  )
}

/* ─── Daily Sales Receipt ────────────────────────────── */
function DailySalesReceipt({ data }) {
  const orders = data.orders || []
  return (
    <div className="font-mono">
      <ReceiptHeader
        title="Daily Sales Report"
        subtitle={`Sales for ${fmtDate(data.date)}`}
        generated={new Date()}
      />
      <div className="space-y-1 mb-4">
        <StatRow label="Total Orders"     value={data.total_orders} />
        <StatRow label="Total Collected"  value={fmt(data.total_collected)} highlight />
      </div>
      {orders.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Order Breakdown</p>
          <div className="space-y-2">
            {orders.map((o, i) => (
              <div key={o.id || i} className="bg-slate-50 rounded-xl px-3 py-2 flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs font-semibold text-navy">{o.order_number || `#${i+1}`}</p>
                  <p className="text-[11px] text-slate-400">{o.customer?.full_name || '—'}</p>
                </div>
                <div className="text-right">
                  <span className={`badge badge-${o.status || 'pending'} text-[10px]`}>{o.status}</span>
                  <p className="text-xs font-semibold text-mulberry mt-0.5">{fmt(o.total_amount || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {orders.length === 0 && (
        <p className="text-center text-xs text-slate-400 py-6">No orders on this date</p>
      )}
    </div>
  )
}

/* ─── Monthly Revenue Receipt ────────────────────────── */
function MonthlyRevenueReceipt({ data }) {
  const daily = data.daily || []
  const max   = Math.max(...daily.map(d => parseFloat(d.total) || 0), 1)
  return (
    <div className="font-mono">
      <ReceiptHeader
        title="Monthly Revenue Report"
        subtitle={`${MONTH_NAMES[(data.month||1)-1]} ${data.year}`}
        generated={new Date()}
      />
      <div className="mb-4">
        <StatRow label="Month"         value={`${MONTH_NAMES[(data.month||1)-1]} ${data.year}`} />
        <StatRow label="Total Revenue" value={fmt(data.total)} highlight />
        <StatRow label="Active Days"   value={daily.length} />
      </div>
      {daily.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Daily Breakdown</p>
          <div className="space-y-2">
            {daily.map((d, i) => {
              const pct = Math.round((parseFloat(d.total) / max) * 100)
              return (
                <div key={i}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500">{fmtDate(d.day)}</span>
                    <span className="font-semibold text-navy">{fmt(d.total)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-mulberry rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
      {daily.length === 0 && (
        <p className="text-center text-xs text-slate-400 py-6">No revenue data for this period</p>
      )}
    </div>
  )
}

/* ─── Pending Orders Receipt ─────────────────────────── */
function PendingOrdersReceipt({ data }) {
  const orders = data.orders || []
  return (
    <div className="font-mono">
      <ReceiptHeader
        title="Pending Orders Report"
        subtitle="Orders currently in progress"
        generated={new Date()}
      />
      <div className="mb-4">
        <StatRow label="Pending / In-Progress" value={data.count || orders.length} highlight />
      </div>
      {orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((o, i) => (
            <div key={o.id || i} className="bg-slate-50 rounded-xl px-3 py-2.5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-navy">{o.order_number || `#${i+1}`}</p>
                  <p className="text-[11px] text-slate-500">{o.customer?.full_name}</p>
                  {o.customer?.phone && <p className="text-[11px] text-slate-400">{o.customer.phone}</p>}
                </div>
                <div className="text-right">
                  <span className={`badge badge-${o.status}`}>{o.status?.replace('_',' ')}</span>
                  <p className="text-[11px] text-slate-400 mt-1">Due: {fmtDate(o.delivery_date)}</p>
                </div>
              </div>
              {o.assignment?.tailor && (
                <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
                  Tailor: <span className="font-semibold">{o.assignment.tailor.name}</span>
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 py-6">No pending orders 🎉</p>
      )}
    </div>
  )
}

/* ─── Tailor Performance Receipt ─────────────────────── */
function TailorPerformanceReceipt({ data }) {
  const rows = data.data || []
  return (
    <div className="font-mono">
      <ReceiptHeader
        title="Tailor Performance Report"
        subtitle="Team productivity overview"
        generated={new Date()}
      />
      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const pct = r.total_assigned ? Math.round((r.completed / r.total_assigned) * 100) : 0
            return (
              <div key={i} className="bg-slate-50 rounded-xl px-3 py-2.5">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-navy">{r.tailor?.name || `Tailor #${r.tailor_id}`}</p>
                  <span className="text-[11px] font-semibold text-mulberry">{pct}% rate</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-2">
                  <div className="bg-white rounded-lg py-1">
                    <p className="font-bold text-navy">{r.total_assigned}</p>
                    <p className="text-slate-400">Assigned</p>
                  </div>
                  <div className="bg-white rounded-lg py-1">
                    <p className="font-bold text-green-600">{r.completed}</p>
                    <p className="text-slate-400">Done</p>
                  </div>
                  <div className="bg-white rounded-lg py-1">
                    <p className="font-bold text-amber-600">{r.in_progress}</p>
                    <p className="text-slate-400">In Progress</p>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                {r.avg_completion_hours != null && (
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Avg completion: <span className="font-semibold">{Math.round(r.avg_completion_hours || 0)}h</span>
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 py-6">No tailor assignment data</p>
      )}
    </div>
  )
}

/* ─── Delivery Schedule Receipt ──────────────────────── */
function DeliveryScheduleReceipt({ data }) {
  const orders = data.orders || []
  // Group by delivery date
  const byDate = orders.reduce((acc, o) => {
    const d = o.delivery_date || 'Unknown'
    if (!acc[d]) acc[d] = []
    acc[d].push(o)
    return acc
  }, {})
  return (
    <div className="font-mono">
      <ReceiptHeader
        title="Delivery Schedule"
        subtitle={`${fmtDate(data.from)} — ${fmtDate(data.to)}`}
        generated={new Date()}
      />
      <div className="mb-4">
        <StatRow label="Orders Due" value={orders.length} highlight />
      </div>
      {Object.keys(byDate).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b)).map(([date, group]) => (
            <div key={date}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-mulberry mb-1.5">
                📅 {fmtDate(date)}
              </p>
              <div className="space-y-1.5">
                {group.map((o, i) => (
                  <div key={o.id || i} className="bg-slate-50 rounded-xl px-3 py-2 flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-navy">{o.order_number}</p>
                      <p className="text-[11px] text-slate-500">{o.customer?.full_name}</p>
                      {o.assignment?.tailor && (
                        <p className="text-[10px] text-slate-400">→ {o.assignment.tailor.name}</p>
                      )}
                    </div>
                    <span className={`badge badge-${o.status}`}>{o.status?.replace('_',' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 py-6">No deliveries in this range</p>
      )}
    </div>
  )
}

/* ─── Receipt Renderer ───────────────────────────────── */
function ReportReceipt({ reportKey, data }) {
  const map = {
    'daily-sales':        DailySalesReceipt,
    'monthly-revenue':    MonthlyRevenueReceipt,
    'pending-orders':     PendingOrdersReceipt,
    'tailor-performance': TailorPerformanceReceipt,
    'delivery-schedule':  DeliveryScheduleReceipt,
  }
  const Component = map[reportKey]
  if (!Component) return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  return <Component data={data} />
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Reports() {
  const [selected, setSelected]     = useState(REPORTS[0])
  const [paramValues, setParamValues] = useState({})
  const [loading, setLoading]       = useState(false)
  const [reportData, setReportData] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const defaultParams = {
    date:  today,
    year:  new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    from:  today,
    to:    today,
  }

  const getParams = () => {
    const merged = { ...defaultParams, ...paramValues }
    return selected.params.reduce((acc, p) => ({ ...acc, [p.name]: merged[p.name] }), {})
  }

  const run = async (format = 'json') => {
    setLoading(true)
    try {
      if (format === 'pdf') {
        const base  = import.meta.env.VITE_API_BASE_URL || '/api/v1'
        const token = localStorage.getItem('token')
        const qs    = new URLSearchParams({ ...getParams(), format: 'pdf' }).toString()
        window.open(`${base}/reports/${selected.key}?${qs}&token=${token}`, '_blank')
      } else {
        const { data } = await api.get(`/reports/${selected.key}`, { params: { ...getParams(), format: 'json' } })
        setReportData(data.data)
        toast.success('Report loaded.')
      }
    } catch { toast.error('Failed to generate report.') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export business reports</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-1.5">
          {REPORTS.map(r => {
            const Icon = r.icon
            const active = selected.key === r.key
            return (
              <button key={r.key}
                onClick={() => { setSelected(r); setReportData(null) }}
                className={`w-full text-left rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-200 border ${
                  active
                    ? 'bg-navy text-white border-navy shadow-md'
                    : 'bg-white text-slate-600 border-slate-100 hover:border-mulberry/30 hover:bg-mulberry-light'
                }`}
              >
                <Icon size={15} className={active ? 'text-mulberry' : 'text-slate-400'} />
                <span className="text-xs font-semibold uppercase tracking-wider leading-tight">{r.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── Config + Receipt ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Controls */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              {(() => { const Icon = selected.icon; return <Icon size={18} className="text-mulberry" /> })()}
              <h2 className="font-bold text-navy">{selected.label}</h2>
            </div>

            {selected.params.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {selected.params.map(p => (
                  <div key={p.name}>
                    <label className="label">{p.label}</label>
                    <input type={p.type} className="input w-36"
                      defaultValue={defaultParams[p.name]}
                      onChange={e => setParamValues(v => ({ ...v, [p.name]: e.target.value }))} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={() => run('json')} disabled={loading} className="btn-primary btn-sm">
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                Preview Report
              </button>
              <button onClick={() => run('pdf')} disabled={loading} className="btn-secondary btn-sm">
                <Download size={13} /> Export PDF
              </button>
            </div>
          </div>

          {/* Receipt Preview */}
          {reportData && (
            <div className="card p-6 max-w-lg mx-auto shadow-md border border-slate-100">
              {/* Decorative top stripe */}
              <div className="h-1 bg-gradient-to-r from-mulberry via-pink-400 to-mulberry rounded-full -mt-6 mb-6 mx-0" style={{marginLeft:'-1.5rem', marginRight:'-1.5rem', borderRadius:'16px 16px 0 0'}} />
              <ReportReceipt reportKey={selected.key} data={reportData} />
              {/* Decorative bottom */}
              <div className="mt-6 pt-4 border-t border-dashed border-slate-200 text-center">
                <p className="text-[10px] text-slate-300 tracking-wider uppercase">Royal Stitches · TailorSaaS</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!reportData && !loading && (
            <div className="card p-10 text-center border border-dashed border-slate-200">
              <FileText size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-400">Click <span className="font-bold text-mulberry">Preview Report</span> to generate</p>
              <p className="text-xs text-slate-300 mt-1">Report will appear here as a receipt</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
