import './globals.css'

export const metadata = {
  title: 'HabitFlow',
  description: 'Track your daily habits and build streaks',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
