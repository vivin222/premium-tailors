"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import toast from 'react-hot-toast'

export default function ShopkeeperSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase.from('shop_settings').select('*').single()
    if (data) setSettings(data)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('shop_settings')
        .update({
          shop_name: settings.shop_name,
          contact_number: settings.contact_number,
          opening_time: settings.opening_time,
          closing_time: settings.closing_time,
          slot_duration_minutes: settings.slot_duration_minutes,
          max_customers_per_slot: settings.max_customers_per_slot,
          booking_deposit_amount: settings.booking_deposit_amount,
          upi_id: settings.upi_id,
          cancellation_rules: settings.cancellation_rules
        })
        .eq('id', 1)
        
      if (error) throw error
      toast.success('Settings saved successfully')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!settings) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Shop Name</Label>
            <Input value={settings.shop_name} onChange={e => setSettings({...settings, shop_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input value={settings.contact_number} onChange={e => setSettings({...settings, contact_number: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Rules</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Opening Time</Label>
            <Input type="time" value={settings.opening_time} onChange={e => setSettings({...settings, opening_time: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Closing Time</Label>
            <Input type="time" value={settings.closing_time} onChange={e => setSettings({...settings, closing_time: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Slot Duration (minutes)</Label>
            <Input type="number" value={settings.slot_duration_minutes} onChange={e => setSettings({...settings, slot_duration_minutes: parseInt(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>Max Customers Per Slot</Label>
            <Input type="number" value={settings.max_customers_per_slot} onChange={e => setSettings({...settings, max_customers_per_slot: parseInt(e.target.value)})} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment & Deposit</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Booking Deposit Amount (₹)</Label>
            <Input type="number" value={settings.booking_deposit_amount} onChange={e => setSettings({...settings, booking_deposit_amount: parseFloat(e.target.value)})} />
          </div>
          <div className="space-y-2">
            <Label>UPI ID</Label>
            <Input value={settings.upi_id} onChange={e => setSettings({...settings, upi_id: e.target.value})} />
          </div>
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <Label>Cancellation & Refund Rules</Label>
            <Input value={settings.cancellation_rules || ''} onChange={e => setSettings({...settings, cancellation_rules: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
