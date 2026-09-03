import { NextResponse } from 'next/server'
import { openDb } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const db = await openDb()
    const booking = await db.get(`
      SELECT 
        b.id,
        b.display_id,
        b.service,
        b.appointment_date,
        b.appointment_time,
        b.status,
        b.notes,
        b.created_at,
        c.name as customer_name,
        c.phone as customer_phone
      FROM tailor_bookings b
      JOIN tailor_customers c ON b.customer_id = c.id
      WHERE b.display_id = ? OR b.id = ?
    `, [params.id, params.id])

    if (!booking) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to fetch booking:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const { status } = data

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const db = await openDb()
    await db.run('UPDATE tailor_bookings SET status = ? WHERE display_id = ? OR id = ?', [status, params.id, params.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update booking:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
