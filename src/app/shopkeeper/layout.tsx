"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, LayoutDashboard, CalendarDays, Users, ListOrdered, Settings, LogOut } from 'lucide-react'

export default function ShopkeeperLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/shopkeeper', icon: LayoutDashboard },
    { name: 'Bookings', href: '/shopkeeper/bookings', icon: ListOrdered },
    { name: 'Appointments', href: '/shopkeeper/appointments', icon: CalendarDays },
    { name: 'Customers', href: '/shopkeeper/customers', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-black text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <Scissors className="w-6 h-6 text-white" />
          <h1 className="text-xl font-[family-name:var(--font-playfair)] font-medium tracking-wide">
            Premium Tailors
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Operations</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition \${
                  isActive 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 transition">
            <LogOut className="w-5 h-5" />
            Exit Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(i => i.href === pathname)?.name || 'Details'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> System Live
            </span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
