import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'

export const GitHubCard = () => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-2">
        <Github className="size-5" />
        <CardTitle>GitHub</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 49 }).map((_, i) => (
            <div
              key={i}
              className={`size-4 rounded-sm ${
                [10, 11, 17, 18, 24, 25, 31, 32, 38, 39, 45, 46].includes(i)
                  ? 'bg-indigo-500'
                  : [16, 23, 30, 37, 44].includes(i)
                    ? 'bg-indigo-700'
                    : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <p className="text-sm mt-4">526 contributions this year</p>
      </CardContent>
    </Card>
  )
}
