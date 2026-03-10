import { db } from '@/lib/db'
import { completions } from '@/lib/schema'
import { eq, and, gte } from 'drizzle-orm'
import { getUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  let rows
  if (from) {
    rows = await db.select().from(completions)
      .where(and(eq(completions.userId, user.id), gte(completions.date, from)))
  } else {
    rows = await db.select().from(completions).where(eq(completions.userId, user.id))
  }
  return NextResponse.json(rows)
}

export async function POST(req) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { habitId, date } = await req.json()

  const [existing] = await db.select().from(completions)
    .where(and(eq(completions.habitId, habitId), eq(completions.date, date), eq(completions.userId, user.id)))

  if (existing) {
    await db.delete(completions)
      .where(and(eq(completions.habitId, habitId), eq(completions.date, date), eq(completions.userId, user.id)))
    return NextResponse.json({ completed: false })
  } else {
    await db.insert(completions).values({ habitId, userId: user.id, date })
    return NextResponse.json({ completed: true })
  }
}
