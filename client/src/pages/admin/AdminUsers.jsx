import { useState, useEffect } from 'react'
import { usersAPI } from '../../services/api'
import { Users, Crown, Search, X, Send, Megaphone } from 'lucide-react'

const PREMIUM_DURATIONS = [
  { label: '1 месяц', days: 30 },
  { label: '3 месяца', days: 90 },
  { label: '6 месяцев', days: 180 },
  { label: '1 год', days: 365 },
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [premiumFilter, setPremiumFilter] = useState('')
  const [search, setSearch] = useState('')
  const [premiumModal, setPremiumModal] = useState(null)
  const [duration, setDuration] = useState(30)
  const [broadcastModal, setBroadcastModal] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastTarget, setBroadcastTarget] = useState('all')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (premiumFilter) params.isPremium = premiumFilter
      const res = await usersAPI.getAll(params)
      setUsers(res.data.users || [])
      setTotal(res.data.total || 0)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [page, premiumFilter])

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    setBroadcasting(true)
    setBroadcastResult(null)
    try {
      const res = await usersAPI.broadcast({ message: broadcastMsg, userType: broadcastTarget })
      setBroadcastResult(res.data)
      setBroadcastMsg('')
    } catch (e) { alert(e.response?.data?.message || 'Ошибка') }
    setBroadcasting(false)
  }

  const handlePremium = async (userId, grant) => {
    try {
      await usersAPI.setPremium(userId, { isPremium: grant, durationDays: duration })
      setPremiumModal(null)
      fetchUsers()
    } catch { alert('Ошибка') }
  }

  const totalPages = Math.ceil(total / 20)
  const filtered = search
    ? users.filter(u => (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search) || (u.email || '').toLowerCase().includes(search.toLowerCase()))
    : users

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 text-sm">{total} пользователей</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBroadcastModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Megaphone size={16} /> Рассылка
          </button>
          <select value={premiumFilter} onChange={e => { setPremiumFilter(e.target.value); setPage(1) }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Все</option>
            <option value="true">Premium</option>
            <option value="false">Обычные</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, email..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <Users size={48} className="text-gray-200" />
            <p>Нет пользователей</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Имя</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Телефон</th>
                  <th className="px-4 py-3 text-left">Telegram</th>
                  <th className="px-4 py-3 text-center">Статус</th>
                  <th className="px-4 py-3 text-left">Premium до</th>
                  <th className="px-4 py-3 text-center">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {user.telegramId ? (
                        <span className="font-mono">{user.telegramId}</span>
                      ) : '—'}
                      {user.telegramUsername && <span className="ml-1 text-blue-600">@{user.telegramUsername}</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isPremium ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                          <Crown size={12} /> Premium
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Обычный</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.premiumExpiresAt
                        ? new Date(user.premiumExpiresAt).toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isPremium ? (
                        <button onClick={() => handlePremium(user._id, false)} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                          Убрать Premium
                        </button>
                      ) : (
                        <button onClick={() => setPremiumModal(user)} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100">
                          Назначить Premium
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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

      {/* Broadcast modal */}
      {broadcastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Megaphone size={18} className="text-blue-500" /> Рассылка Telegram</h3>
              <button onClick={() => { setBroadcastModal(false); setBroadcastResult(null) }} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            {broadcastResult ? (
              <div className="text-center py-6">
                <p className="text-2xl font-bold text-green-600">✅ Отправлено!</p>
                <p className="text-sm text-gray-600 mt-2">Успешно: <strong>{broadcastResult.sent}</strong> · Ошибка: <strong>{broadcastResult.failed}</strong></p>
                <button onClick={() => { setBroadcastResult(null); setBroadcastModal(false) }} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm">Закрыть</button>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 font-medium mb-1">Аудитория</label>
                  <div className="flex gap-2">
                    {[['all', 'Все пользователи'], ['premium', 'Premium'], ['regular', 'Обычные']].map(([val, lbl]) => (
                      <button key={val} onClick={() => setBroadcastTarget(val)} className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition ${broadcastTarget === val ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <label className="block text-xs text-gray-500 font-medium mb-1">Сообщение (HTML)</label>
                <textarea
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Например: <b>Новая акция!</b> Скидка 30% на все товары."
                  rows={5}
                  className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
                />
                <button
                  onClick={handleBroadcast}
                  disabled={broadcasting || !broadcastMsg.trim()}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={16} /> {broadcasting ? 'Отправка...' : 'Отправить'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Premium modal */}
      {premiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Crown size={18} className="text-amber-500" /> Назначить Premium</h3>
              <button onClick={() => setPremiumModal(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Пользователь: <strong>{premiumModal.name || premiumModal.email}</strong></p>
            <label className="block text-xs text-gray-500 font-medium mb-2">Длительность</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PREMIUM_DURATIONS.map(d => (
                <button
                  key={d.days}
                  onClick={() => setDuration(d.days)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${duration === d.days ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePremium(premiumModal._id, true)}
              className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600"
            >
              Назначить на {PREMIUM_DURATIONS.find(d => d.days === duration)?.label}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
