import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'JASP - Balochi Adab',
  description: 'Your hub for Balochi literature insights, discussions, and community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* ADD THIS LINE */}
        <div id="modal-root" />
      </body>
    </html>
  )
}