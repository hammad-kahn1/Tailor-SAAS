import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/routes/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'

// Auth
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Landing from '@/pages/Landing'

// App pages
import Dashboard from '@/pages/Dashboard'
import CustomerList from '@/pages/customers/CustomerList'
import CustomerForm from '@/pages/customers/CustomerForm'
import CustomerDetail from '@/pages/customers/CustomerDetail'
import MeasurementForm from '@/pages/measurements/MeasurementForm'
import OrderList from '@/pages/orders/OrderList'
import OrderForm from '@/pages/orders/OrderForm'
import OrderDetail from '@/pages/orders/OrderDetail'
import WorkloadBoard from '@/pages/assignments/WorkloadBoard'
import MyAssignments from '@/pages/assignments/MyAssignments'
import Reports from '@/pages/reports/Reports'
import ShopSettings from '@/pages/settings/ShopSettings'
import StaffManagement from '@/pages/settings/StaffManagement'
import AuditLog from '@/pages/AuditLog'
import NotFound from '@/pages/NotFound'

const STAFF = ['super_admin','shop_owner','manager','receptionist']
const MANAGE = ['super_admin','shop_owner','manager']
const OWNER = ['super_admin','shop_owner']

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<Landing />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected app shell */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Customers */}
        <Route path="/customers" element={
          <ProtectedRoute roles={STAFF}><CustomerList /></ProtectedRoute>
        }/>
        <Route path="/customers/new" element={
          <ProtectedRoute roles={STAFF}><CustomerForm /></ProtectedRoute>
        }/>
        <Route path="/customers/:id" element={
          <ProtectedRoute roles={STAFF}><CustomerDetail /></ProtectedRoute>
        }/>
        <Route path="/customers/:id/edit" element={
          <ProtectedRoute roles={STAFF}><CustomerForm /></ProtectedRoute>
        }/>
        <Route path="/customers/:id/measurements/new" element={
          <ProtectedRoute roles={[...STAFF,'tailor']}><MeasurementForm /></ProtectedRoute>
        }/>

        {/* Orders */}
        <Route path="/orders" element={
          <ProtectedRoute roles={STAFF}><OrderList /></ProtectedRoute>
        }/>
        <Route path="/orders/new" element={
          <ProtectedRoute roles={STAFF}><OrderForm /></ProtectedRoute>
        }/>
        <Route path="/orders/:id" element={
          <ProtectedRoute roles={[...STAFF,'tailor']}><OrderDetail /></ProtectedRoute>
        }/>

        {/* Assignments */}
        <Route path="/assignments/workload" element={
          <ProtectedRoute roles={MANAGE}><WorkloadBoard /></ProtectedRoute>
        }/>
        <Route path="/assignments/mine" element={
          <ProtectedRoute roles={['tailor']}><MyAssignments /></ProtectedRoute>
        }/>

        {/* Reports */}
        <Route path="/reports" element={
          <ProtectedRoute roles={MANAGE}><Reports /></ProtectedRoute>
        }/>

        {/* Settings */}
        <Route path="/settings/shop" element={
          <ProtectedRoute roles={OWNER}><ShopSettings /></ProtectedRoute>
        }/>
        <Route path="/settings/staff" element={
          <ProtectedRoute roles={OWNER}><StaffManagement /></ProtectedRoute>
        }/>

        {/* Audit Log */}
        <Route path="/audit-log" element={
          <ProtectedRoute roles={OWNER}><AuditLog /></ProtectedRoute>
        }/>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
