import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const db = await initDb()
    
    const order = await db.get(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.mobile_number as customer_mobile,
        a.appointment_date,
        a.appointment_time
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN appointments a ON o.appointment_id = a.id
      WHERE o.id = ?
    `, [params.id])

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const orderItems = await db.all(`
      SELECT oi.*, c.name as category_name, s.name as service_name
      FROM order_items oi
      JOIN categories c ON oi.category_id = c.id
      JOIN services s ON oi.service_id = s.id
      WHERE oi.order_id = ?
    `, [params.id])

    const measurements = await db.all(`
      SELECT m.*
      FROM measurements m
      JOIN order_items oi ON m.order_item_id = oi.id
      WHERE oi.order_id = ?
    `, [params.id])

    // Construct nested object
    const formattedOrder = {
      ...order,
      customers: { name: order.customer_name, mobile_number: order.customer_mobile },
      appointments: order.appointment_date ? { appointment_date: order.appointment_date, appointment_time: order.appointment_time } : null,
      order_items: orderItems.map(item => ({
        ...item,
        categories: { name: item.category_name },
        services: { name: item.service_name },
        measurements: measurements.filter(m => m.order_item_id === item.id)
      }))
    }

    return NextResponse.json(formattedOrder)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
   try {
     const db = await initDb()
     const updates = await request.json()
     
     // Build dynamic update query
     const keys = Object.keys(updates)
     if (keys.length > 0) {
       const setString = keys.map(k => `${k} = ?`).join(', ')
       const values = keys.map(k => updates[k])
       await db.run(`UPDATE orders SET ${setString} WHERE id = ?`, [...values, params.id])
     }
     
     return NextResponse.json({ success: true })
   } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 })
   }
}
