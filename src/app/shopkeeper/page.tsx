"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, CheckCircle2, Scissors, CalendarDays } from 'lucide-react'
import { parseSafeDate, formatApptDate, formatCreatedDate } from '@/lib/format'

export default function Dashboard() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  // 5-second polling for real-time dashboard updates
  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 5000)
    return () => clearInterval(interval)
  }, [loading])

  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const todayBookings = bookings.filter(b => b.appointment_date === today)
  const pendingBookings = bookings.filter(b => b.status === 'Pending')
  const inProgressCount = bookings.filter(b => b.status === 'In Progress').length
  const readyCount = bookings.filter(b => b.status === 'Ready').length
  const completedCount = bookings.filter(b => b.status === 'Completed').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-medium mb-2">Overview</h1>
          <p className="text-gray-400">Here is what's happening at the studio today.</p>
        </div>
        <Scissors className="w-16 h-16 text-gray-800" strokeWidth={1} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Today's Appts</h3>
            <CalendarDays className="w-5 h-5 text-gray-300" />
          </div>
          <p className="text-4xl font-light tracking-tight">{todayBookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Pending Review</h3>
            <Clock className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-4xl font-light tracking-tight text-amber-500">{pendingBookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">In Progress</h3>
            <Scissors className="w-5 h-5 text-blue-300" />
          </div>
          <p className="text-4xl font-light tracking-tight text-blue-500">{inProgressCount}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Ready for Pickup</h3>
            <CheckCircle2 className="w-5 h-5 text-green-300" />
          </div>
          <p className="text-4xl font-light tracking-tight text-green-500">{readyCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Needed */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Action Needed (Pending)</h2>
            <Link href="/shopkeeper/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No pending bookings. You're all caught up!</div>
            ) : (
              pendingBookings.slice(0, 5).map(b => (
                <div key={b.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                  <div>
                    <Link href={`/shopkeeper/bookings/${b.display_id}`} className="font-bold text-gray-900 hover:underline">{b.display_id}</Link>
                    <p className="text-sm text-gray-500 mt-1">{b.customer_name} • {b.service}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Today's Appointments</h2>
            <Link href="/shopkeeper/appointments" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Schedule <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {todayBookings.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No appointments scheduled for today.</div>
            ) : (
              todayBookings.sort((a,b) => a.appointment_time.localeCompare(b.appointment_time)).slice(0, 5).map(b => (
                <div key={b.id} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl font-bold font-mono text-sm shrink-0">
                    {b.appointment_time}
                  </div>
                  <div>
                    <Link href={`/shopkeeper/bookings/${b.display_id}`} className="font-bold text-gray-900 hover:underline">{b.customer_name}</Link>
                    <p className="text-sm text-gray-500 mt-1">{b.service}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
