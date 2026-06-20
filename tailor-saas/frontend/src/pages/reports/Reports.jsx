import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import api from '@/api/axios'
import toast from 'react-hot-toast'

const REPORTS = [
  { key: 'daily-sales',        label: 'Daily Sales Report',        params: [{ name:'date', type:'date', label:'Date' }] },
  { key: 'monthly-revenue',    label: 'Monthly Revenue Report',    params: [{ name:'year', type:'number', label:'Year' }, { name:'month', type:'number', label:'Month' }] },
  { key: 'pending-orders',     label: 'Pending Orders Report',     params: [] },
  { key: 'tailor-performance', label: 'Tailor Performance Report', params: [] },
  { key: 'delivery-schedule',  label: 'Delivery Schedule Report',  params: [{ name:'from', type:'date', label:'From' }, { name:'to', type:'date', label:'To' }] },
]

export default function Reports() {
  const [selected, setSelected] = useState(REPORTS[0])
  const [paramValues, setParamValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [jsonData, setJsonData] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const defaultParams = {
    date: today,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    from: today,
    to: today,
  }

  const getParams = () => {
    const merged = { ...defaultParams, ...paramValues }
    return selected.params.reduce((acc, p) => ({ ...acc, [p.name]: merged[p.name] }), {})
  }

  const run = async (format = 'json') => {
    setLoading(true)
    try {
      if (format === 'pdf') {
        const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
        const token = localStorage.getItem('token')
        const qs = new URLSearchParams({ ...getParams(), format: 'pdf' }).toString()
        window.open(`${base}/reports/${selected.key}?${qs}&token=${token}`, '_blank')
      } else {
        const { data } = await api.get(`/reports/${selected.key}`, { params: { ...getParams(), format: 'json' } })
        setJsonData(data.data)
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
        {/* Report selector */}
        <div className="lg:col-span-1 space-y-2">
          {REPORTS.map(r => (
            <button key={r.key} onClick={() => { setSelected(r); setJsonData(null) }}
              className={`w-full text-left rounded-none px-4 py-3 text-xs uppercase font-bold tracking-widest border transition-all ${
                selected.key === r.key
                  ? 'bg-ink-900 text-brand-400 border-ink-900 shadow-card'
                  : 'bg-white text-ink-700 border-brand-400/10 hover:bg-brand-50/50'
              }`}>
              <FileText size={13} className="inline mr-2 opacity-80" />
              {r.label}
            </button>
          ))}
        </div>

        {/* Report config & output */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-ink-800">{selected.label}</h2>

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

            <div className="flex gap-2">
              <button onClick={() => run('json')} disabled={loading} className="btn-primary btn-sm">
                {loading ? <Loader2 size={13} className="animate-spin" /> : null}
                Preview Report
              </button>
              <button onClick={() => run('pdf')} disabled={loading} className="btn-secondary btn-sm">
                <Download size={13} /> Export PDF
              </button>
            </div>
          </div>

          {/* JSON preview */}
          {jsonData && (
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink-750 mb-3">Report Data</h3>
              <pre className="text-xs bg-ink-50 rounded-none border border-brand-400/20 p-4 overflow-auto max-h-96 text-ink-700 font-mono">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
