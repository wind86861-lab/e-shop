import { useState, useEffect } from 'react'
import { servicesAPI, customersAPI } from '../services/api'
import { X, Plus, Trash2 } from 'lucide-react'

export default function ServiceModal({ service, onClose }) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    customer: service?.customer?._id || '',
    serviceType: service?.serviceType || '',
    vehicle: {
      make: service?.vehicle?.make || '',
      model: service?.vehicle?.model || '',
      year: service?.vehicle?.year || '',
      vin: service?.vehicle?.vin || '',
    },
    items: service?.items || [],
    laborCost: service?.laborCost || 0,
    partsCost: service?.partsCost || 0,
    totalCost: service?.totalCost || 0,
    status: service?.status || 'pending',
    paymentStatus: service?.paymentStatus || 'unpaid',
    paymentMethod: service?.paymentMethod || '',
    notes: service?.notes || '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    calculateTotal()
  }, [formData.items, formData.laborCost, formData.partsCost])

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll({ limit: 100 })
      setCustomers(response.data.customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const calculateTotal = () => {
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
    const total = itemsTotal + Number(formData.laborCost) + Number(formData.partsCost)
    setFormData(prev => ({ ...prev, totalCost: total }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (service) {
        await servicesAPI.update(service._id, formData)
      } else {
        await servicesAPI.create(formData)
      }
      onClose(true)
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Error saving service')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('vehicle.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        vehicle: { ...formData.vehicle, [field]: value },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    })
  }

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {service ? 'Edit Service' : 'New Service'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.firstName} {customer.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type *
              </label>
              <input
                type="text"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  name="vehicle.year"
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                <input
                  type="text"
                  name="vehicle.make"
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  name="vehicle.model"
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                <input
                  type="text"
                  name="vehicle.vin"
                  value={formData.vehicle.vin}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Service Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-secondary text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="input flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    className="input w-20"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    className="input w-24"
                  />
                  <input
                    type="number"
                    value={item.total}
                    className="input w-24 bg-gray-50"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
              <input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parts Cost</label>
              <input
                type="number"
                name="partsCost"
                value={formData.partsCost}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
              <input
                type="number"
                value={formData.totalCost}
                className="input bg-gray-50 font-semibold"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="input">
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <input
                type="text"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => onClose(false)} className="flex-1 btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn btn-primary">
              {loading ? 'Saving...' : service ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
