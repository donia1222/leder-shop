import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next';
import { CookieBanner } from '@/components/cookie-banner'


export const metadata: Metadata = {
  title: 'Leder-Shop – Handgemachte Lederartikel aus Sax, Schweiz',
  description: 'Ihr Spezialist für handgemachte Lederartikel aus echtem Leder. Premium Taschen, Portemonnaies & Accessoires — gefertigt in Sax, Schweiz.',
  applicationName: 'Leder-Shop',
  keywords: ['Leder', 'Ledertaschen', 'handgemacht', 'Portemonnaie', 'Ledergürtel', 'Schweiz', 'Sax', 'Echtleder', 'Lederaccessoires', 'Swiss Handcraft'],
  authors: [{ name: 'Leder-Shop Sax' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Leder-Shop – Handgemachte Lederartikel',
    description: 'Premium Taschen, Portemonnaies & Accessoires aus echtem Leder. Handgefertigt in Sax, Schweiz.',
    type: 'website',
    locale: 'de_CH',
    siteName: 'Leder-Shop',
  },
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
    <html lang="de">
      <body>{children} <Analytics /><CookieBanner /></body>
    </html>
  )
}
