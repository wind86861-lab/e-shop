import { useEffect, useState } from 'react'
import { servicesAPI } from '../services/api'
import { Plus, DollarSign, User, Calendar } from 'lucide-react'
import ServiceModal from '../components/ServiceModal'
import { format } from 'date-fns'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchServices()
  }, [filter])

  const fetchServices = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await servicesAPI.getAll(params)
      setServices(response.data.services)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      await servicesAPI.delete(id)
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const handleEdit = (service) => {
    setSelectedService(service)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedService(null)
    setShowModal(true)
  }

  const handleModalClose = (refresh) => {
    setShowModal(false)
    setSelectedService(null)
    if (refresh) fetchServices()
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentColor = (status) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage service orders</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Service
        </button>
      </div>

      <div className="card">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'in-progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div key={service._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="text-primary-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {service.customer?.firstName} {service.customer?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{service.serviceType}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentColor(service.paymentStatus)}`}>
                    {service.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {service.vehicle && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>
                      {service.vehicle.year} {service.vehicle.make} {service.vehicle.model}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={16} />
                  <span className="font-semibold">${service.totalCost.toLocaleString()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(service.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>

              {service.items && service.items.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Service Items:</p>
                  <div className="space-y-1">
                    {service.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.description} (x{item.quantity})
                        </span>
                        <span className="font-medium text-gray-900">${item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="flex-1 btn btn-danger text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found</p>
        </div>
      )}

      {showModal && (
        <ServiceModal
          service={selectedService}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
