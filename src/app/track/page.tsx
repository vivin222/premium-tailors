"use client"

import { useState } from 'react'
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

export default function TrackOrder() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customers(mobile_number)')
        .eq('display_id', orderId)
        .single()
        
      if (error || !data) {
        throw new Error('Order not found')
      }
      
      // @ts-ignore
      if (data.customers.mobile_number !== mobile) {
        throw new Error('Mobile number does not match this order')
      }
      
      router.push(`/orders/${data.id}`)
      
    } catch (err: any) {
      toast.error(err.message || 'Invalid details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Track Order</CardTitle>
            <CardDescription>Enter your Order ID and Mobile Number to track the real-time status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input 
                  id="orderId" 
                  placeholder="e.g. TAIL-2026-0042" 
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input 
                  id="mobile" 
                  type="tel"
                  placeholder="10-digit mobile number" 
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={loading || !orderId || mobile.length < 10}
              >
                {loading ? 'Searching...' : (
                  <>
                    <Search className="w-4 h-4 mr-2" /> Track Order
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
