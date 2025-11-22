import type { Metadata } from 'next'
import { Inter, Noto_Naskh_Arabic } from 'next/font/google'
import './globals.css'

// 1. Load English Font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// 2. Load Balochi Font
const noto = Noto_Naskh_Arabic({ 
  subsets: ['arabic'],
  variable: '--font-noto',
  weight: ['400', '500', '600', '700'],
  display: 'swap', 
})

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
      {/* 3. Inject variables and base bg color */}
      <body className={`${inter.variable} ${noto.variable} bg-[#F9FAFB]`}>
        {children}
        <div id="modal-root" />
      </body>
    </html>
  )
}