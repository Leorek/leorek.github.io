import React from 'react'
import { Inter } from 'next/font/google'
import { SITE_CONFIG } from '@/config/site'
import Squares from '@/components/backgrounds/Squares'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
}

export const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang={SITE_CONFIG.lang} className={SITE_CONFIG.theme}>
      <body className={inter.className}>
        <main className="relative">
          <div className="absolute inset-0">
            <Squares direction="diagonal" speed={0.1} />
          </div>
          <div className="relative">{children}</div>
        </main>
      </body>
    </html>
  )
}
