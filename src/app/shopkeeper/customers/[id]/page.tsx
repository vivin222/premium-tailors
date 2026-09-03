"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Calendar } from 'lucide-react'

export default function CustomerDetail({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/customers/${params.id}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <div className="p-8 text-gray-500">Loading customer profile...</div>
  if (!data || !data.customer) return <div className="p-8 text-red-500">Customer not found.</div>

  const { customer, bookings } = data

  return (
    <div className="max-w-4xl space-y-8">
      <Link href="/shopkeeper/customers" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-medium mb-1">{customer.name}</h1>
          <p className="flex items-center gap-2 text-gray-500 font-mono">
            <Phone className="w-4 h-4" /> {customer.phone}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer Since</p>
          <p className="font-medium">{new Date(customer.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Booking History ({bookings.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-50">
          {bookings.map((b: any) => (
            <div key={b.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
              <div>
                <Link href={`/shopkeeper/bookings/${b.display_id}`} className="font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition inline-block mb-2">
                  {b.display_id}
                </Link>
                <p className="font-medium text-gray-900">{b.service}</p>
                <p className="text-sm text-gray-500 mt-1">Appt: {new Date(b.appointment_date).toLocaleDateString()} @ {b.appointment_time}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
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
                <Link href={`/shopkeeper/bookings/${b.display_id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                  Manage Booking
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
