"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar as CalendarIcon, Clock, ArrowRight } from 'lucide-react'
import { parseSafeDate, formatApptDate, formatCreatedDate } from '@/lib/format'

export default function AppointmentsView() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        // Filter out completed and cancelled for the active appointments view
        setBookings(data.filter((b: any) => b.status !== 'Completed' && b.status !== 'Cancelled'))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-gray-500">Loading appointments...</div>

  const today = new Date().toISOString().split('T')[0]
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = tomorrowDate.toISOString().split('T')[0]

  const todayAppts = bookings.filter(b => b.appointment_date === today)
  const tomorrowAppts = bookings.filter(b => b.appointment_date === tomorrow)
  const upcomingAppts = bookings.filter(b => b.appointment_date > tomorrow)

  const sortTime = (a: any, b: any) => {
    const timeValA = parseInt(a.appointment_time) + (a.appointment_time.includes('PM') && !a.appointment_time.includes('12') ? 12 : 0)
    const timeValB = parseInt(b.appointment_time) + (b.appointment_time.includes('PM') && !b.appointment_time.includes('12') ? 12 : 0)
    return timeValA - timeValB
  }

  todayAppts.sort(sortTime)
  tomorrowAppts.sort(sortTime)
  upcomingAppts.sort((a,b) => parseSafeDate(a.appointment_date).getTime() - parseSafeDate(b.appointment_date).getTime() || sortTime(a,b))

  const ApptCard = ({ b }: { b: any }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-gray-300 transition">
      <div className="flex items-center gap-4">
        <div className="bg-gray-50 text-gray-900 border border-gray-200 px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[90px]">
          <Clock className="w-4 h-4 mb-1 text-gray-400" />
          <span className="font-mono font-bold text-sm">{b.appointment_time}</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{b.customer_name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{b.service}</p>
          <p className="text-xs font-mono text-gray-400 mt-1">{b.display_id}</p>
        </div>
      </div>
      <Link href={`/shopkeeper/bookings/${b.display_id}`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition">
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl space-y-12">
      <div className="flex items-center gap-3 mb-8">
        <CalendarIcon className="w-8 h-8 text-black" />
        <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-medium">Schedule & Appointments</h1>
      </div>

      {/* Today */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          Today <span className="bg-black text-white text-xs px-2 py-1 rounded-full">{todayAppts.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayAppts.length === 0 ? (
            <p className="text-gray-500 text-sm italic col-span-full p-4">No appointments today.</p>
          ) : todayAppts.map(b => <ApptCard key={b.id} b={b} />)}
        </div>
      </section>

      {/* Tomorrow */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          Tomorrow <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{tomorrowAppts.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tomorrowAppts.length === 0 ? (
            <p className="text-gray-500 text-sm italic col-span-full p-4">No appointments tomorrow.</p>
          ) : tomorrowAppts.map(b => <ApptCard key={b.id} b={b} />)}
        </div>
      </section>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          Upcoming <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{upcomingAppts.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingAppts.length === 0 ? (
            <p className="text-gray-500 text-sm italic col-span-full p-4">No upcoming appointments.</p>
          ) : upcomingAppts.map(b => (
            <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-gray-300 transition">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 text-gray-900 border border-gray-200 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[90px] text-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                    {formatApptDate(b.appointment_date, 'long')}
                  </span>
                  <span className="font-mono font-bold text-sm">{b.appointment_time}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{b.customer_name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{b.service}</p>
                </div>
              </div>
              <Link href={`/shopkeeper/bookings/${b.display_id}`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition">
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
