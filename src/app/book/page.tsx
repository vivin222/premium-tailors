"use client"

import { useState, useEffect } from 'react'
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { generateOrderId } from "@/lib/utils"
import { Plus, Trash2, Calendar as CalendarIcon, Clock, CheckCircle, ChevronRight, Scissors, User, CalendarDays, CreditCard, Sparkles } from "lucide-react"
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { format, addDays, parseISO, isSameDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 1 | 2 | 3 | 4 | 5

type ClothingItem = {
  id: string
  categoryId: string
  serviceId: string
  quantity: number
  requirements: string
  specialRequirements: string
}

export default function BookAppointment() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  
  // Data from DB
  const [categories, setCategories] = useState<any[]>([
    { id: '1', name: 'Saree Blouse' },
    { id: '2', name: 'Chudi' },
    { id: '3', name: 'Salwar Kameez' },
    { id: '4', name: 'Lehenga' }
  ])
  const [services, setServices] = useState<any[]>([
    { id: '1', name: 'New Stitching' },
    { id: '2', name: 'Alteration' },
    { id: '3', name: 'Embroidery' }
  ])
  const [settings, setSettings] = useState<any>({
    opening_time: '09:00:00',
    closing_time: '18:00:00',
    slot_duration_minutes: 30,
    max_customers_per_slot: 3,
    booking_deposit_amount: 50.00,
    upi_id: 'premiumtailors@upi'
  })
  
  // Form State
  const [customer, setCustomer] = useState({ name: '', mobile: '' })
  const [items, setItems] = useState<ClothingItem[]>([{
    id: '1', categoryId: '', serviceId: '', quantity: 1, requirements: '', specialRequirements: ''
  }])
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1))
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<{time: string, available: boolean}[]>([])
  const [orderInfo, setOrderInfo] = useState<any>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (settings && selectedDate) {
      generateSlots(selectedDate)
    }
  }, [selectedDate, settings])

  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      
      if (data.categories?.length > 0) setCategories(data.categories)
      if (data.services?.length > 0) setServices(data.services)
      if (data.settings) setSettings(data.settings)
    } catch (e) {
      console.log('Failed to fetch from backend')
    }
  }

  const generateSlots = async (date: Date) => {
    if (!settings) return
    const dateStr = format(date, 'yyyy-MM-dd')
    
    let appointments: any[] = []
    let blocked: any[] = []
    
    try {
      const res = await fetch(`/api/data?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        if (data.appointments) appointments = data.appointments
        if (data.blocked_slots) blocked = data.blocked_slots
      }
    } catch (e) {}

    const start = parseInt(settings.opening_time.split(':')[0]) || 9
    const end = parseInt(settings.closing_time.split(':')[0]) || 18
    const duration = settings.slot_duration_minutes || 30
    const maxPerSlot = settings.max_customers_per_slot || 3

    const slots = []
    let currentTime = new Date(date)
    currentTime.setHours(start, 0, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(end, 0, 0, 0)

    while (currentTime < endTime) {
      const timeStr = format(currentTime, 'HH:mm:00')
      const isBlocked = blocked.some(b => b.time === timeStr)
      const appointmentCount = appointments.filter(a => a.appointment_time === timeStr).length || 0
      const available = !isBlocked && appointmentCount < maxPerSlot
      
      slots.push({ time: timeStr, available })
      currentTime = new Date(currentTime.getTime() + duration * 60000)
    }
    
    setAvailableSlots(slots)
    setSelectedSlot('')
  }

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), categoryId: '', serviceId: '', quantity: 1, requirements: '', specialRequirements: '' }])
  }

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const submitBooking = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          selectedDate: format(selectedDate, 'yyyy-MM-dd'),
          selectedSlot,
          depositAmount: settings.booking_deposit_amount
        })
      })
      if (!res.ok) throw new Error('Failed to book')
      const order = await res.json()
      setOrderInfo(order)
      setStep(5)
      toast.success('Appointment booked successfully!')
    } catch (error: any) {
      console.error(error)
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, title: 'Details', icon: User },
    { num: 2, title: 'Clothes', icon: Scissors },
    { num: 3, title: 'Appointment', icon: CalendarDays },
    { num: 4, title: 'Deposit', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        
        <div className="text-center mb-12">
           <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Book Your Fitting</h1>
           <p className="text-gray-500 text-lg">Four simple steps to your perfect fit.</p>
        </div>

        {/* Premium Progress Bar */}
        {step < 5 && (
          <div className="mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gray-900 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
            <div className="relative z-10 flex justify-between">
              {steps.map((s, idx) => (
                <div key={s.num} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    step >= s.num ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 border border-gray-200'
                  }`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold mt-3 uppercase tracking-wider ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                  <p className="text-gray-500 mt-1">Let's start with the basics so we can contact you.</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">Full Name</Label>
                    <Input 
                      placeholder="e.g. Priya Sharma" 
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                      className="h-12 bg-gray-50/50 border-gray-200 text-lg rounded-xl focus-visible:ring-gray-900"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-700">Mobile Number</Label>
                    <Input 
                      type="tel"
                      placeholder="e.g. 9876543210" 
                      value={customer.mobile}
                      onChange={e => setCustomer({...customer, mobile: e.target.value})}
                      className="h-12 bg-gray-50/50 border-gray-200 text-lg rounded-xl focus-visible:ring-gray-900"
                    />
                  </div>
                  <div className="pt-6">
                    <Button 
                      className="w-full h-14 rounded-xl text-lg font-bold bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20" 
                      onClick={() => setStep(2)}
                      disabled={!customer.name || customer.mobile.length < 10}
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12 bg-gray-50/30">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Clothing Items</h2>
                    <p className="text-gray-500 mt-1">What do you need stitched or altered?</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        key={item.id} 
                        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group"
                      >
                        {items.length > 1 && (
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute -top-3 -right-3 bg-red-50 text-red-600 p-2 rounded-full border border-red-100 shadow-sm hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-bold text-sm">
                             {index + 1}
                           </div>
                           <h3 className="font-bold text-lg text-gray-900">Garment Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Category</Label>
                            <select 
                              className="w-full h-12 rounded-xl border-gray-200 bg-gray-50 px-4 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
                              value={item.categoryId}
                              onChange={e => updateItem(item.id, 'categoryId', e.target.value)}
                            >
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Quantity</Label>
                            <Input 
                              type="number" min="1" 
                              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Service Required</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                               {services.map(s => (
                                 <button
                                   key={s.id}
                                   onClick={() => updateItem(item.id, 'serviceId', s.id)}
                                   className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                     item.serviceId === s.id ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                   }`}
                                 >
                                    {s.name}
                                 </button>
                               ))}
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-700 font-semibold text-xs uppercase tracking-wider">Specific Requirements</Label>
                            <Input 
                              placeholder="e.g. Puff sleeves, deep round neck" 
                              value={item.requirements}
                              onChange={e => updateItem(item.id, 'requirements', e.target.value)}
                              className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <Button variant="outline" className="w-full h-14 rounded-xl border-dashed border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all" onClick={handleAddItem}>
                    <Plus className="h-5 w-5 mr-2" /> Add Another Item
                  </Button>

                  <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <Button variant="ghost" className="h-14 px-8 rounded-xl font-bold" onClick={() => setStep(1)}>Back</Button>
                    <Button 
                      className="flex-1 h-14 rounded-xl text-lg font-bold bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20" 
                      onClick={() => setStep(3)}
                      disabled={items.some(i => !i.categoryId || !i.serviceId)}
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Choose a Slot</h2>
                  <p className="text-gray-500 mt-1">Select a convenient time for your fitting and measurements.</p>
                </div>
                
                <div className="space-y-8">
                  
                  <div className="bg-gray-50 p-2 rounded-2xl flex items-center justify-between border border-gray-200">
                    <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} disabled={isSameDay(selectedDate, new Date())} className="p-3 text-gray-500 hover:bg-white rounded-xl hover:shadow-sm disabled:opacity-30 transition-all">
                      &larr; Prev
                    </button>
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      {format(selectedDate, 'EEEE, dd MMM yyyy')}
                    </div>
                    <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="p-3 text-gray-500 hover:bg-white rounded-xl hover:shadow-sm transition-all">
                      Next &rarr;
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Available Slots</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.length === 0 ? (
                        <div className="col-span-3 text-center py-8 text-gray-500 animate-pulse">Checking availability...</div>
                      ) : availableSlots.map(slot => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`relative py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden ${
                            selectedSlot === slot.time
                              ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                              : slot.available
                                ? 'bg-white hover:border-gray-900 text-gray-900 border-gray-200'
                                : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="text-lg font-bold">{slot.time.substring(0, 5)}</span>
                          <span className={`text-[10px] mt-1 font-bold uppercase tracking-widest ${selectedSlot === slot.time ? 'text-gray-300' : slot.available ? 'text-green-600' : 'text-red-500'}`}>
                            {slot.available ? (selectedSlot === slot.time ? 'Selected' : 'Available') : 'Full'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <Button variant="ghost" className="h-14 px-8 rounded-xl font-bold" onClick={() => setStep(2)}>Back</Button>
                    <Button 
                      className="flex-1 h-14 rounded-xl text-lg font-bold bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20" 
                      onClick={() => setStep(4)}
                      disabled={!selectedSlot}
                    >
                      Continue <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 md:p-12">
                <div className="text-center mb-8">
                   <div className="mx-auto bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full w-max mb-4 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Demo Mode
                   </div>
                   <h2 className="text-3xl font-bold text-gray-900">Confirm Appointment</h2>
                   <p className="text-gray-500 mt-2">A small deposit is required to reserve your slot.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white text-center relative overflow-hidden shadow-2xl shadow-gray-900/30">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-10 blur-xl"></div>
                    
                    <p className="text-gray-300 font-medium uppercase tracking-widest text-sm mb-2">Total Deposit</p>
                    <h3 className="text-6xl font-extrabold tracking-tighter mb-6">₹{settings?.booking_deposit_amount}</h3>
                    
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl mx-auto max-w-[200px] mb-4">
                       <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center p-2">
                          {/* Placeholder for QR - visual only */}
                          <div className="w-full h-full border-4 border-gray-900 rounded-lg border-dashed flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-xs">UPI QR</span>
                          </div>
                       </div>
                    </div>
                    <p className="font-mono text-gray-300 text-sm">{settings?.upi_id}</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button 
                      className="w-full h-16 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700 transition-all shadow-xl shadow-green-600/30 text-white" 
                      onClick={submitBooking}
                      disabled={loading}
                    >
                      {loading ? 'Confirming...' : 'I HAVE PAID ₹50'}
                    </Button>
                    <Button variant="ghost" className="h-14 rounded-xl font-bold text-gray-500" onClick={() => setStep(3)} disabled={loading}>
                       Cancel & Go Back
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && orderInfo && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 md:p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 text-lg mb-8">Your slot is reserved. We look forward to seeing you.</p>

                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 text-left mb-8 space-y-4">
                   <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-500 font-medium">Order ID</span>
                      <span className="font-bold text-gray-900 text-lg">{orderInfo.display_id}</span>
                   </div>
                   <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                      <span className="text-gray-500 font-medium">Date & Time</span>
                      <span className="font-bold text-gray-900 text-right">
                         {format(parseISO(orderInfo.appointment_date), 'dd MMM yyyy')}<br/>
                         {orderInfo.appointment_time.substring(0, 5)}
                      </span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Status</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                         {orderInfo.status}
                      </span>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 h-14 rounded-xl text-lg font-bold bg-gray-900 hover:bg-gray-800 transition-all shadow-lg" onClick={() => router.push(`/orders/${orderInfo.id}`)}>
                    View Order Details
                  </Button>
                  <Button variant="outline" className="flex-1 h-14 rounded-xl text-lg font-bold border-2 border-gray-200" onClick={() => router.push('/')}>
                    Back to Home
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
