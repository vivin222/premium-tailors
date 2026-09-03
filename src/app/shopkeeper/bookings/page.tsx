"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, AlertCircle, Filter, ArrowRight, Calendar, Clock } from 'lucide-react'

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } finally {
      if (loading) setLoading(false)
    }
  }

  // 5-second polling
  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 5000)
    return () => clearInterval(interval)
  }, [loading])

  const filteredAndSortedBookings = bookings
    .filter(b => {
      const matchesSearch = b.display_id.toLowerCase().includes(search.toLowerCase()) || 
                            b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                            b.customer_phone.includes(search)
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'Oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'Appointment Time') {
        const dateA = new Date(a.appointment_date + 'T' + (a.appointment_time.includes('PM') && !a.appointment_time.includes('12') ? parseInt(a.appointment_time)+12 : parseInt(a.appointment_time)) + ':00:00').getTime()
        const dateB = new Date(b.appointment_date + 'T' + (b.appointment_time.includes('PM') && !b.appointment_time.includes('12') ? parseInt(b.appointment_time)+12 : parseInt(b.appointment_time)) + ':00:00').getTime()
        return dateA - dateB
      }
      return 0
    })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-700'
      case 'Confirmed': return 'bg-blue-100 text-blue-700'
      case 'In Progress': return 'bg-indigo-100 text-indigo-700'
      case 'Ready': return 'bg-green-100 text-green-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[700px]">
      {/* Toolbar */}
      <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition font-medium"
            >
              <option value="Newest">Sort: Newest First</option>
              <option value="Oldest">Sort: Oldest First</option>
              <option value="Appointment Time">Sort: Appointment Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50/20 p-4 md:p-0">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (Visible only on small screens) */}
            <div className="md:hidden space-y-4">
              {filteredAndSortedBookings.map(b => (
                <div key={`mobile-${b.id}`} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">{b.display_id}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{b.customer_name}</h3>
                  <p className="text-sm text-gray-500 font-mono mb-4">{b.customer_phone}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2 mb-4">
                    <p className="font-medium text-gray-900 text-sm">{b.service}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" /> {new Date(b.appointment_date).toLocaleDateString()}
                      <span className="text-gray-300">|</span>
                      <Clock className="w-4 h-4" /> {b.appointment_time}
                    </div>
                  </div>

                  <Link href={`/shopkeeper/bookings/${b.display_id}`} className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl text-sm font-bold transition">
                    Manage Booking <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop Table (Hidden on small screens) */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-white text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="font-bold p-6 font-mono">Booking ID</th>
                  <th className="font-bold p-6">Customer</th>
                  <th className="font-bold p-6">Service</th>
                  <th className="font-bold p-6">Date & Time</th>
                  <th className="font-bold p-6">Status</th>
                  <th className="font-bold p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAndSortedBookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition group bg-white">
                    <td className="p-6">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{b.display_id}</span>
                    </td>
                    <td className="p-6">
                      <p className="font-semibold text-gray-900">{b.customer_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{b.customer_phone}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-medium text-gray-900">{b.service}</p>
                    </td>
                    <td className="p-6">
                      <p className="font-medium text-gray-900">{new Date(b.appointment_date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{b.appointment_time}</p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <Link href={`/shopkeeper/bookings/${b.display_id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                        Manage <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
