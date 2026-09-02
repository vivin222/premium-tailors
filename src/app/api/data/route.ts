import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const db = await initDb()
    const categories = await db.all('SELECT * FROM categories WHERE is_active = 1')
    const services = await db.all('SELECT * FROM services WHERE is_active = 1')
    const settings = await db.get('SELECT * FROM shop_settings LIMIT 1')
    
    // Also fetch appointments and blocked slots for a specific date if provided
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    let appointments = []
    let blocked_slots = []
    
    if (date) {
       appointments = await db.all('SELECT appointment_time FROM appointments WHERE appointment_date = ? AND status != "Cancelled"', [date])
       blocked_slots = await db.all('SELECT time FROM blocked_slots WHERE date = ?', [date])
    }

    return NextResponse.json({ categories, services, settings, appointments, blocked_slots })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
