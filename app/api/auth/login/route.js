import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req) {
  try {
    const { username, password } = await req.json()
    if (!username || !password)
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })

    const [user] = await db.select().from(users).where(eq(users.username, username.toLowerCase().trim()))
    if (!user)
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid)
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' })
    const cookieStore = await cookies()
    cookieStore.set('habit_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
