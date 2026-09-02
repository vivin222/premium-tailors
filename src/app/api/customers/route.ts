import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export async function GET() {
  const db = await initDb()
  const data = await db.all('SELECT * FROM customers ORDER BY created_at DESC')
  
  // also fetch their total orders and spent
  for (const c of data) {
     const stats = await db.get('SELECT COUNT(*) as c, SUM(total_amount) as s FROM orders WHERE customer_id = ?', [c.id])
     c.total_orders = stats.c
     c.total_spent = stats.s || 0
  }
  
  return NextResponse.json(data)
}
