import React from 'react'
import { Inter } from 'next/font/google'
import { SITE_CONFIG } from '@/config/site'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang={SITE_CONFIG.lang} className={SITE_CONFIG.theme}>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
