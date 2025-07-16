import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'East Crafts - Handcrafted Woodworking & Custom Furniture',
  description: 'Premium handcrafted woodworking and custom furniture. Shop our collection of bespoke pieces and professional woodworking services.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
