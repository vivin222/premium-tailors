"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function ShopkeeperCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    // Fetch customers with their order count
    const { data } = await supabase
      .from('customers')
      .select('*, orders(id)')
      .order('created_at', { ascending: false })
      
    if (data) setCustomers(data)
  }

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.mobile_number.includes(search)
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      
      <Card>
        <CardHeader className="pb-3 border-b">
           <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by Name or Mobile..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Mobile Number</th>
                  <th className="px-6 py-3 font-medium">Joined On</th>
                  <th className="px-6 py-3 font-medium">Total Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-500">{c.mobile_number}</td>
                    <td className="px-6 py-4 text-gray-500">{format(parseISO(c.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-4 font-medium">{c.orders?.length || 0}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No customers found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
