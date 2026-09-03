"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, MoveRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const SERVICES = [
  { id: 'suit', name: 'Custom Suit / Blazer', time: 'Approx. 14 Days', desc: 'Full bespoke tailoring for perfect fits. Ideal for weddings, formal events, and business wear.' },
  { id: 'shirt', name: 'Shirt Tailoring', time: 'Approx. 5 Days', desc: 'Formal and casual shirts made to measure. Choose your collar, cuffs, and fit.' },
  { id: 'trouser', name: 'Trouser Tailoring', time: 'Approx. 7 Days', desc: 'Perfectly draped trousers, chinos, or formal pants custom stitched to your measurements.' },
  { id: 'kurta', name: 'Traditional / Kurta', time: 'Approx. 7 Days', desc: 'Traditional wear expertly crafted for a comfortable and elegant silhouette.' },
  { id: 'alter', name: 'Alterations & Adjustments', time: 'Approx. 2-3 Days', desc: 'Hemming, tapering, resizing, and general repairs to breathe new life into your existing garments.' }
]

const TIME_SLOTS = [
  "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM",
  "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
]

export default function BookingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: ''
  })
  const [bookingId, setBookingId] = useState('')

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())

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
        setStep(4)
      } else {
        toast.error(data.error || 'Failed to book appointment')
      }
    } catch (err) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { days, firstDay, year, month }
  }

  const { days, firstDay, year, month } = getDaysInMonth(currentMonth)
  
  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="py-6 px-8 bg-white border-b border-gray-200">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 py-12">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          
          {step < 4 && (
            <div className="bg-black px-6 md:px-10 py-8 text-white flex justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-[family-name:var(--font-playfair)] font-medium tracking-wide">
                {step === 1 ? 'Select a Service' : step === 2 ? 'Schedule Drop-off' : 'Your Details'}
              </h2>
              <div className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">STEP {step} OF 3</div>
            </div>
          )}

          <div className="p-6 md:p-10">
            {/* STEP 1: SERVICE */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SERVICES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setFormData({ ...formData, service: s.name })}
                      className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                        formData.service === s.name 
                        ? 'border-black bg-gray-50 shadow-sm' 
                        : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{s.name}</h3>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">{s.time}</span>
                      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                    </button>
                  ))}
                </div>
                
                <div className="pt-8 flex justify-end border-t border-gray-100">
                  <button 
                    disabled={!formData.service}
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Custom Calendar */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
                      <CalendarIcon className="w-4 h-4" /> Select Date
                    </h3>
                    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-lg text-gray-900">
                          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex gap-2">
                          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft className="w-5 h-5" /></button>
                          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                          <div key={d} className="text-xs font-bold text-gray-400 py-2">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: days }).map((_, i) => {
                          const dateNum = i + 1
                          const dateObj = new Date(year, month, dateNum)
                          const dateString = `\${year}-\${String(month + 1).padStart(2, '0')}-\${String(dateNum).padStart(2, '0')}`
                          const isPast = dateObj < today
                          const isSelected = formData.date === dateString

                          return (
                            <button
                              key={dateNum}
                              disabled={isPast}
                              onClick={() => setFormData({ ...formData, date: dateString })}
                              className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                                isSelected 
                                ? 'bg-black text-white shadow-md' 
                                : isPast 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {dateNum}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Custom Time Slots */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
                      <Clock className="w-4 h-4" /> Available Times
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {TIME_SLOTS.map(time => {
                        const isSelected = formData.time === time
                        return (
                          <button
                            key={time}
                            onClick={() => setFormData({ ...formData, time })}
                            className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                              isSelected
                              ? 'border-black bg-black text-white shadow-md'
                              : 'border-gray-100 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {time}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 flex justify-between items-center border-t border-gray-100">
                  <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-bold hover:text-black transition">BACK</button>
                  <button 
                    disabled={!formData.date || !formData.time}
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <div className="space-y-8 max-w-lg mx-auto">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Appointment Summary</h4>
                  <p className="font-bold text-gray-900 mb-1">{formData.service}</p>
                  <p className="text-gray-600 font-medium">
                    {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formData.time}
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-widest">Special Requirements (Optional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Provide any specific styling or fitting notes..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                    />
                  </div>
                </div>
                
                <div className="pt-8 flex justify-between items-center border-t border-gray-100">
                  <button onClick={handleBack} className="px-6 py-3 text-gray-500 font-bold hover:text-black transition">BACK</button>
                  <button 
                    disabled={!formData.name || !formData.phone || isSubmitting}
                    onClick={handleSubmit}
                    className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition shadow-lg shadow-black/10"
                  >
                    {isSubmitting ? (
                      <><CircleDashed className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <>Confirm Booking <CheckCircle2 className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
              <div className="text-center py-12 px-4 space-y-8">
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border-[8px] border-green-100/50">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <h2 className="text-4xl font-[family-name:var(--font-playfair)] font-medium mb-3 text-gray-900">Appointment Booked</h2>
                  <p className="text-gray-500 text-lg">Your tailoring appointment has been successfully scheduled.</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 inline-block text-left w-full max-w-md shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Booking ID</p>
                      <p className="text-2xl font-mono font-bold tracking-tight text-gray-900">{bookingId}</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                      <CalendarIcon className="w-6 h-6 text-black" />
                    </div>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-gray-200">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Service</p>
                      <p className="font-semibold text-gray-900">{formData.service}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Appointment</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })} &middot; {formData.time}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href={`/track/${bookingId}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-xl shadow-black/10">
                    Track Appointment <MoveRight className="w-4 h-4" />
                  </Link>
                  <Link href="/" className="w-full sm:w-auto px-10 py-4 text-gray-600 font-bold hover:text-black transition">
                    Back to Home
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
