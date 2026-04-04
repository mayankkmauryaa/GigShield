import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from './ClientLayout'

export const metadata: Metadata = {
  title: 'GigShield - Parametric Insurance for Gig Workers',
  description: 'Protect your income from weather disruptions. Weekly premiums, instant payouts for delivery partners.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="min-h-screen bg-surface selection:bg-primary/30 antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}