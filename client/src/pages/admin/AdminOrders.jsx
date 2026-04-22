import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersAPI } from '../../services/api'
import { ShoppingCart, Trash2, Phone, User, Search, Eye, MapPin, CreditCard, Filter } from 'lucide-react'

const STATUS_LABELS = {
  new: { label: 'Новый', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'В обработке', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Подтверждён', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Выполнен', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-700' },
}

const PAYMENT_LABELS = {
  pending: { label: 'Ожидает', color: 'bg-gray-100 text-gray-600' },
  paid: { label: 'Оплачен', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Ошибка', color: 'bg-red-100 text-red-600' },
  refunded: { label: 'Возврат', color: 'bg-orange-100 text-orange-700' },
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (statusFilter) params.status = statusFilter
      if (paymentFilter) params.paymentStatus = paymentFilter
      if (searchQuery) params.search = searchQuery
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await ordersAPI.getAll(params)
      setOrders(res.data.orders || [])
      setTotal(res.data.total || 0)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [page, statusFilter, paymentFilter, dateFrom, dateTo])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }

  const handleStatusChange = async (id, status) => {
    try {
      await ordersAPI.update(id, { status })
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
    } catch { alert('Ошибка') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить заказ?')) return
    try { await ordersAPI.delete(id); fetchOrders() } catch { alert('Ошибка') }
  }

  const totalPages = Math.ceil(total / 20)
  const fmt = (n) => Number(n).toLocaleString('ru-RU')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Заказы</h1>
          <p className="text-gray-600 text-sm">{total} заказов</p>
        </div>
        <button onClick={() => setShowFilters(f => !f)} className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
          <Filter size={14} /> Фильтры
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени, телефону или ID..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Найти</button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Все статусы</option>
            {Object.entries(STATUS_LABELS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Все оплаты</option>
            {Object.entries(PAYMENT_LABELS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Загрузка...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <ShoppingCart size={48} className="text-gray-200" />
            <p>Заказов нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Клиент</th>
                  <th className="px-4 py-3 text-left">Район</th>
                  <th className="px-4 py-3 text-right">Сумма</th>
                  <th className="px-4 py-3 text-center">Статус</th>
                  <th className="px-4 py-3 text-center">Оплата</th>
                  <th className="px-4 py-3 text-left">Дата</th>
                  <th className="px-4 py-3 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => {
                  const s = STATUS_LABELS[order.status] || STATUS_LABELS.new
                  const p = PAYMENT_LABELS[order.paymentStatus] || PAYMENT_LABELS.pending
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">...{order._id.slice(-6)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{order.customerName || '—'}</p>
                            <p className="text-xs text-gray-500">{order.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{order.district || '—'}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{fmt(order.totalPrice)} <span className="text-xs font-normal">сум</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.color}`}>{p.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Eye size={16} /></button>
                          <button onClick={() => handleDelete(order._id)} className="p-1.5 hover:bg-red-50 rounded text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Стр. {page} из {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Назад</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Вперёд</button>
          </div>
        </div>
      )}
    </div>
  )
}
