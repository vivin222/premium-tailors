"use client"

import { useEffect, useState } from 'react'
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from 'qrcode.react'
import { format, parseISO } from 'date-fns'
import { MapPin, Calendar, Clock, CheckCircle2, Circle, Check, Scissors, Download, Printer } from "lucide-react"

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

    const interval = setInterval(() => {
       fetchOrder()
    }, 5000)

    return () => clearInterval(interval)
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (err) {} finally { setLoading(false) }
  }

  if (loading) return (
     <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500 font-medium">Loading your order...</p>
        </div>
     </div>
  )
  
  if (!order) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Order not found</div>

  const currentStatusIndex = ORDER_STATUSES.indexOf(order.status)
  
  const handlePrint = () => {
     window.print()
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-10">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Info - Timeline */}
          <div className="flex-1 space-y-8 print:w-full">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/40 border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 pb-6 border-b border-gray-100">
                 <div>
                   <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Order Tracking</p>
                   <h1 className="text-3xl font-extrabold text-gray-900">{order.display_id}</h1>
                 </div>
                 <div className="mt-4 sm:mt-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {order.status}
                    </span>
                 </div>
              </div>
              
              {/* Premium Progress Tracker */}
              <div className="relative pl-4 md:pl-8 mb-10 print:hidden">
                <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-1 bg-gray-100 rounded-full"></div>
                <div className="absolute left-[27px] md:left-[43px] top-4 w-1 bg-gray-900 rounded-full transition-all duration-1000" style={{ height: `${(Math.max(0, currentStatusIndex) / (ORDER_STATUSES.length - 1)) * 100}%` }}></div>
                
                <div className="space-y-10 relative z-10">
                  {ORDER_STATUSES.map((status, index) => {
                    const isCompleted = index < currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    const isFuture = index > currentStatusIndex
                    
                    return (
                      <div key={status} className={`flex items-center gap-6 ${isFuture ? 'opacity-40' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center transition-all duration-500 ${
                          isCompleted ? 'bg-gray-900 text-white shadow-md' : 
                          isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' : 
                          'bg-white border-2 border-gray-300 text-gray-400'
                        }`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-bold">{index + 1}</span>}
                        </div>
                        <div>
                           <h3 className={`text-lg transition-all ${isCurrent ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                             {status}
                           </h3>
                           {isCurrent && <p className="text-sm text-blue-600 font-medium mt-1">Current Status</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                       <Calendar className="w-5 h-5 text-gray-400" />
                       <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Appointment</p>
                    </div>
                    {order.appointments ? (
                       <p className="font-bold text-gray-900 text-lg">
                         {format(parseISO(order.appointments.appointment_date), 'dd MMM yyyy')} <br/>
                         <span className="text-gray-500 font-medium">{order.appointments.appointment_time.substring(0, 5)}</span>
                       </p>
                    ) : (
                       <p className="font-bold text-gray-900">Walk-in</p>
                    )}
                 </div>
                 
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                       <Clock className="w-5 h-5 text-gray-400" />
                       <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Delivery</p>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {order.delivery_date ? format(parseISO(order.delivery_date), 'dd MMM yyyy') : 'To be confirmed'}
                    </p>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/40 border border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 mb-6">Garment Details</h2>
               <div className="space-y-6">
                 {order.order_items?.map((item: any, idx: number) => (
                   <div key={item.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 relative">
                     <div className="absolute top-6 right-6 font-bold text-gray-900 text-lg">
                        {item.unit_price > 0 ? `₹${item.unit_price}` : 'TBD'}
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-1">{item.categories?.name} <span className="text-gray-400 font-medium text-sm ml-2">Qty: {item.quantity}</span></h3>
                     <p className="text-gray-600 font-medium">{item.services?.name}</p>
                     
                     {(item.requirements || item.special_requirements) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                           {item.requirements && <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Req:</span> {item.requirements}</p>}
                           {item.special_requirements && <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Special:</span> {item.special_requirements}</p>}
                        </div>
                     )}

                     {item.measurements && item.measurements.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Measurements</p>
                           <div className="flex flex-wrap gap-2">
                              {item.measurements.map((m: any) => (
                                <span key={m.id} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                                   <span className="text-gray-400 mr-1">{m.name}:</span> {m.value}{m.unit}
                                </span>
                              ))}
                           </div>
                        </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Sidebar - Receipt & QR */}
          <div className="w-full lg:w-96 space-y-8">
            
            <div className="bg-gray-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden print:hidden">
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl"></div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Fast Track QR</h3>
               <div className="bg-white p-4 rounded-2xl mx-auto w-max mb-6">
                  <QRCodeSVG value={order.qr_token} size={160} />
               </div>
               <p className="text-center text-sm text-gray-300 font-medium">
                 Show this QR code at the counter for instant access to your profile.
               </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/40 border border-gray-100">
               <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>
               
               <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600 font-medium">
                     <span>Subtotal</span>
                     <span className="text-gray-900">₹{order.total_amount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                     <span>Deposit Paid</span>
                     <span className="text-green-600 font-bold">- ₹{order.deposit_amount}</span>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-8">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">Balance</span>
                  <span className="text-3xl font-extrabold text-gray-900">₹{Math.max(0, order.total_amount - order.deposit_amount)}</span>
               </div>

               <div className="flex gap-3 print:hidden">
                  <Button onClick={handlePrint} variant="outline" className="flex-1 h-12 rounded-xl font-bold">
                     <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
               </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
