import React from 'react'
import { Inter } from 'next/font/google'
import './styles.css'

export const metadata = {
  description:
    "Hi! I'm Juan Alberto, a software engineer who loves building things for the web. Welcome to my personal corner of the internet.",
  title: 'Juan Alberto | Software Engineer',
}

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
