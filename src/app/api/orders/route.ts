import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await initDb()
    
    // We need to construct nested JSON for SQLite output or just run multiple queries
    const orders = await db.all(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.mobile_number as customer_mobile,
        a.appointment_date,
        a.appointment_time
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN appointments a ON o.appointment_id = a.id
      ORDER BY o.created_at DESC
    `)
    
    // Format to match the previous structure
    const formattedOrders = orders.map(o => ({
      ...o,
      customers: { name: o.customer_name, mobile_number: o.customer_mobile },
      appointments: o.appointment_date ? { appointment_date: o.appointment_date, appointment_time: o.appointment_time } : null
    }))

    return NextResponse.json(formattedOrders)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
