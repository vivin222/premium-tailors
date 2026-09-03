"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Calendar as CalendarIcon, Scissors, MoveRight, CircleDashed, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatApptDate } from '@/lib/format'

const SERVICES = [
  { id: 'custom-suit', name: 'Custom Suit / Blazer', time: 'Approx. 2-3 Weeks', desc: 'A fully tailored suit crafted to your exact measurements and styling preferences.' },
  { id: 'custom-shirt', name: 'Bespoke Shirt', time: 'Approx. 1-2 Weeks', desc: 'Made-to-measure shirts with your choice of collar, cuffs, and premium fabrics.' },
  { id: 'alter', name: 'Alterations & Adjustments', time: 'Approx. 2-3 Days', desc: 'Hemming, tapering, resizing, and general repairs to breathe new life into your garments.' }
]

const TIME_SLOTS = [
  "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM",
  "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
]

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function BookingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState('')
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: ''
  })

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
      if (res.ok) {
        const data = await res.json()
        setBookingId(data.bookingId)
        setStep(4)
      } else {
        alert("Failed to submit booking. Please try again.")
      }
    } catch {
      alert("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  // Calendar Calculations
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  // Adjust to make Monday the first day (0 = Mon, 6 = Sun)
  const firstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {step < 4 && (
        <nav className="py-6 px-8 bg-white border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-black transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Booking
          </Link>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${step >= i ? 'bg-black scale-125' : 'bg-gray-200'}`} />
            ))}
          </div>
        </nav>
      )}

      <main className="flex-1 flex flex-col p-4 md:p-8">
        <div className="max-w-4xl w-full mx-auto">
          
          {step < 4 && (
            <div className="bg-black text-white rounded-t-3xl p-8 md:p-12 flex justify-between items-end shadow-xl shadow-black/10">
              <div>
                <h1 className="text-3xl md:text-5xl font-[family-name:var(--font-playfair)] font-medium">
                  {step === 1 ? 'Select Service' : step === 2 ? 'Schedule Drop-off' : 'Your Details'}
                </h1>
              </div>
              <div className="text-gray-400 font-bold uppercase tracking-widest text-sm hidden md:block">
                Step {step} of 3
              </div>
            </div>
          )}

          <div className={`bg-white shadow-sm border border-gray-100 p-6 md:p-12 ${step < 4 ? 'rounded-b-3xl' : 'rounded-3xl'}`}>
            
            {/* STEP 1: SERVICE */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">What do you need tailored?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {SERVICES.map(service => {
                    const isSelected = formData.service === service.name
                    return (
                      <button
                        key={service.id}
                        onClick={() => {
                          setFormData({ ...formData, service: service.name })
                          setTimeout(handleNext, 300)
                        }}
                        className={`text-left p-8 rounded-3xl transition-all border-2 group relative overflow-hidden ${
                          isSelected 
                          ? 'border-black bg-gray-50 shadow-md scale-[1.02]' 
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'}`}>
                          <Scissors className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg mb-2">{service.name}</h4>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{service.desc}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-auto uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> {service.time}
                        </div>
                        {isSelected && (
                          <div className="absolute top-6 right-6 text-black">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  
                  {/* Custom Calendar */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">
                      <CalendarIcon className="w-4 h-4" /> Select Date
                    </h3>
                    
                    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                      {/* Calendar Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-lg text-gray-900">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h4>
                        <div className="flex gap-2">
                          <button onClick={prevMonth} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button onClick={nextMonth} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Weekdays */}
                      <div className="grid grid-cols-7 mb-4">
                        {WEEKDAYS.map(day => (
                          <div key={day} className="text-center text-xs font-bold text-gray-400 tracking-wider">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={'empty-' + i} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dateNum = i + 1
                          const dateObj = new Date(year, month, dateNum)
                          // Safe string generation avoiding template literal masking bugs
                          const yStr = String(year)
                          const mStr = String(month + 1).padStart(2, '0')
                          const dStr = String(dateNum).padStart(2, '0')
                          const dateString = yStr + '-' + mStr + '-' + dStr
                          
                          const isPast = dateObj < today
                          const isSelected = formData.date === dateString

                          return (
                            <div key={dateNum} className="flex justify-center">
                              <button
                                disabled={isPast}
                                onClick={() => setFormData({ ...formData, date: dateString, time: '' })} // clear time when date changes
                                className={'w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ' + (
                                  isSelected 
                                  ? 'bg-black text-white shadow-md scale-110' 
                                  : isPast 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-700 hover:bg-gray-100'
                                )}
                              >
                                {dateNum}
                              </button>
                            </div>
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
                        let isPastTime = false;
                        if (formData.date) {
                          const yStr = String(today.getFullYear());
                          const mStr = String(today.getMonth() + 1).padStart(2, '0');
                          const dStr = String(today.getDate()).padStart(2, '0');
                          const todayStr = yStr + '-' + mStr + '-' + dStr;
                          
                          if (formData.date === todayStr) {
                            const parts = time.split(' ');
                            const timeStr = parts[0];
                            const ampm = parts[1];
                            const timeParts = timeStr.split(':');
                            let hours = parseInt(timeParts[0]);
                            const minutes = parseInt(timeParts[1]);
                            
                            if (ampm === 'PM' && hours !== 12) hours += 12;
                            if (ampm === 'AM' && hours === 12) hours = 0;
                            
                            const slotTime = hours * 60 + minutes;
                            const now = new Date();
                            const currentTime = now.getHours() * 60 + now.getMinutes();
                            
                            if (slotTime < currentTime) isPastTime = true;
                          }
                        }

                        const isSelected = formData.time === time
                        return (
                          <button
                            key={time}
                            disabled={isPastTime}
                            onClick={() => setFormData({ ...formData, time })}
                            className={'py-3 rounded-xl text-sm font-semibold transition-all border-2 ' + (
                              isSelected
                              ? 'border-black bg-black text-white shadow-md'
                              : isPastTime
                                ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            )}
                          >
                            {time}
                          </button>
                        )
                      })}
                    </div>
                    {!formData.date && (
                      <p className="text-gray-400 text-sm mt-6 text-center italic">Please select a date first.</p>
                    )}
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
                    {formatApptDate(formData.date, 'long')} at {formData.time}
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
                        {formatApptDate(formData.date, 'long')} &middot; {formData.time}
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
