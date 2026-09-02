import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, MapPin, CheckCircle, Smartphone } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden border-b">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10 sm:pt-16 lg:pt-20">
              <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Your Tailoring,</span>{' '}
                    <span className="block text-gray-600 xl:inline">Without the Waiting.</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Book your appointment before you visit. Tell us what you need, arrive at your scheduled time, and track your order until pickup.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                    <Link href="/book">
                      <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
                        Book an Appointment <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/track">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto mt-3 sm:mt-0">
                        Track My Order
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-100 flex items-center justify-center p-12 hidden lg:flex">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                  <h3 className="font-semibold text-lg">No Waiting</h3>
                  <p className="text-gray-500 text-sm">Reserve your slot and get immediate attention when you walk in.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 mt-8">
                  <Smartphone className="h-8 w-8 text-gray-400" />
                  <h3 className="font-semibold text-lg">Track Anywhere</h3>
                  <p className="text-gray-500 text-sm">Get real-time updates on your phone from measurement to delivery.</p>
                </div>
             </div>
          </div>
        </div>

        {/* How it works */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
              <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
                A simple, premium experience designed for your convenience during busy seasons.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-6">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Book Online</h3>
                  <p className="text-gray-500">Tell us what you need and pick a convenient time slot with a ₹50 deposit.</p>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-6">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Shop</h3>
                  <p className="text-gray-500">Bring your clothes. We'll take your measurements and confirm the final price.</p>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-gray-900 text-white mb-6">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Track & Collect</h3>
                  <p className="text-gray-500">Watch your order progress on your phone and pick it up when ready.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
