import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, MapPin, CheckCircle, Smartphone, CalendarDays, Scissors, Sparkles, Truck } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-gray-900 selection:text-white">
      <Navbar />
      
      <main>
        {/* Premium Hero Section */}
        <div className="relative bg-white overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 pb-28 md:pt-32 md:pb-40">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 mb-8">
                 <Sparkles className="w-4 h-4" /> Premium Tailoring Experience
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tighter leading-tight mb-6">
                Tailoring Without <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">The Waiting.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                Book your appointment before you visit. Bring your clothes at your scheduled time and track your order until pickup.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/book" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl shadow-xl shadow-gray-900/20 hover:scale-105 transition-all">
                    Book Appointment <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/track" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-xl border-2 hover:bg-gray-50 transition-all">
                    Track Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Why Choose Premium Tailors</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               
               <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border flex items-center justify-center mb-6">
                     <CalendarDays className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Booking</h3>
                  <p className="text-gray-500">Pick a time that works for you and avoid the festival rush entirely.</p>
               </div>

               <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border flex items-center justify-center mb-6">
                     <Scissors className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Pro Measurements</h3>
                  <p className="text-gray-500">We take precise physical measurements at the shop for the perfect fit.</p>
               </div>

               <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border flex items-center justify-center mb-6">
                     <Smartphone className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Order Tracking</h3>
                  <p className="text-gray-500">Scan your QR code or enter your number to see real-time progress.</p>
               </div>

               <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-3xl hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border flex items-center justify-center mb-6">
                     <Truck className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Delivery Updates</h3>
                  <p className="text-gray-500">Get notified the moment your beautifully stitched clothes are ready.</p>
               </div>
               
             </div>
          </div>
        </div>

      </main>
    </div>
  )
}
