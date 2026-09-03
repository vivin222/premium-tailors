"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Calendar, Users, List, LayoutDashboard, LogOut } from 'lucide-react'

const navItems = [
  { href: '/shopkeeper', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/shopkeeper/bookings', label: 'Bookings', icon: List },
  { href: '/shopkeeper/appointments', label: 'Schedule', icon: Calendar },
  { href: '/shopkeeper/customers', label: 'Customers', icon: Users },
]

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (pathname === '/shopkeeper/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    // A simple client side clear cookie isn't entirely secure for HttpOnly,
    // so we just redirect and let the server clear it, but since we didn't build an API for it yet,
    // we can just delete standard cookies or rely on an API.
    // Let's just use document.cookie for simplicity if we didn't strictly need HttpOnly for logout
    document.cookie = 'shopkeeper_auth=; Max-Age=0; path=/';
    window.location.href = '/shopkeeper/login';
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4" />
          </div>
          <span className="font-[family-name:var(--font-playfair)] font-medium text-lg tracking-tight truncate">
            Premium Tailors
          </span>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(item => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
