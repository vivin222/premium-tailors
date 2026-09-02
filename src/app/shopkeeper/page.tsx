"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Clock, CheckCircle2, TrendingUp, Users, ShoppingBag, BellRing, Package, RefreshCw } from "lucide-react"
import { format } from 'date-fns'

export default function ShopkeeperDashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    newOrders: 0,
    inProgress: 0,
    readyForPickup: 0,
    todayRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    fetchDashboardData()

    // REAL-TIME SYNCHRONIZATION via polling
    const interval = setInterval(() => {
        setIsSyncing(true)
        fetchDashboardData()
        setTimeout(() => setIsSyncing(false), 500)
    }, 5000)
      
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
         const allOrders = await res.json()
         
         const today = format(new Date(), 'yyyy-MM-dd')
         const todayOrders = allOrders.filter((o: any) => o.created_at?.startsWith(today))
         
         setStats({
           todayAppointments: allOrders.filter((o: any) => o.appointments?.appointment_date === today).length,
           newOrders: allOrders.filter((o: any) => o.status === 'Appointment Booked' || o.status === 'Order Confirmed').length,
           inProgress: allOrders.filter((o: any) => o.status === 'In Progress' || o.status === 'Measurements Taken').length,
           readyForPickup: allOrders.filter((o: any) => o.status === 'Ready for Pickup').length,
           todayRevenue: todayOrders.reduce((sum: number, o: any) => sum + (o.deposit_amount || 0), 0)
         })

         setRecentOrders(allOrders.slice(0, 5))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
       <div className="animate-spin w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full"></div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
           <p className="text-gray-500 font-medium mt-1">Real-time shop operations and metrics.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100 shadow-inner">
           {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
           {isSyncing ? 'Syncing...' : 'Live System Active'}
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-gray-900"><ShoppingBag className="w-16 h-16" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">New Orders</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-gray-900">{stats.newOrders}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-blue-600"><Clock className="w-16 h-16" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-blue-500 uppercase tracking-wider">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-green-50 border-green-100">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-green-700"><Package className="w-16 h-16" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-green-700 uppercase tracking-wider">Ready for Pickup</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-green-700">{stats.readyForPickup}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-gray-900"><Users className="w-16 h-16" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-wider">Appointments Today</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-gray-900">{stats.todayAppointments}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-gray-900 text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16" /></div>
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-wider">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold">₹{stats.todayRevenue}</div>
          </CardContent>
        </Card>

      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BellRing className="w-5 h-5" /> Recent Activity</h2>
         </div>
         <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
               <div className="p-8 text-center text-gray-500 font-medium">No recent orders found.</div>
            ) : recentOrders.map(order => (
               <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className={`w-3 h-3 rounded-full ${order.status === 'Ready for Pickup' ? 'bg-green-500' : order.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                     <div>
                        <p className="font-bold text-gray-900">{order.display_id}</p>
                        <p className="text-sm text-gray-500">{order.customers?.name || 'Unknown Customer'}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                        {order.status}
                     </span>
                     <p className="text-xs text-gray-400 mt-2">{format(new Date(order.created_at), 'hh:mm a')}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  )
}
