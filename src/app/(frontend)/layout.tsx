import React from 'react'
import './styles.css'
import { RootLayout } from '@/components/layouts/RootLayout'
import { SITE_CONFIG } from '@/config/site'

export const metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>
}
