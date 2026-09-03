"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Calendar, AlignLeft, Scissors, Clock, CheckCircle2, Play, PackageCheck, Ban, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { parseSafeDate, formatApptDate, formatCreatedDate } from '@/lib/format'

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
    const loadingToast = toast.loading('Updating status...')
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Booking marked as ${newStatus}`, { id: loadingToast })
        fetchBooking()
      } else {
        toast.error('Failed to update status', { id: loadingToast })
      }
    } catch (err) {
      toast.error('Network error', { id: loadingToast })
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading details...</div>
  if (!booking) return <div className="p-8 text-red-500">Booking not found.</div>

  const isCancelled = booking.status === 'Cancelled'
  const isCompleted = booking.status === 'Completed'

  return (
    <div className="max-w-4xl">
      <Link href="/shopkeeper/bookings" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Booking Management</p>
            <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight">{booking.display_id}</h1>
          </div>
          <span className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
            booking.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            booking.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
            booking.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
            booking.status === 'Ready' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
            'bg-gray-800 text-gray-300 border border-gray-700'
          }`}>
            {booking.status}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <div className="md:col-span-2 space-y-10">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">
                <User className="w-4 h-4" /> Customer Details
              </h2>
              <div className="bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100">
                <p className="text-2xl font-bold text-gray-900">{booking.customer_name}</p>
                <p className="text-gray-500 mt-2 font-mono">{booking.customer_phone}</p>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">
                <Calendar className="w-4 h-4" /> Appointment & Service
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Service</p>
                  <p className="text-lg font-medium text-gray-900">{booking.service}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date & Time</p>
                  <p className="text-lg font-medium text-gray-900">{formatApptDate(booking.appointment_date, 'long')}</p>
                  <p className="text-gray-500 text-sm mt-1">{booking.appointment_time}</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">
                <AlignLeft className="w-4 h-4" /> Customer Notes
              </h2>
              <div className="bg-yellow-50/50 p-6 rounded-3xl border border-yellow-100">
                <p className="text-gray-700 italic leading-relaxed">{booking.notes || "No special requirements provided."}</p>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">
                <Scissors className="w-4 h-4" /> Actions
              </h2>
              
              <div className="space-y-3">
                {booking.status === 'Pending' && (
                  <button onClick={() => updateStatus('Confirmed')} className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-black/10">
                    <CheckCircle2 className="w-5 h-5" /> Confirm Booking
                  </button>
                )}
                
                {booking.status === 'Confirmed' && (
                  <button onClick={() => updateStatus('In Progress')} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20">
                    <Play className="w-5 h-5 fill-current" /> Start Work
                  </button>
                )}

                {booking.status === 'In Progress' && (
                  <button onClick={() => updateStatus('Ready')} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-full font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20">
                    <PackageCheck className="w-5 h-5" /> Mark Ready
                  </button>
                )}

                {booking.status === 'Ready' && (
                  <button onClick={() => updateStatus('Completed')} className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-black/10">
                    <CheckCircle2 className="w-5 h-5" /> Complete Order
                  </button>
                )}

                {isCompleted && (
                  <div className="bg-gray-50 border border-gray-200 text-center py-4 rounded-2xl">
                    <CheckCircle2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Order Completed</p>
                  </div>
                )}

                {isCancelled && (
                  <div className="bg-red-50 border border-red-100 text-center py-4 rounded-2xl">
                    <Ban className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-red-500 uppercase tracking-widest">Order Cancelled</p>
                  </div>
                )}

                {/* Cancel option for non-completed states */}
                {(!isCompleted && !isCancelled) && (
                  <button onClick={() => {
                    if (confirm('Are you sure you want to cancel this booking?')) updateStatus('Cancelled')
                  }} className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 px-6 py-3 rounded-full font-bold transition mt-4">
                    <Trash2 className="w-4 h-4" /> Cancel Booking
                  </button>
                )}
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-5 border-b border-gray-100 pb-3">
                <Clock className="w-4 h-4" /> Metadata
              </h2>
              <div className="space-y-4 text-sm bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">{formatCreatedDate(booking.created_at)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Internal ID</span>
                  <span className="font-mono text-xs text-gray-900">{booking.id}</span>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
