"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, Scissors, Shirt, MoveRight, User, Calendar, CircleDashed } from 'lucide-react'
import toast from 'react-hot-toast'

const SERVICES = [
  { id: 'suit', name: 'Custom Suit / Blazer', time: '14 Days', desc: 'Full bespoke tailoring for perfect fits.' },
  { id: 'shirt', name: 'Shirt Stitching', time: '5 Days', desc: 'Formal and casual shirts made to measure.' },
  { id: 'kurta', name: 'Kurta / Salwar', time: '7 Days', desc: 'Traditional wear expertly crafted.' },
  { id: 'alter', name: 'Alteration', time: '2 Days', desc: 'Hemming, tapering, and adjustments.' }
]

export default function BookingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '10:00 AM',
    name: '',
    phone: '',
    notes: ''
  })
  
  const [bookingId, setBookingId] = useState('')

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (res.ok) {
        setBookingId(data.bookingId)
        setStep(4) // Success step
      } else {
        toast.error(data.error || 'Failed to book appointment')
      }
    } catch (err) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
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
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {/* Progress Header */}
          {step < 4 && (
            <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-[family-name:var(--font-playfair)] font-medium tracking-wide">
                {step === 1 ? 'Select Service' : step === 2 ? 'Date & Time' : 'Your Details'}
              </h2>
              <div className="text-sm font-mono text-gray-400">STEP {step} OF 3</div>
            </div>
          )}

          <div className="p-8">
            {/* Step 1: Service */}
            {step === 1 && (
              <div className="space-y-4">
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFormData({ ...formData, service: s.name })}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      formData.service === s.name 
                      ? 'border-black bg-gray-50 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-lg">{s.name}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{s.time}</span>
                    </div>
                    <p className="text-gray-500 text-sm">{s.desc}</p>
                  </button>
                ))}
                
                <div className="pt-6 flex justify-end">
                  <button 
                    disabled={!formData.service}
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Drop-off Date</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Drop-off Time</label>
                  <select 
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  >
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>12:00 PM</option>
                    <option>02:00 PM</option>
                    <option>04:00 PM</option>
                    <option>06:00 PM</option>
                  </select>
                </div>
                
                <div className="pt-6 flex justify-between">
                  <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-medium hover:text-black">Back</button>
                  <button 
                    disabled={!formData.date}
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Mobile Number</label>
                  <input 
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Special Requests (Optional)</label>
                  <textarea 
                    rows={3}
                    placeholder="Need it slightly tapered..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
                  />
                </div>
                
                <div className="pt-6 flex justify-between items-center">
                  <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-medium hover:text-black">Back</button>
                  <button 
                    disabled={!formData.name || !formData.phone || isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                  >
                    {isSubmitting ? (
                      <><CircleDashed className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : (
                      <>Confirm Booking <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-[family-name:var(--font-playfair)] font-medium mb-2">Booking Confirmed</h2>
                  <p className="text-gray-500">Your appointment has been successfully scheduled.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 inline-block text-left w-full max-w-sm">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Your Tracking ID</p>
                  <p className="text-3xl font-mono font-bold tracking-tight text-gray-900">{bookingId}</p>
                </div>
                <div className="pt-4">
                  <Link href={`/track/${bookingId}`} className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition">
                    Track My Order <MoveRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
