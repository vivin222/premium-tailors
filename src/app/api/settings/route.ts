import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export async function GET() {
  const db = await initDb()
  const data = await db.get('SELECT * FROM shop_settings LIMIT 1')
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const db = await initDb()
  const updates = await request.json()
  const keys = Object.keys(updates)
  if (keys.length > 0) {
    const setStr = keys.map(k => `${k} = ?`).join(', ')
    const values = keys.map(k => updates[k])
    await db.run(`UPDATE shop_settings SET ${setStr} WHERE id = (SELECT id FROM shop_settings LIMIT 1)`, values)
  }
  return NextResponse.json({ success: true })
}
