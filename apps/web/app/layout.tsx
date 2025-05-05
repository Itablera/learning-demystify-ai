import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@workspace/ui/styles/globals.css'
import { Toaster } from '@workspace/ui/components/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chat Interface',
  description: 'A modern chat interface for AI assistants',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
