import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Omega Barber Lab | Premium Grooming Καβάλα',
  description:
    'Κλείστε ραντεβού online στο Omega Barber Lab. Premium grooming experience στην Καβάλα.',
  openGraph: {
    title: 'Omega Barber Lab',
    description: 'Premium grooming experience στην Καβάλα',
    locale: 'el_GR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
