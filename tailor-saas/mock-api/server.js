const express = require('express')
const cors    = require('cors')
const jwt     = require('jsonwebtoken')

const app = express()
const SECRET = 'tailorsaas_dev_secret'
const PORT   = 8000

app.use(cors({ origin: ['http://localhost:5173','http://127.0.0.1:5173'], credentials: true }))
app.use(express.json())

// ── Seed Data ─────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: 'Ahmed Khan',    email: 'owner@royalstitches.test', password: 'password', role: 'shop_owner',  tenant_id: 1, is_active: true },
  { id: 2, name: 'Sara Malik',    email: 'manager@royalstitches.test',password: 'password', role: 'manager',     tenant_id: 1, is_active: true },
  { id: 3, name: 'Usman Ali',     email: 'tailor1@royalstitches.test',password: 'password', role: 'tailor',      tenant_id: 1, is_active: true },
  { id: 4, name: 'Bilal Raza',    email: 'tailor2@royalstitches.test',password: 'password', role: 'tailor',      tenant_id: 1, is_active: true },
  { id: 5, name: 'TailorSaaS Admin', email: 'admin@tailorsaas.com',   password: 'password', role: 'super_admin', tenant_id: null, is_active: true },
]

const TENANT = { id: 1, name: 'Royal Stitches', slug: 'royal-stitches', email: 'info@royalstitches.test', phone: '0300-1234567', address: 'Shop 12, Main Market, Lahore', subscription_plan: 'professional', is_active: true, settings: { currency: 'PKR' } }

const CUSTOMERS = [
  { id: 1, tenant_id: 1, full_name: 'Hassan Raza',  phone: '0311-1234567', gender: 'male',   notes: 'Prefers slim fit', created_at: '2024-01-15' },
  { id: 2, tenant_id: 1, full_name: 'Zara Ahmed',   phone: '0322-2345678', gender: 'female', notes: 'Regular customer', created_at: '2024-01-20' },
  { id: 3, tenant_id: 1, full_name: 'Imran Sheikh', phone: '0333-3456789', gender: 'male',   notes: 'Suit orders only',  created_at: '2024-02-01' },
  { id: 4, tenant_id: 1, full_name: 'Ayesha Noor',  phone: '0344-4567890', gender: 'female', notes: null,               created_at: '2024-02-10' },
  { id: 5, tenant_id: 1, full_name: 'Kamran Tariq', phone: '0355-5678901', gender: 'male',   notes: 'Customer fabric',  created_at: '2024-02-15' },
]

const ORDERS = [
  { id: 1, tenant_id: 1, order_number: 'ORD-20240301-A1B2', customer_id: 1, status: 'in_progress', total_price: '5000.00', advance_payment: '2000.00', remaining_payment: '3000.00', delivery_date: new Date(Date.now()+7*86400000).toISOString().split('T')[0], created_by: 1 },
  { id: 2, tenant_id: 1, order_number: 'ORD-20240301-C3D4', customer_id: 2, status: 'ready',       total_price: '3000.00', advance_payment: '1500.00', remaining_payment: '1500.00', delivery_date: new Date(Date.now()+3*86400000).toISOString().split('T')[0], created_by: 1 },
  { id: 3, tenant_id: 1, order_number: 'ORD-20240301-E5F6', customer_id: 3, status: 'pending',     total_price:'15000.00', advance_payment: '5000.00', remaining_payment:'10000.00', delivery_date: new Date(Date.now()+14*86400000).toISOString().split('T')[0], created_by: 1 },
  { id: 4, tenant_id: 1, order_number: 'ORD-20240301-G7H8', customer_id: 4, status: 'delivered',   total_price: '2000.00', advance_payment: '2000.00', remaining_payment:    '0.00', delivery_date: new Date(Date.now()-2*86400000).toISOString().split('T')[0], created_by: 1 },
  { id: 5, tenant_id: 1, order_number: 'ORD-20240301-I9J0', customer_id: 5, status: 'assigned',    total_price: '3500.00', advance_payment: '1000.00', remaining_payment: '2500.00', delivery_date: new Date(Date.now()+5*86400000).toISOString().split('T')[0], created_by: 1 },
]

const ORDER_ITEMS = [
  { id: 1, order_id: 1, item_name: 'Shirt',          quantity: 2, unit_price: '1500.00', subtotal: '3000.00' },
  { id: 2, order_id: 1, item_name: 'Pant',           quantity: 1, unit_price: '2000.00', subtotal: '2000.00' },
  { id: 3, order_id: 2, item_name: 'Shirt',          quantity: 1, unit_price: '1500.00', subtotal: '1500.00' },
  { id: 4, order_id: 2, item_name: 'Dupatta',        quantity: 1, unit_price: '1500.00', subtotal: '1500.00' },
  { id: 5, order_id: 3, item_name: 'Suit',           quantity: 1, unit_price:'15000.00', subtotal:'15000.00' },
  { id: 6, order_id: 4, item_name: 'Shalwar Kameez', quantity: 1, unit_price: '2000.00', subtotal: '2000.00' },
  { id: 7, order_id: 5, item_name: 'Waistcoat',      quantity: 1, unit_price: '3500.00', subtotal: '3500.00' },
]

const ASSIGNMENTS = [
  { id: 1, tenant_id: 1, order_id: 1, tailor_id: 3, assigned_by: 1, status: 'in_progress', started_at: new Date().toISOString() },
  { id: 2, tenant_id: 1, order_id: 2, tailor_id: 4, assigned_by: 1, status: 'completed' },
  { id: 3, tenant_id: 1, order_id: 5, tailor_id: 4, assigned_by: 1, status: 'assigned' },
]

const PAYMENTS = [
  { id: 1, tenant_id: 1, order_id: 1, amount: '2000.00', type: 'advance', method: 'cash', paid_at: new Date().toISOString() },
  { id: 2, tenant_id: 1, order_id: 2, amount: '1500.00', type: 'advance', method: 'cash', paid_at: new Date().toISOString() },
  { id: 3, tenant_id: 1, order_id: 3, amount: '5000.00', type: 'advance', method: 'cash', paid_at: new Date().toISOString() },
  { id: 4, tenant_id: 1, order_id: 4, amount: '2000.00', type: 'final',   method: 'cash', paid_at: new Date().toISOString() },
  { id: 5, tenant_id: 1, order_id: 5, amount: '1000.00', type: 'advance', method: 'cash', paid_at: new Date().toISOString() },
]

const MEASUREMENTS = [
  { id: 1, tenant_id: 1, customer_id: 1, type: 'shirt', version: 1, data: { chest: 40, waist: 34, shoulder: 17, sleeve: 26, neck: 15, length: 30 }, recorded_by: 1 },
  { id: 2, tenant_id: 1, customer_id: 3, type: 'suit',  version: 1, data: { coat: { chest: 42, waist: 36, shoulder: 18, sleeve: 27, neck: 16, length: 31 }, trouser: { waist: 36, hip: 40, length: 42 } }, recorded_by: 1 },
]

let nextIds = { customers: 6, orders: 6, payments: 6, measurements: 3, assignments: 4 }

// ── Auth helpers ──────────────────────────────────────────────────────────────
function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role, tenant_id: user.tenant_id }, SECRET, { expiresIn: '7d' })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthenticated.' })
  try {
    const payload = jwt.verify(header.slice(7), SECRET)
    req.user = USERS.find(u => u.id === payload.id)
    if (!req.user) return res.status(401).json({ message: 'User not found.' })
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired.' })
  }
}

function enrichOrder(o) {
  const customer    = CUSTOMERS.find(c => c.id === o.customer_id)
  const items       = ORDER_ITEMS.filter(i => i.order_id === o.id)
  const payments    = PAYMENTS.filter(p => p.order_id === o.id)
  const assignment  = ASSIGNMENTS.find(a => a.order_id === o.id)
  const tailor      = assignment ? USERS.find(u => u.id === assignment.tailor_id) : null
  return { ...o, customer, items, payments, assignment: assignment ? { ...assignment, tailor } : null }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Auth
app.post('/api/v1/auth/register-tenant', (req, res) => {
  const { name, email, password, shop_name } = req.body
  if (USERS.find(u => u.email === email)) return res.status(422).json({ message: 'Email already taken.' })
  const user = { id: USERS.length + 1, name, email, password, role: 'shop_owner', tenant_id: 1, is_active: true }
  USERS.push(user)
  res.status(201).json({ message: 'Shop registered.', data: { user, token: makeToken(user) } })
})

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' })
  res.json({ message: 'Login successful.', data: { user: { ...user, tenant: user.tenant_id ? TENANT : null }, token: makeToken(user) } })
})

app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  res.json({ data: { ...req.user, tenant: req.user.tenant_id ? TENANT : null } })
})

app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully.' })
})

// Dashboard
app.get('/api/v1/dashboard', authMiddleware, (req, res) => {
  res.json({ data: {
    todays_orders: 3,
    pending_orders: ORDERS.filter(o => o.status === 'pending').length,
    completed_orders: ORDERS.filter(o => o.status === 'delivered').length,
    revenue_today: 8500,
    monthly_revenue: 45000,
    status_breakdown: {
      pending: ORDERS.filter(o=>o.status==='pending').length,
      assigned: ORDERS.filter(o=>o.status==='assigned').length,
      in_progress: ORDERS.filter(o=>o.status==='in_progress').length,
      ready: ORDERS.filter(o=>o.status==='ready').length,
      delivered: ORDERS.filter(o=>o.status==='delivered').length,
    },
    upcoming_deliveries: ORDERS.filter(o => !['delivered','cancelled'].includes(o.status)).slice(0,5).map(enrichOrder),
  }})
})

// Customers
app.get('/api/v1/customers', authMiddleware, (req, res) => {
  let list = [...CUSTOMERS]
  const { search } = req.query
  if (search) list = list.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  res.json({ data: list, meta: { total: list.length, per_page: 15, current_page: 1, last_page: 1 } })
})

app.post('/api/v1/customers', authMiddleware, (req, res) => {
  const c = { id: nextIds.customers++, tenant_id: 1, ...req.body, created_at: new Date().toISOString() }
  CUSTOMERS.push(c)
  res.status(201).json({ message: 'Customer created.', data: c })
})

app.get('/api/v1/customers/:id', authMiddleware, (req, res) => {
  const c = CUSTOMERS.find(c => c.id === +req.params.id)
  if (!c) return res.status(404).json({ message: 'Customer not found.' })
  const orders = ORDERS.filter(o => o.customer_id === c.id).map(enrichOrder)
  const measurements = MEASUREMENTS.filter(m => m.customer_id === c.id)
  res.json({ data: { ...c, orders, measurements } })
})

app.put('/api/v1/customers/:id', authMiddleware, (req, res) => {
  const idx = CUSTOMERS.findIndex(c => c.id === +req.params.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found.' })
  CUSTOMERS[idx] = { ...CUSTOMERS[idx], ...req.body }
  res.json({ message: 'Customer updated.', data: CUSTOMERS[idx] })
})

app.delete('/api/v1/customers/:id', authMiddleware, (req, res) => {
  const idx = CUSTOMERS.findIndex(c => c.id === +req.params.id)
  if (idx === -1) return res.status(404).json({ message: 'Not found.' })
  CUSTOMERS.splice(idx, 1)
  res.json({ message: 'Customer deleted.' })
})

// Measurements
app.get('/api/v1/customers/:id/measurements', authMiddleware, (req, res) => {
  res.json({ data: MEASUREMENTS.filter(m => m.customer_id === +req.params.id) })
})

app.post('/api/v1/measurements', authMiddleware, (req, res) => {
  const m = { id: nextIds.measurements++, tenant_id: 1, ...req.body, version: 1 }
  MEASUREMENTS.push(m)
  res.status(201).json({ message: 'Measurements saved.', data: m })
})

// Orders
app.get('/api/v1/orders', authMiddleware, (req, res) => {
  let list = ORDERS.map(enrichOrder)
  const { status, search } = req.query
  if (status) list = list.filter(o => o.status === status)
  if (search) list = list.filter(o => o.order_number.includes(search) || o.customer?.full_name?.toLowerCase().includes(search.toLowerCase()))
  res.json({ data: list, meta: { total: list.length, per_page: 15, current_page: 1, last_page: 1 } })
})

app.post('/api/v1/orders', authMiddleware, (req, res) => {
  const { items, ...orderData } = req.body
  const o = { id: nextIds.orders++, tenant_id: 1, order_number: `ORD-${Date.now()}-XXXX`, status: 'pending', created_by: req.user.id, ...orderData }
  ORDERS.push(o)
  if (items) items.forEach((item, i) => ORDER_ITEMS.push({ id: ORDER_ITEMS.length+i+1, order_id: o.id, ...item, subtotal: item.quantity * item.unit_price }))
  res.status(201).json({ message: 'Order created.', data: enrichOrder(o) })
})

app.get('/api/v1/orders/:id', authMiddleware, (req, res) => {
  const o = ORDERS.find(o => o.id === +req.params.id)
  if (!o) return res.status(404).json({ message: 'Order not found.' })
  res.json({ data: enrichOrder(o) })
})

app.patch('/api/v1/orders/:id/status', authMiddleware, (req, res) => {
  const o = ORDERS.find(o => o.id === +req.params.id)
  if (!o) return res.status(404).json({ message: 'Not found.' })
  o.status = req.body.status
  res.json({ message: 'Status updated.', data: enrichOrder(o) })
})

// Payments
app.get('/api/v1/orders/:id/payments', authMiddleware, (req, res) => {
  res.json({ data: PAYMENTS.filter(p => p.order_id === +req.params.id) })
})

app.post('/api/v1/orders/:id/payments', authMiddleware, (req, res) => {
  const o = ORDERS.find(o => o.id === +req.params.id)
  if (!o) return res.status(404).json({ message: 'Not found.' })
  const p = { id: nextIds.payments++, tenant_id: 1, order_id: o.id, received_by: req.user.id, paid_at: new Date().toISOString(), ...req.body }
  PAYMENTS.push(p)
  const totalPaid = PAYMENTS.filter(x => x.order_id === o.id).reduce((s,x) => s + parseFloat(x.amount), 0)
  o.remaining_payment = Math.max(0, parseFloat(o.total_price) - totalPaid).toFixed(2)
  res.status(201).json({ message: 'Payment recorded.', data: p })
})

// Assignments
app.post('/api/v1/orders/:id/assign', authMiddleware, (req, res) => {
  const o = ORDERS.find(o => o.id === +req.params.id)
  if (!o) return res.status(404).json({ message: 'Not found.' })
  const a = { id: nextIds.assignments++, tenant_id: 1, order_id: o.id, assigned_by: req.user.id, status: 'assigned', ...req.body }
  ASSIGNMENTS.push(a)
  o.status = 'assigned'
  res.status(201).json({ message: 'Tailor assigned.', data: a })
})

app.get('/api/v1/assignments/workload', authMiddleware, (req, res) => {
  const tailors = USERS.filter(u => u.role === 'tailor' && u.tenant_id === 1)
  res.json({ data: tailors.map(t => ({
    tailor: t,
    assigned: ASSIGNMENTS.filter(a => a.tailor_id === t.id && a.status === 'assigned').length,
    in_progress: ASSIGNMENTS.filter(a => a.tailor_id === t.id && a.status === 'in_progress').length,
    completed_today: ASSIGNMENTS.filter(a => a.tailor_id === t.id && a.status === 'completed').length,
  })) })
})

app.get('/api/v1/assignments/my', authMiddleware, (req, res) => {
  const myAssignments = ASSIGNMENTS.filter(a => a.tailor_id === req.user.id).map(a => ({
    ...a, order: enrichOrder(ORDERS.find(o => o.id === a.order_id))
  }))
  res.json({ data: myAssignments })
})

app.patch('/api/v1/assignments/:id/status', authMiddleware, (req, res) => {
  const a = ASSIGNMENTS.find(a => a.id === +req.params.id)
  if (!a) return res.status(404).json({ message: 'Not found.' })
  a.status = req.body.status
  if (req.body.status === 'in_progress') a.started_at = new Date().toISOString()
  if (req.body.status === 'completed') a.completed_at = new Date().toISOString()
  res.json({ message: 'Assignment updated.', data: a })
})

// Users / Staff
app.get('/api/v1/users', authMiddleware, (req, res) => {
  const staff = USERS.filter(u => u.tenant_id === req.user.tenant_id)
  res.json({ data: staff.map(({ password, ...u }) => u) })
})

app.get('/api/v1/users/tailors', authMiddleware, (req, res) => {
  const tailors = USERS.filter(u => u.role === 'tailor' && u.tenant_id === req.user.tenant_id)
  res.json({ data: tailors.map(({ password, ...u }) => u) })
})

app.post('/api/v1/users', authMiddleware, (req, res) => {
  const u = { id: USERS.length+1, tenant_id: req.user.tenant_id, is_active: true, ...req.body }
  USERS.push(u)
  const { password, ...safe } = u
  res.status(201).json({ message: 'Staff member added.', data: safe })
})

// Shop profile
app.get('/api/v1/shop/profile', authMiddleware, (req, res) => {
  res.json({ data: TENANT })
})

app.put('/api/v1/shop/profile', authMiddleware, (req, res) => {
  Object.assign(TENANT, req.body)
  res.json({ message: 'Shop profile updated.', data: TENANT })
})

// Reports
app.get('/api/v1/reports/daily-sales', authMiddleware, (req, res) => {
  res.json({ data: { date: new Date().toISOString().split('T')[0], total_orders: 3, revenue: 8500, payments: PAYMENTS.slice(0,3) } })
})

app.get('/api/v1/reports/monthly-revenue', authMiddleware, (req, res) => {
  res.json({ data: { month: new Date().toLocaleString('default',{month:'long'}), revenue: 45000, orders: ORDERS.length, paid: 35000, pending: 10000 } })
})

app.get('/api/v1/reports/pending-orders', authMiddleware, (req, res) => {
  res.json({ data: ORDERS.filter(o=>!['delivered','cancelled'].includes(o.status)).map(enrichOrder) })
})

app.get('/api/v1/reports/tailor-performance', authMiddleware, (req, res) => {
  const tailors = USERS.filter(u => u.role === 'tailor' && u.tenant_id === 1)
  res.json({ data: tailors.map(t => ({
    tailor: t,
    total_assigned: ASSIGNMENTS.filter(a=>a.tailor_id===t.id).length,
    completed: ASSIGNMENTS.filter(a=>a.tailor_id===t.id && a.status==='completed').length,
  }))})
})

app.get('/api/v1/reports/delivery-schedule', authMiddleware, (req, res) => {
  res.json({ data: ORDERS.filter(o=>o.status!=='delivered').sort((a,b)=>new Date(a.delivery_date)-new Date(b.delivery_date)).map(enrichOrder) })
})

// Audit Logs
app.get('/api/v1/audit-logs', authMiddleware, (req, res) => {
  res.json({ data: [
    { id:1, action:'created', model_type:'Order', model_id:1, user: USERS[0], created_at: new Date().toISOString() },
    { id:2, action:'updated', model_type:'Order', model_id:1, user: USERS[0], created_at: new Date().toISOString() },
    { id:3, action:'created', model_type:'Customer', model_id:1, user: USERS[0], created_at: new Date().toISOString() },
  ], meta: { total: 3 } })
})

// Receipt
app.get('/api/v1/orders/:id/receipt', authMiddleware, (req, res) => {
  const o = ORDERS.find(o => o.id === +req.params.id)
  if (!o) return res.status(404).json({ message: 'Not found.' })
  res.json({ data: { ...enrichOrder(o), shop: TENANT } })
})

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`\n  ✂️  TailorSaaS Mock API`)
  console.log(`  ➜  Running at: http://localhost:${PORT}`)
  console.log(`  ➜  Health:     http://localhost:${PORT}/health\n`)
})
