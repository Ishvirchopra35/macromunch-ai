import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MacroMunch AI',
  description: 'Your AI chef that knows your macros',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
