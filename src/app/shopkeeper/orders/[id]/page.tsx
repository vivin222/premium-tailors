"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ArrowLeft, Save, Truck, User, Calendar, Scissors, IndianRupee } from 'lucide-react'
import Link from 'next/link'

export default function ShopkeeperOrderDetails({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [measurements, setMeasurements] = useState<Record<string, any[]>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setDeliveryDate(data.delivery_date || '')
        
        const measState: Record<string, any[]> = {}
        const priceState: Record<string, number> = {}
        
        data.order_items.forEach((item: any) => {
          measState[item.id] = item.measurements || []
          priceState[item.id] = item.unit_price || 0
        })
        
        setMeasurements(measState)
        setPrices(priceState)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed')
      setOrder({ ...order, status: newStatus })
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const savePrices = async () => {
    try {
      for (const [itemId, price] of Object.entries(prices)) {
        await fetch(`/api/order-items/${itemId}`, {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ unit_price: price })
        })
      }
      toast.success('Prices updated')
      fetchOrderDetails() // Refresh to get new total
    } catch (error) {
      toast.error('Failed to update prices')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!order) return <div>Order not found</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
       <div className="flex items-center justify-between">
         <Link href="/shopkeeper/orders" className="text-gray-500 hover:text-gray-900 flex items-center font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Orders
         </Link>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left Column - Main Details */}
         <div className="md:col-span-2 space-y-6">
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
               <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 font-bold tracking-widest text-xs uppercase mb-1">Order ID</p>
                    <h1 className="text-3xl font-extrabold">{order.display_id}</h1>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center max-w-[120px] leading-tight shadow-sm ${
                    order.status === 'Ready for Pickup' ? 'bg-green-500 text-white' :
                    order.status === 'Delivered' ? 'bg-gray-700 text-white' :
                    order.status === 'In Progress' ? 'bg-blue-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {order.status}
                  </span>
               </div>
               <CardContent className="p-0 divide-y divide-gray-100">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                           <h3 className="text-lg font-bold text-gray-900">{item.services.name} - {item.categories.name}</h3>
                           <p className="text-sm text-gray-500 font-medium">Quantity: {item.quantity}</p>
                           {item.requirements && <p className="text-sm mt-2 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100"><strong className="text-gray-900">Notes:</strong> {item.requirements}</p>}
                        </div>
                        <div className="text-right">
                           <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Unit Price (₹)</label>
                           <Input 
                             type="number"
                             value={prices[item.id] || ''}
                             onChange={(e) => setPrices({...prices, [item.id]: Number(e.target.value)})}
                             className="w-32 h-10 font-bold text-right"
                           />
                        </div>
                      </div>
                    </div>
                  ))}
               </CardContent>
            </Card>
            
            <div className="flex justify-end">
               <Button onClick={savePrices} className="bg-gray-900 text-white rounded-xl font-bold px-8 h-12 shadow-md">
                 <Save className="w-4 h-4 mr-2" /> Save Pricing & Updates
               </Button>
            </div>
         </div>

         {/* Right Column - Status & Customer */}
         <div className="space-y-6">
            <Card className="rounded-3xl border-gray-100 shadow-sm">
               <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs flex items-center"><User className="w-4 h-4 mr-2" /> Customer Info</h3>
                  <p className="font-bold text-lg">{order.customers.name}</p>
                  <p className="text-gray-500 font-medium mb-6">{order.customers.mobile_number}</p>

                  <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs flex items-center mt-6"><Calendar className="w-4 h-4 mr-2" /> Appointment</h3>
                  {order.appointments ? (
                     <p className="font-bold text-gray-700">{format(new Date(order.appointments.appointment_date), 'dd MMM yyyy')} @ {order.appointments.appointment_time}</p>
                  ) : <p className="text-gray-500 font-medium">Walk-in Order</p>}
               </CardContent>
            </Card>

            <Card className="rounded-3xl border-gray-100 shadow-sm">
               <CardContent className="p-6 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">Update Status</h3>
                  <Button onClick={() => updateStatus('Measurements Taken')} disabled={updating} variant="outline" className="w-full justify-start rounded-xl h-12 font-bold hover:bg-gray-50">Measurements Taken</Button>
                  <Button onClick={() => updateStatus('In Progress')} disabled={updating} variant="outline" className="w-full justify-start rounded-xl h-12 font-bold hover:bg-blue-50 hover:text-blue-700">In Progress (Stitching)</Button>
                  <Button onClick={() => updateStatus('Ready for Pickup')} disabled={updating} variant="outline" className="w-full justify-start rounded-xl h-12 font-bold hover:bg-green-50 hover:text-green-700">Ready for Pickup</Button>
                  <Button onClick={() => updateStatus('Delivered')} disabled={updating} className="w-full justify-start rounded-xl h-12 font-bold bg-gray-900 text-white">Delivered / Completed</Button>
               </CardContent>
            </Card>
         </div>
       </div>
    </div>
  )
}
