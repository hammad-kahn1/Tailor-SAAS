import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, Users, ShoppingBag, Scissors, BarChart3,
  Settings, LogOut, Menu, X, Ruler,
  ClipboardList, Shield
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/dashboard',            roles: null },
  { label: 'Customers',    icon: Users,            to: '/customers',            roles: ['super_admin','shop_owner','manager','receptionist'] },
  { label: 'Orders',       icon: ShoppingBag,      to: '/orders',               roles: ['super_admin','shop_owner','manager','receptionist'] },
  { label: 'My Queue',     icon: ClipboardList,    to: '/assignments/mine',     roles: ['tailor'] },
  { label: 'Workload',     icon: Scissors,         to: '/assignments/workload', roles: ['super_admin','shop_owner','manager'] },
  { label: 'Reports',      icon: BarChart3,        to: '/reports',              roles: ['super_admin','shop_owner','manager'] },
  { label: 'Audit Log',    icon: Shield,           to: '/audit-log',            roles: ['super_admin','shop_owner'] },
  { label: 'Staff',        icon: Users,            to: '/settings/staff',       roles: ['super_admin','shop_owner'] },
  { label: 'Shop Settings',icon: Settings,         to: '/settings/shop',        roles: ['super_admin','shop_owner'] },
]

const ROLE_PILL = {
  super_admin:  'bg-purple-100 text-purple-700',
  shop_owner:   'bg-pink-100 text-pink-700',
  manager:      'bg-blue-100 text-blue-700',
  tailor:       'bg-mint-100 text-mint-700',
  receptionist: 'bg-amber-100 text-amber-700',
}

export default function DashboardLayout() {
  const user = useAuth().user
  const logout = useAuth().logout
  const tenantName = useAuth().tenantName
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const visible = navItems.filter(i => !i.roles || i.roles.includes(user?.role))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-white border-r border-slate-100 font-sans">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-mulberry to-brand-500 shadow-sm">
          <Scissors size={16} className="text-white" />
        </div>
        <div>
          <div className="text-[13px] font-bold leading-tight tracking-wide text-navy font-display">TailorSaaS</div>
          <div className="text-[11px] truncate max-w-[130px] text-slate-400 font-medium">{tenantName}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-hide">
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
              isActive
                ? 'bg-mulberry text-white shadow-sm'
                : 'text-slate-500 hover:text-navy hover:bg-slate-50'
            )}
          >
            <item.icon size={16} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-100 mx-2 mb-2">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-slate-50">
          <div className="h-8 w-8 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-navy to-navy-light rounded-xl shadow-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate text-navy">{user?.name}</div>
            <div className="text-[10px] font-medium capitalize text-slate-400">{user?.role?.replace('_',' ')}</div>
          </div>
          <button onClick={handleLogout} className="transition-colors hover:text-mulberry text-slate-400 p-1 rounded-lg hover:bg-pink-50" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:shrink-0 lg:flex-col shadow-sidebar">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-navy/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col shadow-2xl">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-100 bg-white px-5 lg:hidden shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-navy transition-colors">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-mulberry to-brand-500">
              <Scissors size={13} className="text-white" />
            </div>
            <span className="font-bold text-navy tracking-wide text-sm font-display">TailorSaaS</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 font-sans">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
