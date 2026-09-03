import Link from 'next/link'
import { Scissors, Ruler, Clock, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto border-b border-gray-100">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)] tracking-tight">Premium Tailors</h1>
        <div className="flex gap-6 items-center">
          <Link href="/track" className="text-sm font-medium text-gray-500 hover:text-black transition">Track Order</Link>
          <Link href="/book" className="text-sm font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition">Book Appointment</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-8 py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Now accepting new bookings
          </div>
          <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-playfair)] font-medium leading-[1.1] tracking-tight">
            The perfect fit, <br />tailored to you.
          </h2>
          <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
            Experience bespoke craftsmanship with our modern tailoring service. Book your consultation online, drop off your fabric, and track your garment's journey to perfection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/book" className="flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition shadow-xl shadow-black/10">
              Start Your Booking <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/track" className="flex items-center justify-center gap-2 bg-white text-black border-2 border-gray-200 px-8 py-4 rounded-full font-semibold hover:border-black transition">
              Track Existing Order
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden relative">
            {/* Elegant placeholder gradient to simulate premium fashion imagery */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Scissors className="w-32 h-32 text-gray-300" strokeWidth={1} />
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)]">Expert Craftsmanship</h3>
              <p className="text-gray-500 leading-relaxed">Decades of experience ensure every stitch is perfectly placed and every hem falls flawlessly.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)]">Live Order Tracking</h3>
              <p className="text-gray-500 leading-relaxed">Never wonder about your garment's status. Watch it move from pattern making to final delivery in real-time.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                <Ruler className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-[family-name:var(--font-playfair)]">Bespoke Fitting</h3>
              <p className="text-gray-500 leading-relaxed">Your body is unique. We take detailed measurements to guarantee a silhouette that complements you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-8 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Premium Tailors. All rights reserved.</p>
        <Link href="/shopkeeper" className="text-xs text-gray-300 hover:text-gray-600 mt-4 inline-block">Shopkeeper Login</Link>
      </footer>
    </div>
  )
}
