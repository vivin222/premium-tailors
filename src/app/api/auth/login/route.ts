import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Read from environment variables securely
    const envUsername = process.env.SHOPKEEPER_USERNAME
    const envPassword = process.env.SHOPKEEPER_PASSWORD

    let isValid = false;

    if (envUsername && envPassword) {
      if (username === envUsername && password === envPassword) {
        isValid = true;
      }
    } else {
      // Fallback to secure hashes if Render environment variables are missing.
      // This allows the deployment to work without committing passwords to GitHub.
      const userHash = createHash('sha256').update(username || '').digest('hex');
      const passHash = createHash('sha256').update(password || '').digest('hex');
      
      const expectedUserHash = 'de59c739c0c817316e437c1e26efadd47ef8d97cbed944f78666f28fba54b97a';
      const expectedPassHash = '083476875361b3949d301b02b0931e6da29b1ca1b8b2a08bafb51c0eb113ac34';
      
      if (userHash === expectedUserHash && passHash === expectedPassHash) {
        isValid = true;
      }
    }

    if (isValid) {
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
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication failed: ' + error?.message }, { status: 500 })
  }
}
