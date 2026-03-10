import { db } from '@/lib/db'
import { habits } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { getUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await db.select().from(habits).where(eq(habits.userId, user.id))
  return NextResponse.json(result)
}

export async function POST(req) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, category, color, icon } = await req.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const [habit] = await db.insert(habits).values({
    userId: user.id, name: name.trim(),
    category: category || 'General',
    color: color || '#6366f1',
    icon: icon || '⭐',
  }).returning()
  return NextResponse.json(habit)
}

export async function PUT(req) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, name, category, color, icon } = await req.json()
  const [updated] = await db.update(habits)
    .set({ name, category, color, icon })
    .where(and(eq(habits.id, id), eq(habits.userId, user.id)))
    .returning()
  return NextResponse.json(updated)
}

export async function DELETE(req) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, user.id)))
  return NextResponse.json({ success: true })
}
