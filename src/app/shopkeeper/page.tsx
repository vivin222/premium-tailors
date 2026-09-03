"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Search, Clock, CheckCircle2, ChevronRight, PackageCheck, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShopkeeperDashboard() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch (err) {
      console.error('Polling failed')
    } finally {
      if (loading) setLoading(false)
    }
  }

  // 5-second polling for near-real-time sync
  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 5000)
    return () => clearInterval(interval)
  }, [loading])

  const updateStatus = async (id: string, displayId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Booking ${displayId} marked as ${newStatus}`)
        fetchBookings() // Instant refresh
      } else {
        toast.error('Failed to update status')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  // Calculated Metrics
  const today = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.appointment_date === today).length
  const pendingCount = bookings.filter(b => b.status === 'Pending').length
  const inProgressCount = bookings.filter(b => b.status === 'In Progress').length
  const readyCount = bookings.filter(b => b.status === 'Ready').length

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.display_id.toLowerCase().includes(search.toLowerCase()) || 
                          b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                          b.customer_phone.includes(search)
    const matchesFilter = filter === 'All' || b.status === filter
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <p className="text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-black text-white px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Scissors className="w-6 h-6" />
          <h1 className="text-xl font-[family-name:var(--font-playfair)] font-medium tracking-wide">Premium Tailors <span className="text-gray-400 font-sans text-sm tracking-normal ml-2">/ Operations</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold bg-gray-800 px-3 py-1.5 rounded-full uppercase tracking-widest text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Live Sync
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-8">
        
        {/* Real Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Today's Appointments</h3>
            <p className="text-4xl font-light tracking-tight">{todayBookings}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Pending Review</h3>
            <p className="text-4xl font-light tracking-tight text-amber-500">{pendingCount}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">In Progress</h3>
            <p className="text-4xl font-light tracking-tight text-blue-500">{inProgressCount}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Ready for Pickup</h3>
            <p className="text-4xl font-light tracking-tight text-green-500">{readyCount}</p>
          </div>
        </div>

        {/* Master Booking Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search ID, Name, or Phone..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {['All', 'Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition \${filter === f ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
                <p className="text-gray-500 text-sm">Waiting for new customers to book appointments.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <th className="font-bold p-6 font-mono">Booking ID</th>
                    <th className="font-bold p-6">Customer</th>
                    <th className="font-bold p-6">Service & Date</th>
                    <th className="font-bold p-6">Status</th>
                    <th className="font-bold p-6 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredBookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition group">
                      <td className="p-6">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{b.display_id}</span>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold text-gray-900">{b.customer_name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{b.customer_phone}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold text-gray-900">{b.service}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{b.appointment_date} @ {b.appointment_time}</p>
                      </td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider \${
                          b.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          b.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          b.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                          b.status === 'Ready' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-6 text-right space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {b.status === 'Pending' && (
                          <button onClick={() => updateStatus(b.id, b.display_id, 'Confirmed')} className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition">Confirm</button>
                        )}
                        {b.status === 'Confirmed' && (
                          <button onClick={() => updateStatus(b.id, b.display_id, 'In Progress')} className="px-4 py-2 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition">Start Work</button>
                        )}
                        {b.status === 'In Progress' && (
                          <button onClick={() => updateStatus(b.id, b.display_id, 'Ready')} className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition">Mark Ready</button>
                        )}
                        {b.status === 'Ready' && (
                          <button onClick={() => updateStatus(b.id, b.display_id, 'Completed')} className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition">Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
