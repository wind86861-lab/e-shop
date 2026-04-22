import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  MapPin,
  HelpCircle,
  MessageSquare,
  Settings,
  FileEdit,
  LogOut,
  Menu,
  X,
  Users,
  ShoppingBag,
  ChevronRight,
  Store
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Главная', href: '/admin', icon: LayoutDashboard, group: 'main' },
  { name: 'Заказы', href: '/admin/orders', icon: ShoppingBag, group: 'shop' },
  { name: 'Товары', href: '/admin/products', icon: Package, group: 'shop' },
  { name: 'Категории', href: '/admin/categories', icon: FolderTree, group: 'shop' },
  { name: 'Заявки', href: '/admin/requests', icon: MessageSquare, group: 'crm' },
  { name: 'Блог', href: '/admin/blogs', icon: FileText, group: 'content' },
  { name: 'Филиалы', href: '/admin/branches', icon: MapPin, group: 'content' },
  { name: 'Команда', href: '/admin/team', icon: Users, group: 'content' },
  { name: 'FAQ', href: '/admin/faq', icon: HelpCircle, group: 'content' },
  { name: 'Контент страниц', href: '/admin/pages', icon: FileEdit, group: 'content' },
  { name: 'Пользователи', href: '/admin/users', icon: Users, group: 'crm' },
  { name: 'Настройки', href: '/admin/settings', icon: Settings, group: 'system' },
]

const groupLabels = {
  main: null,
  shop: 'Магазин',
  crm: 'CRM',
  content: 'Контент',
  system: 'Система',
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const groupedNav = Object.entries(groupLabels).map(([key, label]) => ({
    label,
    items: navigation.filter(n => n.group === key),
  })).filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">PneuMax</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[#0f172a] transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">PneuMax</h1>
                <p className="text-[11px] text-gray-500 font-medium">Панель управления</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 pb-3 space-y-5 overflow-y-auto">
            {groupedNav.map((group, gi) => (
              <div key={gi}>
                {group.label && (
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-3 mb-2">{group.label}</p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/admin'
                      ? location.pathname === '/admin' || location.pathname === '/admin/'
                      : location.pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                          ? 'bg-blue-600/20 text-blue-400 font-medium'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                          }`}
                      >
                        <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
                        <span className="flex-1">{item.name}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">Администратор</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
            >
              <LogOut size={18} />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-[260px] pt-14 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
