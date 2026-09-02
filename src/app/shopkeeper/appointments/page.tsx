"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import toast from 'react-hot-toast'
import { format, addDays, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, Lock, Unlock } from 'lucide-react'

export default function ShopkeeperAppointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [settings, setSettings] = useState<any>(null)
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
    
    // Subscribe to block changes and appointments
    const sub1 = supabase.channel('apt-slots-blocked')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_slots' }, () => generateSlots(selectedDate, settings))
      .subscribe()
    const sub2 = supabase.channel('apt-slots-booked')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => generateSlots(selectedDate, settings))
      .subscribe()

    return () => {
      supabase.removeChannel(sub1)
      supabase.removeChannel(sub2)
    }
  }, [])

  useEffect(() => {
    if (settings) generateSlots(selectedDate, settings)
  }, [selectedDate])

  const fetchData = async () => {
    const { data: set } = await supabase.from('shop_settings').select('*').single()
    if (set) {
      setSettings(set)
      generateSlots(selectedDate, set)
    }
  }

  const generateSlots = async (date: Date, set: any) => {
    setLoading(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const [aptRes, blockRes] = await Promise.all([
      supabase.from('appointments').select('*, customers(name)').eq('appointment_date', dateStr).neq('status', 'Cancelled'),
      supabase.from('blocked_slots').select('*').eq('date', dateStr)
    ])
    
    const appointments = aptRes.data || []
    const blocked = blockRes.data || []

    const start = parseInt(set.opening_time.split(':')[0])
    const end = parseInt(set.closing_time.split(':')[0])
    const duration = set.slot_duration_minutes

    const generatedSlots = []
    let currentTime = new Date(date)
    currentTime.setHours(start, 0, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(end, 0, 0, 0)

    while (currentTime < endTime) {
      const timeStr = format(currentTime, 'HH:mm:00')
      const blockRecord = blocked.find(b => b.time === timeStr)
      const isBlocked = !!blockRecord
      
      const apts = appointments.filter(a => a.appointment_time === timeStr)
      
      generatedSlots.push({
        time: timeStr,
        isBlocked,
        blockId: blockRecord?.id,
        appointments: apts,
        capacity: set.max_customers_per_slot,
        booked: apts.length
      })
      
      currentTime = new Date(currentTime.getTime() + duration * 60000)
    }
    
    setSlots(generatedSlots)
    setLoading(false)
  }

  const toggleBlockSlot = async (slot: any) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    try {
      if (slot.isBlocked) {
        await supabase.from('blocked_slots').delete().eq('id', slot.blockId)
        toast.success('Slot unblocked')
      } else {
        await supabase.from('blocked_slots').insert({ date: dateStr, time: slot.time })
        toast.success('Slot blocked')
      }
      generateSlots(selectedDate, settings)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Appointments Manager</h1>
        
        <div className="flex items-center gap-2 bg-white border rounded-md p-1 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>-</Button>
          <div className="flex items-center gap-2 px-4 text-sm font-medium">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            {format(selectedDate, 'dd MMM yyyy')}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>+</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
           <div className="col-span-full text-center py-10 text-gray-500">Loading slots...</div>
        ) : slots.map((slot) => (
          <Card key={slot.time} className={`${slot.isBlocked ? 'bg-gray-50 border-dashed border-gray-300' : 'bg-white'}`}>
            <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-md font-bold">{slot.time.substring(0, 5)}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 px-2 ${slot.isBlocked ? 'text-blue-600' : 'text-gray-400 hover:text-red-600'}`}
                onClick={() => toggleBlockSlot(slot)}
              >
                {slot.isBlocked ? <><Unlock className="w-4 h-4 mr-1"/> Unblock</> : <><Lock className="w-4 h-4 mr-1"/> Block</>}
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {!slot.isBlocked && (
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Capacity: {slot.booked} / {slot.capacity}
                </div>
              )}
              
              {slot.isBlocked ? (
                <div className="text-center py-4 text-sm text-gray-500 italic">This slot is blocked manually.</div>
              ) : slot.appointments.length === 0 ? (
                <div className="text-center py-4 text-sm text-gray-400">No appointments</div>
              ) : (
                <div className="space-y-2">
                  {slot.appointments.map((apt: any) => (
                    <div key={apt.id} className="bg-gray-50 p-2 rounded text-sm border flex justify-between items-center">
                      <span className="font-medium truncate">{apt.customers?.name}</span>
                      <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{apt.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
