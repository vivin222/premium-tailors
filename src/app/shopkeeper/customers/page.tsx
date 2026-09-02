"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, User } from 'lucide-react'
import { format } from 'date-fns'

export default function ShopkeeperCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/customers')
        if (res.ok) {
           const data = await res.json()
           setCustomers(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile_number.includes(search)
  )

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900">Customers</h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search name or mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <Card key={customer.id} className="rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{customer.name}</h3>
                  <p className="text-gray-500 font-medium">{customer.mobile_number}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Orders</p>
                    <p className="font-bold text-gray-900 text-xl">{customer.total_orders}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</p>
                    <p className="font-bold text-gray-900 text-xl">₹{customer.total_spent}</p>
                 </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">Customer since {format(new Date(customer.created_at), 'MMM yyyy')}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
