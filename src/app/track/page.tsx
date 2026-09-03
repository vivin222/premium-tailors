"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, MapPin } from 'lucide-react'

export default function TrackEntry() {
  const router = useRouter()
  const [trackingId, setTrackingId] = useState('')

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="py-6 px-8 bg-white border-b border-gray-200">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-medium mb-3">Track Your Order</h1>
          <p className="text-gray-500 text-sm mb-8">Enter the tracking ID provided during your booking to see live updates on your garment.</p>
          
          <form onSubmit={handleTrack} className="space-y-4">
            <input
              type="text"
              placeholder="e.g. BK-8A92F"
              value={trackingId}
              onChange={e => setTrackingId(e.target.value.toUpperCase())}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center font-mono text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-black uppercase transition placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400"
            />
            <button 
              type="submit"
              disabled={!trackingId}
              className="w-full flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-medium disabled:opacity-50 hover:bg-gray-800 transition"
            >
              <Search className="w-4 h-4" /> Track Order
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
