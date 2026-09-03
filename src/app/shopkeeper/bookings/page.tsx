"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, AlertCircle, ChevronDown, Filter } from 'lucide-react'

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

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[700px]">
      {/* Toolbar */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search ID, Name, or Phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition font-medium"
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
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition font-medium"
            >
              <option value="Newest">Sort: Newest First</option>
              <option value="Oldest">Sort: Oldest First</option>
              <option value="Appointment Time">Sort: Appointment Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
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
                <tr key={b.id} className="hover:bg-gray-50 transition group">
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      b.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      b.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                      b.status === 'Ready' ? 'bg-green-100 text-green-700' :
                      b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Link href={`/shopkeeper/bookings/${b.display_id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                      Manage &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
