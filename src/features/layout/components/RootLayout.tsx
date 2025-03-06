import React from 'react'
import { Inter } from 'next/font/google'
import { LAYOUT_CONSTANTS } from '../constants'
import { LayoutProps } from '../types'

const inter = Inter({ subsets: ['latin'] })

export const RootLayout = ({ children }: LayoutProps) => {
  return (
    <html lang={LAYOUT_CONSTANTS.LANG} className={LAYOUT_CONSTANTS.THEME}>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
