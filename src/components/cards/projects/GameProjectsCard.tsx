import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GamepadIcon as GameController } from 'lucide-react'
import { GameProject } from './types'

interface GameProjectsCardProps {
  projects: GameProject[]
}

export const GameProjectsCard = ({ projects }: GameProjectsCardProps) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-2">
        <GameController className="size-5" />
        <CardTitle>Game Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project.title} className="bg-zinc-800 p-4 rounded-md">
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-xs text-zinc-400">{project.platform}</p>
              {project.description && (
                <p className="text-sm text-zinc-400 mt-2">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
