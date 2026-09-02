import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'tailor_data.sqlite')

export async function openDb() {
  // Ensure the parent directory exists (critical for Render /data mounts)
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  })
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;')
  return db
}

export async function initDb() {
  const db = await openDb()
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS shop_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opening_time TEXT DEFAULT '09:00:00',
      closing_time TEXT DEFAULT '18:00:00',
      slot_duration_minutes INTEGER DEFAULT 30,
      max_customers_per_slot INTEGER DEFAULT 3,
      booking_deposit_amount REAL DEFAULT 50.00,
      upi_id TEXT DEFAULT 'premiumtailors@upi'
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile_number TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'Scheduled',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );

    CREATE TABLE IF NOT EXISTS blocked_slots (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      appointment_id TEXT,
      status TEXT DEFAULT 'Appointment Booked',
      deposit_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      qr_token TEXT NOT NULL,
      delivery_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(appointment_id) REFERENCES appointments(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price REAL DEFAULT 0,
      requirements TEXT,
      special_requirements TEXT,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(category_id) REFERENCES categories(id),
      FOREIGN KEY(service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS measurements (
      id TEXT PRIMARY KEY,
      order_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT DEFAULT 'in',
      FOREIGN KEY(order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_type TEXT,
      status TEXT DEFAULT 'Completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `)

  // Seed data if empty
  const hasSettings = await db.get('SELECT COUNT(*) as count FROM shop_settings')
  if (hasSettings.count === 0) {
    await db.run(`INSERT INTO shop_settings (opening_time, closing_time) VALUES ('09:00:00', '18:00:00')`)
  }

  const hasCategories = await db.get('SELECT COUNT(*) as count FROM categories')
  if (hasCategories.count === 0) {
    await db.run(`INSERT INTO categories (id, name) VALUES ('cat1', 'Saree Blouse'), ('cat2', 'Chudi'), ('cat3', 'Salwar Kameez')`)
  }

  const hasServices = await db.get('SELECT COUNT(*) as count FROM services')
  if (hasServices.count === 0) {
    await db.run(`INSERT INTO services (id, name) VALUES ('srv1', 'New Stitching'), ('srv2', 'Alteration'), ('srv3', 'Embroidery')`)
  }

  return db
}
