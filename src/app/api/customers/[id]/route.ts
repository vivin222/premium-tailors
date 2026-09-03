import { NextResponse } from 'next/server'
import { openDb } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await openDb()
    
    // Fetch customer details
    const customer = await db.get(`
      SELECT id, name, phone, created_at
      FROM tailor_customers
      WHERE id = ?
    `, [params.id])

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Fetch customer's booking history
    const bookings = await db.all(`
      SELECT 
        id, display_id, service, appointment_date, appointment_time, status, notes, created_at
      FROM tailor_bookings
      WHERE customer_id = ?
      ORDER BY created_at DESC
    `, [params.id])

    return NextResponse.json({
      customer,
      bookings
    })
  } catch (error) {
    console.error('Failed to fetch customer details:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
