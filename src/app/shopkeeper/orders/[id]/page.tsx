"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import toast from 'react-hot-toast'
import { Check, Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const STATUSES = [
  'Appointment Booked',
  'Customer Arrived',
  'Measurements Taken',
  'Order Confirmed',
  'In Progress',
  'Ready for Pickup',
  'Delivered'
]

const COMMON_MEASUREMENTS = ['Waist', 'Chest', 'Shoulder', 'Sleeve', 'Length', 'Neck']

export default function ShopkeeperOrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // State for measurements and pricing
  const [measurements, setMeasurements] = useState<Record<string, any[]>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [deliveryDate, setDeliveryDate] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    setLoading(true)
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
      
    if (data) {
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
    setLoading(false)
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', params.id)
        
      if (error) throw error
      setOrder({ ...order, status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleAddMeasurement = (itemId: string, name: string) => {
    const current = measurements[itemId] || []
    if (current.find(m => m.name === name)) return
    
    setMeasurements({
      ...measurements,
      [itemId]: [...current, { id: 'temp_' + Math.random(), order_item_id: itemId, name, value: '', unit: 'in' }]
    })
  }

  const handleUpdateMeasurement = (itemId: string, measId: string, field: string, value: string) => {
    const current = measurements[itemId] || []
    setMeasurements({
      ...measurements,
      [itemId]: current.map(m => m.id === measId ? { ...m, [field]: value } : m)
    })
  }

  const handleRemoveMeasurement = async (itemId: string, measId: string) => {
    if (!measId.startsWith('temp_')) {
      await supabase.from('measurements').delete().eq('id', measId)
    }
    const current = measurements[itemId] || []
    setMeasurements({
      ...measurements,
      [itemId]: current.filter(m => m.id !== measId)
    })
  }

  const saveOrderDetails = async () => {
    try {
      // 1. Save all measurements
      for (const itemId of Object.keys(measurements)) {
        for (const m of measurements[itemId]) {
          if (m.id.startsWith('temp_')) {
            await supabase.from('measurements').insert({
              order_item_id: m.order_item_id,
              name: m.name,
              value: m.value,
              unit: m.unit
            })
          } else {
            await supabase.from('measurements').update({
              value: m.value,
              unit: m.unit
            }).eq('id', m.id)
          }
        }
      }

      // 2. Save prices and calculate total
      let total = 0
      for (const item of order.order_items) {
        const unitPrice = prices[item.id] || 0
        total += (unitPrice * item.quantity)
        
        await supabase.from('order_items').update({
          unit_price: unitPrice
        }).eq('id', item.id)
      }

      // 3. Save order total and delivery date
      await supabase.from('orders').update({
        total_amount: total,
        delivery_date: deliveryDate || null
      }).eq('id', order.id)

      toast.success('Order details saved successfully!')
      fetchOrder()
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message)
    }
  }

  if (loading || !order) return <div className="p-6">Loading...</div>

  const currentStatusIndex = STATUSES.indexOf(order.status)
  
  let calculatedTotal = 0
  order.order_items.forEach((item: any) => {
    calculatedTotal += (prices[item.id] || 0) * item.quantity
  })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/shopkeeper/orders" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Order {order.display_id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Actions & Details */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {STATUSES.map((status, index) => {
                const isActive = status === order.status
                const isCompleted = index < currentStatusIndex
                return (
                  <Button 
                    key={status}
                    variant={isActive ? 'default' : isCompleted ? 'outline' : 'ghost'}
                    className={`w-full justify-start ${isActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''} ${isCompleted ? 'border-green-200 text-green-700 bg-green-50/50' : 'text-gray-500'}`}
                    onClick={() => updateStatus(status)}
                  >
                    {isCompleted && <Check className="w-4 h-4 mr-2" />}
                    {!isCompleted && <div className="w-4 h-4 mr-2 border rounded-full" />}
                    {status}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="font-semibold">Name:</span> {order.customers?.name}</p>
              <p><span className="font-semibold">Mobile:</span> {order.customers?.mobile_number}</p>
              {order.appointments && (
                <>
                  <p className="mt-4"><span className="font-semibold">Appointment:</span></p>
                  <p>{order.appointments.appointment_date} at {order.appointments.appointment_time}</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
               <div className="flex justify-between">
                 <span className="text-gray-500">Total Items:</span>
                 <span className="font-medium">{order.order_items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500">Deposit Paid:</span>
                 <span className="font-medium text-green-600">₹{order.deposit_amount}</span>
               </div>
               <div className="flex justify-between text-lg font-bold pt-2 border-t">
                 <span>Final Total:</span>
                 <span>₹{calculatedTotal}</span>
               </div>
               <div className="flex justify-between text-md font-bold text-red-600">
                 <span>Balance Due:</span>
                 <span>₹{Math.max(0, calculatedTotal - order.deposit_amount)}</span>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Items, Measurements, Pricing */}
        <div className="md:col-span-2 space-y-6">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Items & Measurements</CardTitle>
                <Button onClick={saveOrderDetails} className="bg-green-600 hover:bg-green-700 text-white">Save Changes</Button>
             </CardHeader>
             <CardContent className="space-y-8">
               
               {order.order_items.map((item: any, index: number) => (
                 <div key={item.id} className="border rounded-xl p-5 bg-gray-50/50">
                   <div className="flex justify-between items-start mb-4 pb-4 border-b">
                     <div>
                       <h3 className="text-lg font-bold text-gray-900">{item.categories?.name}</h3>
                       <p className="text-sm text-gray-600">Service: {item.services?.name} | Qty: {item.quantity}</p>
                       {item.requirements && <p className="text-sm text-gray-500 mt-1">Req: {item.requirements}</p>}
                       {item.special_requirements && <p className="text-sm text-amber-600 mt-1">Special: {item.special_requirements}</p>}
                     </div>
                     <div className="text-right space-y-2">
                        <Label>Unit Price (₹)</Label>
                        <Input 
                          type="number" 
                          className="w-24 text-right font-bold" 
                          value={prices[item.id] || ''}
                          onChange={e => setPrices({...prices, [item.id]: parseFloat(e.target.value) || 0})}
                        />
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-gray-700">Measurements</h4>
                        <div className="flex gap-2">
                          <select 
                            className="text-xs border rounded px-2 py-1"
                            onChange={e => {
                               if (e.target.value) {
                                  handleAddMeasurement(item.id, e.target.value)
                                  e.target.value = ""
                               }
                            }}
                          >
                             <option value="">+ Quick Add</option>
                             {COMMON_MEASUREMENTS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <Button variant="outline" size="sm" onClick={() => handleAddMeasurement(item.id, 'Custom')}>
                             <Plus className="w-3 h-3 mr-1"/> Custom
                          </Button>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {(measurements[item.id] || []).map((meas: any) => (
                         <div key={meas.id} className="flex items-center gap-2 bg-white p-2 border rounded-md shadow-sm">
                           <Input 
                             value={meas.name}
                             onChange={e => handleUpdateMeasurement(item.id, meas.id, 'name', e.target.value)}
                             className="h-8 text-xs font-medium w-24 border-0 bg-transparent p-1 focus-visible:ring-0"
                             placeholder="Name"
                           />
                           <Input 
                             value={meas.value}
                             onChange={e => handleUpdateMeasurement(item.id, meas.id, 'value', e.target.value)}
                             className="h-8 text-xs w-16 px-2"
                             placeholder="Value"
                           />
                           <select 
                             value={meas.unit}
                             onChange={e => handleUpdateMeasurement(item.id, meas.id, 'unit', e.target.value)}
                             className="h-8 text-xs border rounded bg-transparent px-1"
                           >
                             <option value="in">in</option>
                             <option value="cm">cm</option>
                           </select>
                           <button onClick={() => handleRemoveMeasurement(item.id, meas.id)} className="text-red-400 hover:text-red-600 p-1">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       ))}
                       {(measurements[item.id] || []).length === 0 && (
                          <div className="col-span-2 text-sm text-gray-400 py-2">No measurements added yet.</div>
                       )}
                     </div>
                   </div>
                 </div>
               ))}

               <div className="pt-6 border-t">
                  <div className="max-w-xs">
                    <Label className="mb-2 block text-gray-700 font-semibold">Expected Delivery Date</Label>
                    <Input 
                      type="date" 
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                      className="font-medium"
                    />
                  </div>
               </div>

             </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
