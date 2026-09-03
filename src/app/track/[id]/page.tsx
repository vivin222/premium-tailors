"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, CheckCircle2, Circle, Clock, Check, Scissors, PackageCheck, AlertCircle } from 'lucide-react'
import { parseSafeDate, formatApptDate, formatCreatedDate } from '@/lib/format'

const STATUS_STEPS = [
  { id: 'Pending', label: 'Booking Received', desc: 'We have received your appointment request.', icon: Clock },
  { id: 'Confirmed', label: 'Confirmed', desc: 'Your appointment is confirmed.', icon: Check },
  { id: 'In Progress', label: 'In Progress', desc: 'Our master tailors are working on your garment.', icon: Scissors },
  { id: 'Ready', label: 'Ready for Pickup', desc: 'Your garment is ready for fitting or pickup.', icon: PackageCheck },
  { id: 'Completed', label: 'Completed', desc: 'Order finished and delivered.', icon: CheckCircle2 }
]

export default function TrackingPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      if (loading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <nav className="py-6 px-8 bg-white border-b border-gray-200">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Locating Booking...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <nav className="py-6 px-8 bg-white border-b border-gray-200">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mb-6" />
          <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-medium mb-2 text-gray-900">Booking Not Found</h1>
          <p className="text-gray-500 max-w-sm mb-8">We couldn't find a booking with ID <span className="font-mono font-bold text-gray-900">{params.id}</span>. Please double-check your tracking number.</p>
          <Link href="/track" className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition">
            Try Another ID
          </Link>
        </div>
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === booking.status)
  const isCancelled = booking.status === 'Cancelled'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="py-6 px-8 bg-white border-b border-gray-200 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        <Link href="/track" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
          <Search className="w-4 h-4 mr-2" /> Track Another
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Timeline UI */}
          <div className="md:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
            <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-medium text-gray-900 mb-2">Order Status</h1>
            <p className="text-gray-500 mb-10 text-sm">Tracking ID: <span className="font-mono font-bold text-gray-900">{booking.display_id}</span></p>

            {isCancelled ? (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 text-lg">Booking Cancelled</h3>
                  <p className="text-red-700 mt-1">This appointment has been cancelled. Please contact the studio if you believe this is a mistake.</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical Line connecting steps */}
                <div className="absolute left-[21px] top-4 bottom-8 w-[2px] bg-gray-100" />

                <div className="space-y-10 relative">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const StepIcon = step.icon

                    return (
                      <div key={step.id} className={`flex gap-6 relative z-10 transition-all duration-500 \${isCompleted ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-[3px] \${
                          isCurrent ? 'bg-black border-black text-white' :
                          isCompleted ? 'bg-white border-black text-black' :
                          'bg-white border-gray-200 text-gray-300'
                        }`}>
                          <StepIcon className={`w-5 h-5 \${isCurrent ? 'animate-pulse' : ''}`} />
                        </div>
                        <div className="pt-2">
                          <h3 className={`text-lg font-bold \${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Appointment Details</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Service</p>
                  <p className="font-semibold text-gray-900">{booking.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                  <p className="font-semibold text-gray-900">{formatApptDate(booking.appointment_date, 'long')}</p>
                  <p className="text-gray-500 font-mono text-sm">{booking.appointment_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                  <p className="text-gray-500 font-mono text-sm">{booking.customer_phone}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-500">Booking Deposit</p>
                    <p className="font-semibold text-gray-900">₹{booking.deposit_amount || 50}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className={`font-semibold ${
                      booking.payment_status === 'Confirmed' ? 'text-green-600' : 
                      booking.payment_status === 'Submitted' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {booking.payment_status || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-3xl border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Need to make changes?</p>
              <p className="text-sm text-gray-600 mb-4">Contact our studio directly to reschedule or update your requirements.</p>
              <a href="tel:+919876543210" className="inline-block bg-white border border-gray-300 text-black px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:border-gray-400 transition">
                Call Studio
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
