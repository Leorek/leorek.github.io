import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface QuickLink {
  label: string
  href: string
  icon?: React.ReactNode
}

interface QuickLinksCardProps {
  links: QuickLink[]
}

export const QuickLinksCard = ({ links }: QuickLinksCardProps) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {links.map((link) => (
            <Button
              key={link.label}
              variant="outline"
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
              asChild
            >
              <a href={link.href}>
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.label}
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
