import { useState, useEffect } from 'react'
import { appointmentsAPI, customersAPI } from '../services/api'
import { X } from 'lucide-react'

export default function AppointmentModal({ appointment, onClose }) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    customer: appointment?.customer?._id || '',
    serviceType: appointment?.serviceType || 'tire-change',
    scheduledDate: appointment?.scheduledDate?.split('T')[0] || '',
    scheduledTime: appointment?.scheduledTime || '',
    status: appointment?.status || 'scheduled',
    vehicle: {
      make: appointment?.vehicle?.make || '',
      model: appointment?.vehicle?.model || '',
      year: appointment?.vehicle?.year || '',
    },
    notes: appointment?.notes || '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll({ limit: 100 })
      setCustomers(response.data.customers)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (appointment) {
        await appointmentsAPI.update(appointment._id, formData)
      } else {
        await appointmentsAPI.create(formData)
      }
      onClose(true)
    } catch (error) {
      console.error('Error saving appointment:', error)
      alert('Error saving appointment')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="tire-change">Tire Change</option>
              <option value="tire-rotation">Tire Rotation</option>
              <option value="wheel-alignment">Wheel Alignment</option>
              <option value="balancing">Balancing</option>
              <option value="inspection">Inspection</option>
              <option value="repair">Repair</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input"
            >
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  name="vehicle.year"
                  value={formData.vehicle.year}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Make
                </label>
                <input
                  type="text"
                  name="vehicle.make"
                  value={formData.vehicle.make}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  name="vehicle.model"
                  value={formData.vehicle.model}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary"
            >
              {loading ? 'Saving...' : appointment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
