"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function ShopkeeperSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
           const data = await res.json()
           setSettings(data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved successfully')
    } catch (error: any) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Shop Settings</h1>
      
      <Card className="rounded-3xl shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle>Business Hours & Booking Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Opening Time</label>
                <Input 
                  type="time" 
                  value={settings?.opening_time || ''} 
                  onChange={e => setSettings({...settings, opening_time: e.target.value})}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Closing Time</label>
                <Input 
                  type="time" 
                  value={settings?.closing_time || ''} 
                  onChange={e => setSettings({...settings, closing_time: e.target.value})}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Slot Duration (Minutes)</label>
                <Input 
                  type="number" 
                  value={settings?.slot_duration_minutes || ''} 
                  onChange={e => setSettings({...settings, slot_duration_minutes: parseInt(e.target.value)})}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Max Customers Per Slot</label>
                <Input 
                  type="number" 
                  value={settings?.max_customers_per_slot || ''} 
                  onChange={e => setSettings({...settings, max_customers_per_slot: parseInt(e.target.value)})}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Booking Deposit Amount (₹)</label>
                <Input 
                  type="number" 
                  value={settings?.booking_deposit_amount || ''} 
                  onChange={e => setSettings({...settings, booking_deposit_amount: parseFloat(e.target.value)})}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">UPI ID for Payments</label>
                <Input 
                  type="text" 
                  value={settings?.upi_id || ''} 
                  onChange={e => setSettings({...settings, upi_id: e.target.value})}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={saving} className="h-12 w-full md:w-auto bg-gray-900 text-white rounded-xl font-bold">
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
