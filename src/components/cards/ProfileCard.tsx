import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Github, Linkedin, Twitter } from 'lucide-react'
import AvatarImage from '@/assets/leorek-avatar.jpg'

export const ProfileCard = () => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-6 flex flex-col items-center md:items-start gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <Image
            src={AvatarImage}
            alt="Juan Alberto"
            width={100}
            height={100}
            className="rounded-full"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">Juan Alberto</h1>
            <p className="text-zinc-400">Software Engineer & Game Enthusiast</p>
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          <Link href="https://github.com" aria-label="GitHub">
            <Github className="size-6 text-zinc-400 hover:text-white transition-colors" />
          </Link>
          <Link href="https://linkedin.com" aria-label="LinkedIn">
            <Linkedin className="size-6 text-zinc-400 hover:text-white transition-colors" />
          </Link>
          <Link href="https://twitter.com" aria-label="Twitter">
            <Twitter className="size-6 text-zinc-400 hover:text-white transition-colors" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
