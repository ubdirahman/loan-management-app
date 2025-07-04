import type { Metadata } from 'next'
import './globals.css'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Deemo App',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/deemoApp.png" /> {/* Halkan ku dar sawirka */}
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}