import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL || 'file:tailor_local.db'
const authToken = process.env.TURSO_AUTH_TOKEN

const client = createClient({
  url,
  authToken
})

export async function openDb() {
  return {
    async all(sql: string, args: any[] = []) {
      const rs = await client.execute({ sql, args })
      return rs.rows
    },
    async get(sql: string, args: any[] = []) {
      const rs = await client.execute({ sql, args })
      return rs.rows[0] || undefined
    },
    async run(sql: string, args: any[] = []) {
      const rs = await client.execute({ sql, args })
      return { changes: rs.rowsAffected, lastID: rs.lastInsertRowid?.toString() }
    },
    async exec(sql: string) {
      await client.executeMultiple(sql)
    }
  }
}

export async function initDb() {
  const db = await openDb()
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tailor_customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tailor_bookings (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL UNIQUE,
      customer_id TEXT NOT NULL,
      service TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES tailor_customers(id)
    );
  `)

  return db
}
