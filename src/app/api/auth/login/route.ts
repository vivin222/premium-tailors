import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Read from environment variables securely
    const validUsername = process.env.SHOPKEEPER_USERNAME
    const validPassword = process.env.SHOPKEEPER_PASSWORD

    if (!validUsername || !validPassword) {
      console.error("SERVER MISCONFIGURATION: SHOPKEEPER_USERNAME or SHOPKEEPER_PASSWORD is not set in environment.");
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    if (username === validUsername && password === validPassword) {
      cookies().set('shopkeeper_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
