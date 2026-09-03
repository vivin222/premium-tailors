import { NextResponse } from 'next/server'
import { openDb, initDb } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const db = await initDb()
    const rows = await db.all(`
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
      ORDER BY b.created_at DESC
    `)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { name, phone, service, date, time, notes } = data

    if (!name || !phone || !service || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await initDb()
    
    // Find or create customer
    let customer = await db.get('SELECT id FROM tailor_customers WHERE phone = ?', [phone])
    let customerId = customer?.id

    if (!customer) {
      customerId = uuidv4()
      await db.run('INSERT INTO tailor_customers (id, name, phone) VALUES (?, ?, ?)', [customerId, name, phone])
    } else {
      // Update name if different
      await db.run('UPDATE tailor_customers SET name = ? WHERE id = ?', [name, customerId])
    }

    // Create booking
    const bookingId = uuidv4()
    // Generate simple ID like BK-XXXXXX
    const displayId = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    await db.run(
      `INSERT INTO tailor_bookings (id, display_id, customer_id, service, appointment_date, appointment_time, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [bookingId, displayId, customerId, service, date, time, notes || '']
    )

    return NextResponse.json({ success: true, bookingId: displayId })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
