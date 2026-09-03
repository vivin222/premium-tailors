"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, MapPin, AlignLeft, Scissors, Clock, CheckCircle2, PackageCheck, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BookingDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
      }
    } finally {
      if (loading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooking()
    const interval = setInterval(fetchBooking, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  const updateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Booking status updated to ${newStatus}`)
        fetchBooking()
      } else {
        toast.error('Failed to update status')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading details...</div>
  if (!booking) return <div className="p-8 text-red-500">Booking not found.</div>

  const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed', 'Cancelled']

  return (
    <div className="max-w-4xl">
      <Link href="/shopkeeper/bookings" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-8 flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Booking Management</p>
            <h1 className="text-4xl font-mono font-bold tracking-tight">{booking.display_id}</h1>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            booking.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' :
            booking.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-300' :
            booking.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300' :
            booking.status === 'Ready' ? 'bg-green-500/20 text-green-300' :
            booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-300' :
            'bg-gray-800 text-gray-300'
          }`}>
            {booking.status}
          </span>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
                <User className="w-4 h-4" /> Customer Details
              </h2>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-xl font-bold text-gray-900">{booking.customer_name}</p>
                <p className="text-gray-500 mt-1 font-mono">{booking.customer_phone}</p>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
                <Calendar className="w-4 h-4" /> Appointment & Service
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Service</p>
                  <p className="text-lg font-medium text-gray-900">{booking.service}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="text-lg font-medium text-gray-900">{new Date(booking.appointment_date).toLocaleDateString()}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{booking.appointment_time}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
                <AlignLeft className="w-4 h-4" /> Customer Notes
              </h2>
              <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                <p className="text-gray-700 italic">{booking.notes || "No special requirements provided."}</p>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
                <Scissors className="w-4 h-4" /> Actions
              </h2>
              <div className="space-y-3">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    disabled={booking.status === s}
                    onClick={() => updateStatus(s)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      booking.status === s 
                      ? 'bg-black text-white cursor-default'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Set to {s}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">
                <Clock className="w-4 h-4" /> Meta
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-mono text-xs">{booking.id}</span>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
