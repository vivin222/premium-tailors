import { NextResponse } from 'next/server'
import { initDb } from '@/lib/db'
import { generateOrderId } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { customer, items, selectedDate, selectedSlot, depositAmount } = data
    const db = await initDb()

    // Find or create customer
    let cust = await db.get('SELECT id FROM customers WHERE mobile_number = ?', [customer.mobile])
    let customerId = cust?.id

    if (!customerId) {
      customerId = uuidv4()
      await db.run('INSERT INTO customers (id, name, mobile_number) VALUES (?, ?, ?)', [customerId, customer.name, customer.mobile])
    }

    // Create appointment
    const appointmentId = uuidv4()
    await db.run('INSERT INTO appointments (id, customer_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)', [
      appointmentId, customerId, selectedDate, selectedSlot
    ])

    // Create order
    const orderId = uuidv4()
    const displayId = generateOrderId()
    const qrToken = Math.random().toString(36).substring(2, 15)

    await db.run(`INSERT INTO orders (id, display_id, customer_id, appointment_id, status, deposit_amount, qr_token) VALUES (?, ?, ?, ?, 'Appointment Booked', ?, ?)`, [
      orderId, displayId, customerId, appointmentId, depositAmount, qrToken
    ])

    // Create order items
    for (const item of items) {
       const itemId = uuidv4()
       await db.run(`INSERT INTO order_items (id, order_id, category_id, service_id, quantity, requirements, special_requirements) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
         itemId, orderId, item.categoryId, item.serviceId, item.quantity, item.requirements || '', item.specialRequirements || ''
       ])
    }

    // Create payment
    await db.run(`INSERT INTO payments (id, order_id, amount, payment_type) VALUES (?, ?, ?, 'Deposit')`, [uuidv4(), orderId, depositAmount])

    // Return the booked order
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [orderId])
    return NextResponse.json({ ...order, customer, appointment_date: selectedDate, appointment_time: selectedSlot })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
