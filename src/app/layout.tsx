import '@/styles/globals.css'
import { Metadata } from 'next'
import { TRPCReactProvider } from '@/lib/trpc'

export const metadata: Metadata = {
  title: 'AI Chatbot',
  description: 'Your personal AI assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
