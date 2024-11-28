import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Snow from '@/components/Snow'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Christmas Wish List',
  description: 'Create and share your Christmas wish list',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="container max-w-2xl mx-auto min-h-screen flex items-center justify-center px-4 py-6 sm:p-8">
          {children}
        </main>
        <Toaster />
        <Snow />
      </body>
    </html>
  )
}
