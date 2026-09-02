"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Calendar, Users, BarChart3, Settings } from 'lucide-react'

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/shopkeeper', icon: LayoutDashboard },
    { name: 'Orders', href: '/shopkeeper/orders', icon: ShoppingBag },
    { name: 'Appointments', href: '/shopkeeper/appointments', icon: Calendar },
    { name: 'Customers', href: '/shopkeeper/customers', icon: Users },
    { name: 'Reports', href: '/shopkeeper/reports', icon: BarChart3 },
    { name: 'Settings', href: '/shopkeeper/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col bg-gray-900">
        <div className="flex h-16 shrink-0 items-center px-6 bg-gray-950">
          <span className="text-xl font-bold text-white tracking-wide">Shopkeeper</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile nav (bottom bar for demo simplicity) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around p-2 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)]">
        {navItems.slice(0, 4).map((item) => {
           const isActive = pathname === item.href
           const Icon = item.icon
           return (
             <Link key={item.name} href={item.href} className="flex flex-col items-center p-2">
                <Icon className={`h-6 w-6 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>{item.name}</span>
             </Link>
           )
        })}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top header mobile */}
        <div className="md:hidden flex h-16 items-center px-4 bg-gray-900">
           <span className="text-lg font-bold text-white">Shopkeeper Portal</span>
        </div>
        
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
