import type { Metadata, Viewport } from 'next'
import { Amiri_Quran } from 'next/font/google'
import './globals.css'
import SwRegistrar from './SwRegistrar'

const amiriQuran = Amiri_Quran({
  weight: '400',
  subsets: ['arabic'],
  variable: '--font-amiri-quran',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hifz Trainer',
  description: 'Quran memorization using incremental rehearsal',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Hifz Trainer' },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={amiriQuran.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <SwRegistrar />
        {children}
      </body>
    </html>
  )
}
