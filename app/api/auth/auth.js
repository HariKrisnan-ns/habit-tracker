import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function getUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('habit_token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}
