import { useEffect, useState } from 'react'
import { inventoryAPI } from '../services/api'
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react'
import InventoryModal from '../components/InventoryModal'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchInventory()
  }, [search, filter])

  const fetchInventory = async () => {
    try {
      const params = { search }
      if (filter !== 'all') {
        if (filter === 'low-stock') {
          params.lowStock = 'true'
        } else {
          params.category = filter
        }
      }
      const response = await inventoryAPI.getAll(params)
      setItems(response.data.items)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      await inventoryAPI.delete(id)
      fetchInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedItem(null)
    setShowModal(true)
  }

  const handleModalClose = (refresh) => {
    setShowModal(false)
    setSelectedItem(null)
    if (refresh) fetchInventory()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your parts and tire inventory</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Item
        </button>
      </div>

      <div className="card space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['all', 'tire', 'wheel', 'part', 'accessory', 'tool', 'low-stock'].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.brand} {item.model}</p>
                </div>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                  {item.category}
                </span>
              </div>

              {item.size && (
                <p className="text-sm text-gray-600 mb-2">Size: {item.size}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className={`text-lg font-semibold ${
                    item.quantity <= item.minQuantity ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {item.quantity}
                    {item.quantity <= item.minQuantity && (
                      <AlertTriangle className="inline ml-1 mb-1" size={16} />
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Retail Price</p>
                  <p className="text-lg font-semibold text-gray-900">${item.retailPrice}</p>
                </div>
              </div>

              {item.sku && (
                <p className="text-xs text-gray-500 mb-4">SKU: {item.sku}</p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="flex-1 btn btn-danger text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No inventory items found</p>
        </div>
      )}

      {showModal && (
        <InventoryModal
          item={selectedItem}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
