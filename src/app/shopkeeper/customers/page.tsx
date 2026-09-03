"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Users, AlertCircle } from 'lucide-react'
import { parseSafeDate, formatApptDate, formatCreatedDate } from '@/lib/format'

export default function CustomersDirectory() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } finally {
      if (loading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  )

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[700px]">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          <div className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4" />
            {filteredCustomers.length} Customers
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-400">Loading directory...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
            <p className="text-gray-500 text-sm">Customers appear here automatically when they book.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="font-bold p-6">Customer Profile</th>
                <th className="font-bold p-6">Total Bookings</th>
                <th className="font-bold p-6">Latest Activity</th>
                <th className="font-bold p-6">Latest Service</th>
                <th className="font-bold p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition group">
                  <td className="p-6">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5 font-mono">{c.phone}</p>
                  </td>
                  <td className="p-6">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full text-xs font-bold font-mono">
                      {c.total_bookings} Order{c.total_bookings !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="font-medium text-gray-900">{c.latest_booking_date ? formatCreatedDate(c.latest_booking_date) : 'N/A'}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{c.latest_status || 'N/A'}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-medium text-gray-900">{c.latest_service || 'N/A'}</p>
                  </td>
                  <td className="p-6 text-right">
                    <Link href={`/shopkeeper/customers/${c.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">
                      View History &rarr;
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
