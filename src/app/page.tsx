import Link from 'next/link'
import { Scissors, Measure, Clock, ShieldCheck, ArrowRight, User, Lock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <header className="py-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/10">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-playfair)] font-medium tracking-tight mb-4">
            Premium Tailors
          </h1>
          <p className="text-gray-500 max-w-xl text-lg">
            Bespoke tailoring platform seamlessly connecting our master craftsmen with your personal styling needs.
          </p>
        </header>

        {/* Portal Selection */}
        <section className="py-8">
          <div className="text-center mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Choose your portal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Customer Portal Card */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-gray-300 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center mb-6">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Customer Portal</h3>
              <p className="text-gray-500 mb-8 max-w-xs">
                Book and track your tailoring appointment. Experience bespoke craftsmanship.
              </p>
              <Link href="/book" className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition shadow-lg shadow-black/10 group-hover:scale-[1.02]">
                Enter Customer Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Shopkeeper Portal Card */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:border-gray-300 hover:shadow-md transition-all group">
              <div className="w-16 h-16 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Shopkeeper Portal</h3>
              <p className="text-gray-500 mb-8 max-w-xs">
                Manage appointments, customers, and operations securely.
              </p>
              <Link href="/shopkeeper" className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-white text-black border-2 border-black px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition group-hover:scale-[1.02]">
                Shopkeeper Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
