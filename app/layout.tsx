import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next';
import { CookieBanner } from '@/components/cookie-banner'


export const metadata: Metadata = {
  title: 'Leder-Shop – Premium Lederartikel',
  description: 'Ihr Spezialist für handgemachte Lederartikel aus echtem Leder. Premium Taschen, Portemonnaies & Accessoires.',
  generator: '9745 Sevelen',
  icons: {
    icon: '/favicon.png',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#8B5E3C',
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children} <Analytics /><CookieBanner /></body>
    </html>
  )
}
