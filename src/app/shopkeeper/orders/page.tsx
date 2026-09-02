"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import Link from 'next/link'
import { Search, Eye } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function ShopkeeperOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchOrders()
    const sub = supabase.channel('orders-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, customers(name, mobile_number)')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
  }

  const filteredOrders = orders.filter(o => {
    const matchSearch = 
      o.display_id.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.mobile_number.includes(search)
      
    const matchFilter = filter === 'All' || o.status === filter
    
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
           <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                 <Input 
                   placeholder="Search by ID, Customer Name, or Mobile..." 
                   className="pl-9"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
              <select 
                className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                 <option value="All">All Statuses</option>
                 <option value="Appointment Booked">Appointment Booked</option>
                 <option value="Customer Arrived">Customer Arrived</option>
                 <option value="In Progress">In Progress</option>
                 <option value="Ready for Pickup">Ready for Pickup</option>
                 <option value="Delivered">Delivered</option>
              </select>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                ) : filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.display_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.customers?.name}</div>
                      <div className="text-gray-500">{order.customers?.mobile_number}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(parseISO(order.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/shopkeeper/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
