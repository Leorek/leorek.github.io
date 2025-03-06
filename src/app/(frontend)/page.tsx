import { Download } from 'lucide-react'
import { ProfileCard } from '@/components/cards/ProfileCard'
import { TechStackCard } from '@/components/cards/TechStackCard'
import { GitHubCard } from '@/components/cards/GitHubCard'
import { ContactCard } from '@/components/cards/ContactCard'
import { MusicPlayer } from '@/features/music-player/components/music-player'
import { CurrentProjectCard } from '@/components/cards/CurrentProjectCard'
import { GameProjectsCard } from '@/components/cards/GameProjectsCard'
import { LatestPostCard } from '@/components/cards/LatestPostCard'
import { QuickLinksCard } from '@/components/cards/QuickLinksCard'

const currentProject = {
  title: 'GameDev Portfolio',
  description: 'A showcase platform for game developers built with Next.js and Three.js',
  technologies: ['N', 'TS', 'HTML'],
  url: '#',
}

const gameProjects = [
  {
    title: 'Pixel Runner',
    platform: 'Unity 2D Platformer',
    engine: 'Unity' as const,
  },
  {
    title: 'Space Shooter',
    platform: 'Unreal Engine',
    engine: 'Unreal Engine' as const,
  },
]

const latestPost = {
  title: 'Building Games with React Three Fiber',
  thumbnail: '/placeholder.svg?height=200&width=400',
  readTime: '5 min read',
  date: 'Feb 15, 2024',
}

const quickLinks = [
  {
    label: 'Resume',
    href: '#',
    icon: <Download className="size-4" />,
  },
  {
    label: 'Portfolio',
    href: '#',
  },
  {
    label: 'Blog',
    href: '#',
  },
  {
    label: 'Projects',
    href: '#',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <ProfileCard />
        <MusicPlayer />
        <CurrentProjectCard project={currentProject} />
        <TechStackCard />
        <GitHubCard />
        <GameProjectsCard projects={gameProjects} />
        <LatestPostCard post={latestPost} />
        <ContactCard />
        <QuickLinksCard links={quickLinks} />
      </div>
    </div>
  )
}
