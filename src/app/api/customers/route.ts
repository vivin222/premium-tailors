import { NextResponse } from 'next/server'
import { openDb, initDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await initDb()
    const rows = await db.all(`
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.created_at,
        COUNT(b.id) as total_bookings,
        MAX(b.created_at) as latest_booking_date,
        (SELECT status FROM tailor_bookings WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_status,
        (SELECT service FROM tailor_bookings WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_service
      FROM tailor_customers c
      LEFT JOIN tailor_bookings b ON c.id = b.customer_id
      GROUP BY c.id
      ORDER BY latest_booking_date DESC
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
