import { useEffect, useState } from 'react'
import { appointmentsAPI, customersAPI } from '../services/api'
import { Plus, Calendar as CalendarIcon, Clock, User } from 'lucide-react'
import AppointmentModal from '../components/AppointmentModal'
import { format } from 'date-fns'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {}
      const response = await appointmentsAPI.getAll(params)
      setAppointments(response.data.appointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
      await appointmentsAPI.delete(id)
      fetchAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
    }
  }

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedAppointment(null)
    setShowModal(true)
  }

  const handleModalClose = (refresh) => {
    setShowModal(false)
    setSelectedAppointment(null)
    if (refresh) fetchAppointments()
  }

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-green-100 text-green-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage service appointments</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          New Appointment
        </button>
      </div>

      <div className="card">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'scheduled', 'confirmed', 'in-progress', 'completed'].map((status) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="text-primary-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {appointment.customer?.firstName} {appointment.customer?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.serviceType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon size={16} />
                  <span>{format(new Date(appointment.scheduledDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{appointment.scheduledTime}</span>
                </div>
                {appointment.vehicle && (
                  <p className="text-sm text-gray-600">
                    {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                  </p>
                )}
              </div>

              {appointment.notes && (
                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                  {appointment.notes}
                </p>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(appointment)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(appointment._id)}
                  className="flex-1 btn btn-danger text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}

      {showModal && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
