"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { format } from 'date-fns'
import { Calendar, ShoppingBag, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ShopkeeperDashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    newOrders: 0,
    inProgress: 0,
    ready: 0,
    todayRevenue: 0
  })

  useEffect(() => {
    fetchStats()
    
    // Subscribe to changes
    const ordersSub = supabase.channel('dashboard-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe()
      
    const aptSub = supabase.channel('dashboard-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchStats)
      .subscribe()

    return () => {
      supabase.removeChannel(ordersSub)
      supabase.removeChannel(aptSub)
    }
  }, [])

  const fetchStats = async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    
    const [aptRes, ordRes] = await Promise.all([
      supabase.from('appointments').select('*').eq('appointment_date', today),
      supabase.from('orders').select('*')
    ])

    const appointments = aptRes.data || []
    const orders = ordRes.data || []
    
    let todayRevenue = 0
    orders.forEach(o => {
      if (o.created_at.startsWith(today)) {
        todayRevenue += (o.deposit_amount || 0)
      }
    })

    setStats({
      todayAppointments: appointments.length,
      newOrders: orders.filter(o => o.status === 'Appointment Booked' || o.status === 'Order Confirmed').length,
      inProgress: orders.filter(o => o.status === 'In Progress').length,
      ready: orders.filter(o => o.status === 'Ready for Pickup').length,
      todayRevenue
    })
  }

  const statCards = [
    { name: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "New Orders", value: stats.newOrders, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-100" },
    { name: "In Progress", value: stats.inProgress, icon: Clock, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Ready for Pickup", value: stats.ready, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.name}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{item.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
            <CardHeader>
               <CardTitle>Today's Overview</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="bg-gray-50 p-6 rounded-xl text-center border">
                  <p className="text-gray-500 mb-1">Today's Revenue (Deposits)</p>
                  <p className="text-4xl font-bold text-gray-900">₹{stats.todayRevenue}</p>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 gap-4">
                  <Link href="/shopkeeper/orders">
                     <div className="bg-white border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <ShoppingBag className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <span className="font-medium text-gray-900">Manage Orders</span>
                     </div>
                  </Link>
                  <Link href="/shopkeeper/appointments">
                     <div className="bg-white border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <span className="font-medium text-gray-900">Appointments</span>
                     </div>
                  </Link>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
