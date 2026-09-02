import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
   try {
     const db = await initDb()
     const updates = await request.json()
     
     const keys = Object.keys(updates)
     if (keys.length > 0) {
       const setString = keys.map(k => `${k} = ?`).join(', ')
       const values = keys.map(k => updates[k])
       await db.run(`UPDATE order_items SET ${setString} WHERE id = ?`, [...values, params.id])
       
       // Recalculate order total
       const item = await db.get('SELECT order_id FROM order_items WHERE id = ?', [params.id])
       if (item) {
          const total = await db.get('SELECT SUM(quantity * unit_price) as sum FROM order_items WHERE order_id = ?', [item.order_id])
          await db.run('UPDATE orders SET total_amount = ? WHERE id = ?', [total.sum || 0, item.order_id])
       }
     }
     
     return NextResponse.json({ success: true })
   } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 })
   }
}
