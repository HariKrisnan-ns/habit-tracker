import { pgTable, serial, text, integer, timestamp, unique } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const habits = pgTable('habits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').default('General'),
  color: text('color').default('#6366f1'),
  icon: text('icon').default('⭐'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const completions = pgTable('completions', {
  id: serial('id').primaryKey(),
  habitId: integer('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
}, (t) => ({
  unq: unique().on(t.habitId, t.date),
}))
