"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, Clock, PackageCheck, Scissors, AlertCircle, RefreshCcw } from 'lucide-react'

const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed']

export default function TrackingTimeline({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setBooking(data)
      setError(false)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Poll every 5 seconds for live status updates
  useEffect(() => {
    fetchBooking()
    const interval = setInterval(fetchBooking, 5000)
    return () => clearInterval(interval)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="py-6 px-8 bg-white border-b border-gray-200">
          <Link href="/track" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tracking
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center border border-gray-100">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-medium mb-2">Booking Not Found</h2>
            <p className="text-gray-500 mb-8">We couldn't find an order with the ID <strong className="text-gray-900">{params.id}</strong>. Please check your ID and try again.</p>
            <Link href="/track" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentStepIndex = STATUSES.indexOf(booking.status)
  const isCancelled = booking.status === 'Cancelled'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="py-6 px-8 bg-white border-b border-gray-200 flex justify-between items-center">
        <Link href="/track" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tracking
        </Link>
        <div className="flex items-center text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest gap-2">
          <RefreshCcw className="w-3 h-3 animate-spin-slow" /> Auto-syncing
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          <div className="bg-black text-white p-8">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Order Tracking</p>
            <div className="flex justify-between items-end">
              <h1 className="text-4xl font-mono font-bold tracking-tight">{booking.display_id}</h1>
              <div className="text-right">
                <p className="text-sm text-gray-300 font-medium">{booking.customer_name}</p>
                <p className="text-sm font-semibold mt-1">{booking.service}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {isCancelled ? (
              <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
                <AlertCircle className="w-8 h-8" />
                <div>
                  <h3 className="font-bold">Order Cancelled</h3>
                  <p className="text-sm mt-1">This booking has been cancelled. Please contact the shop for details.</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-8 space-y-12 py-4">
                {/* Vertical Line */}
                <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-gray-100"></div>
                <div 
                  className="absolute top-2 left-[19px] w-0.5 bg-black transition-all duration-1000 ease-out"
                  style={{ height: `\${(Math.max(0, currentStepIndex) / (STATUSES.length - 1)) * 100}%` }}
                ></div>

                {STATUSES.map((status, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  
                  return (
                    <div key={status} className={`relative flex items-center gap-6 \${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center -ml-5 shadow-sm transition-colors duration-500 \${isCompleted ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                        {index === 0 ? <Clock className="w-5 h-5" /> : 
                         index === 2 ? <Scissors className="w-5 h-5" /> : 
                         index === 4 ? <PackageCheck className="w-5 h-5" /> : 
                         <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold \${isCurrent ? 'text-black' : 'text-gray-900'}`}>{status}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                          {status === 'Pending' && 'Waiting for shopkeeper review'}
                          {status === 'Confirmed' && 'Appointment confirmed'}
                          {status === 'In Progress' && 'Garment is being stitched'}
                          {status === 'Ready' && 'Ready for pickup / fitting'}
                          {status === 'Completed' && 'Handed over to customer'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Appointment Details</h4>
              <div className="flex justify-between items-center text-sm font-medium text-gray-900">
                <div className="flex flex-col">
                  <span className="text-gray-500 mb-1">Date</span>
                  <span>{new Date(booking.appointment_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-500 mb-1">Time</span>
                  <span>{booking.appointment_time}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
