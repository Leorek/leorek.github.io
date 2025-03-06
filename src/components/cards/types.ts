export interface Project {
  title: string
  description: string
  technologies: string[]
  url?: string
}

export interface GameProject {
  title: string
  platform: string
  engine: 'Unity' | 'Unreal Engine' | 'Custom'
  description?: string
}

export interface BlogPost {
  title: string
  thumbnail: string
  readTime: string
  date: string
  description?: string
}

export interface QuickLink {
  label: string
  href: string
  icon?: React.ReactNode
}
