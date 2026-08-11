import type { Metadata, Viewport } from 'next'
import { Pinyon_Script } from 'next/font/google'
import './globals.css'

// Ersatz für "Palace Script MT" (keine Web-Schrift) – wird im CSS-Stack dahinter genutzt
const scriptFont = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-script',
})
import { Analytics } from '@vercel/analytics/next';
import { CookieBanner } from '@/components/cookie-banner'
import { ThemeProvider } from 'next-themes'


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
    <html lang="de" suppressHydrationWarning className={scriptFont.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
          <Analytics />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}
