export const SITE_CONFIG = {
  title: 'Juan Alberto | Software Engineer',
  description:
    "Hi! I'm Juan Alberto, a software engineer who loves building things for the web. Welcome to my personal corner of the internet.",
  lang: 'en',
  theme: 'dark',
} as const

export type SiteConfig = typeof SITE_CONFIG
