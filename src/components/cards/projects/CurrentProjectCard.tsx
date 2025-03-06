import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Project } from './types'

interface CurrentProjectCardProps {
  project: Project
}

const BADGE_ICONS = {
  N: 'N',
  TS: 'TS',
  HTML: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M12 18.178l-4.62-1.256-.328-3.544h2.27l.158 1.777 2.52.686 2.52-.686.21-2.344h-7.6l-.42-4.672h10.98l-.156 1.748h-8.82l.14 1.589h8.54l-.456 5.117L12 18.178z" />
    </svg>
  ),
}

export const CurrentProjectCard = ({ project }: CurrentProjectCardProps) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Current Project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link
          href={project.url || '#'}
          className="text-indigo-400 hover:text-indigo-300 text-lg font-medium"
        >
          {project.title}
        </Link>
        <p className="text-zinc-400 text-sm">{project.description}</p>
        <div className="flex gap-2">
          {project.technologies.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full"
            >
              {BADGE_ICONS[tech as keyof typeof BADGE_ICONS] || tech}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
