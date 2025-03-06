import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export const ContactCard = () => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Get in Touch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-zinc-400" />
          <a href="mailto:john.dev@example.com" className="text-zinc-300 hover:text-white">
            john.dev@example.com
          </a>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 bg-indigo-500 rounded-full"></div>
          <span className="text-zinc-300">Available for projects</span>
        </div>
      </CardContent>
    </Card>
  )
}
