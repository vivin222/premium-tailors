"use client"

import { useEffect, useState } from 'react'
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from 'qrcode.react'
import { format, parseISO } from 'date-fns'
import { MapPin, Calendar, Clock, CheckCircle2, Circle, Check } from "lucide-react"

const ORDER_STATUSES = [
  'Appointment Booked',
  'Customer Arrived',
  'Measurements Taken',
  'Order Confirmed',
  'In Progress',
  'Ready for Pickup',
  'Delivered'
]

export default function OrderTracking({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()

    // Real-time subscription
    const subscription = supabase
      .channel(`order-${params.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${params.id}`
      }, (payload) => {
        setOrder((prev: any) => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [params.id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          appointments(*),
          customers(*),
          order_items(
            *,
            categories(name),
            services(name),
            measurements(*)
          )
        `)
        .eq('id', params.id)
        .single()
        
      if (error) throw error
      setOrder(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  if (!order) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Order not found</div>

  const currentStatusIndex = ORDER_STATUSES.indexOf(order.status)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Main Info */}
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader className="pb-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">ORDER ID</p>
                    <CardTitle className="text-2xl">{order.display_id}</CardTitle>
                  </div>
                  <div className="text-right">
                     <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {order.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                
                {/* Progress Tracker */}
                <div className="mb-10 relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6 relative z-10">
                    {ORDER_STATUSES.map((status, index) => {
                      const isCompleted = index < currentStatusIndex
                      const isCurrent = index === currentStatusIndex
                      const isFuture = index > currentStatusIndex
                      
                      return (
                        <div key={status} className={`flex items-center gap-4 ${isFuture ? 'opacity-50' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCompleted ? 'bg-gray-900 text-white' : 
                            isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                            'bg-white border-2 border-gray-300 text-gray-400'
                          }`}>
                            {isCompleted ? <Check className="w-5 h-5" /> : (index + 1)}
                          </div>
                          <div className={isCurrent ? 'font-semibold text-gray-900' : 'text-gray-600 font-medium'}>
                            {status}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Appointment</p>
                    {order.appointments ? (
                       <p className="font-semibold text-gray-900">
                         {format(parseISO(order.appointments.appointment_date), 'dd MMM yyyy')} at {order.appointments.appointment_time.substring(0, 5)}
                       </p>
                    ) : (
                       <p className="font-semibold text-gray-900">Walk-in Order</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Delivery Date</p>
                    <p className="font-semibold text-gray-900">
                      {order.delivery_date ? format(parseISO(order.delivery_date), 'dd MMM yyyy') : 'To be confirmed'}
                    </p>
                  </div>
                </div>
                
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clothing Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-gray-900 text-lg">{item.categories?.name} <span className="text-gray-500 text-sm font-normal">x{item.quantity}</span></h4>
                       {item.unit_price > 0 && <span className="font-semibold">₹{item.unit_price}</span>}
                    </div>
                    <p className="text-sm text-gray-600 mb-1"><strong>Service:</strong> {item.services?.name}</p>
                    {item.requirements && <p className="text-sm text-gray-600 mb-1"><strong>Req:</strong> {item.requirements}</p>}
                    {item.special_requirements && <p className="text-sm text-gray-600 mb-3"><strong>Special:</strong> {item.special_requirements}</p>}
                    
                    {item.measurements && item.measurements.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Measurements</p>
                        <div className="flex flex-wrap gap-2">
                          {item.measurements.map((m: any) => (
                            <span key={m.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                              {m.name}: {m.value}{m.unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:w-80 space-y-6">
            
            <Card className="text-center">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm text-gray-500 uppercase tracking-wider">Order QR</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-xl border shadow-sm mb-4">
                  <QRCodeSVG value={order.qr_token} size={150} />
                </div>
                <p className="text-xs text-gray-500 max-w-[200px]">Show this QR code at the shop for quick access.</p>
              </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-600">Total Amount</span>
                     <span className="font-semibold">₹{order.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-600">Deposit Paid</span>
                     <span className="text-green-600 font-medium">- ₹{order.deposit_amount}</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between font-bold text-gray-900">
                     <span>Balance Due</span>
                     <span>₹{Math.max(0, order.total_amount - order.deposit_amount)}</span>
                  </div>
               </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  )
}
