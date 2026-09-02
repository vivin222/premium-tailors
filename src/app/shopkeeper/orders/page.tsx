"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Link from 'next/link'
import { format } from 'date-fns'
import { Search, Filter, ExternalLink, RefreshCw } from "lucide-react"

export default function ShopkeeperOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const TABS = ['All', 'New', 'In Progress', 'Ready for Pickup', 'Delivered']

  useEffect(() => {
    fetchOrders()

    // REAL-TIME SYNCHRONIZATION via Polling
    const interval = setInterval(() => {
      setIsSyncing(true)
      fetchOrders()
      setTimeout(() => setIsSyncing(false), 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.display_id.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.mobile_number?.includes(search)
    
    if (filterStatus === 'All') return matchesSearch
    if (filterStatus === 'New') return matchesSearch && (o.status === 'Appointment Booked' || o.status === 'Customer Arrived' || o.status === 'Measurements Taken' || o.status === 'Order Confirmed')
    return matchesSearch && o.status === filterStatus
  })

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full"></div></div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
           <div className="flex items-center gap-2 mt-2">
             <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
             <p className="text-sm font-medium text-gray-500">{isSyncing ? 'Syncing...' : 'Live Synced'}</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="h-12 rounded-xl font-bold"><Filter className="w-4 h-4 mr-2"/> Filters</Button>
           <Button className="h-12 rounded-xl bg-gray-900 text-white font-bold px-6 shadow-md shadow-gray-900/20">+ Walk-in Order</Button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-xl w-full lg:w-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                filterStatus === tab 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Search ID, Name, Mobile..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-gray-900 font-medium"
          />
        </div>
      </div>

      {/* Premium Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all border border-gray-100 flex flex-col">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
               <div>
                 <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                   {order.display_id}
                 </span>
                 <h3 className="text-xl font-bold text-gray-900">{order.customers?.name || 'Unknown'}</h3>
                 <p className="text-gray-500 font-medium text-sm mt-1">{order.customers?.mobile_number}</p>
               </div>
               <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center max-w-[120px] leading-tight shadow-sm ${
                 order.status === 'Ready for Pickup' ? 'bg-green-100 text-green-800 border border-green-200' :
                 order.status === 'Delivered' ? 'bg-gray-900 text-white' :
                 order.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                 'bg-yellow-50 text-yellow-800 border border-yellow-200'
               }`}>
                 {order.status}
               </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
               <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Appointment</p>
                  {order.appointments ? (
                     <p className="font-semibold text-gray-900 text-sm">
                       {format(new Date(order.appointments.appointment_date), 'dd MMM')} at {order.appointments.appointment_time.substring(0, 5)}
                     </p>
                  ) : (
                     <p className="font-semibold text-gray-900 text-sm">Walk-in</p>
                  )}
               </div>
               <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="font-bold text-gray-900 text-lg">₹{order.total_amount}</p>
               </div>
            </div>

            <Link href={`/shopkeeper/orders/${order.id}`}>
              <Button className="w-full h-12 rounded-xl font-bold bg-white text-gray-900 border-2 border-gray-200 hover:bg-gray-900 hover:border-gray-900 hover:text-white transition-all shadow-sm hover:shadow-md">
                Manage Order <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-gray-400" />
           </div>
           <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h3>
           <p className="text-gray-500 font-medium">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  )
}
