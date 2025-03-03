import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Github,
  Linkedin,
  Twitter,
  Download,
  GamepadIcon as GameController,
  Mail,
} from 'lucide-react'
import { MusicPlayer } from '@/components/music-player'
import AvatarImage from '@/assets/leorek-avatar.jpg'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
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

        {/* Music Player Card - Add this */}
        <MusicPlayer />

        {/* Current Project Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Current Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="#" className="text-indigo-400 hover:text-indigo-300 text-lg font-medium">
              GameDev Portfolio
            </Link>
            <p className="text-zinc-400 text-sm">
              A showcase platform for game developers built with Next.js and Three.js
            </p>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full"
              >
                N
              </Badge>
              <Badge
                variant="outline"
                className="bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                  <path d="M12 18.178l-4.62-1.256-.328-3.544h2.27l.158 1.777 2.52.686 2.52-.686.21-2.344h-7.6l-.42-4.672h10.98l-.156 1.748h-8.82l.14 1.589h8.54l-.456 5.117L12 18.178z" />
                </svg>
              </Badge>
              <Badge
                variant="outline"
                className="bg-zinc-800 text-zinc-300 border-zinc-700 rounded-full"
              >
                TS
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Gaming Stats Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center gap-2">
            <GameController className="size-5" />
            <CardTitle>Gaming Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-zinc-400 text-sm">Currently Playing</p>
              <p className="font-medium">Cyberpunk 2077</p>
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Recent Achievement</p>
              <p className="font-medium">Night City Legend</p>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <svg viewBox="0 0 24 24" className="size-6 text-[#61DAFB]" fill="currentColor">
                    <path d="M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">React</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <span className="text-sm font-bold">TS</span>
                </div>
                <span className="text-xs text-zinc-400">TypeScript</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
                    <path d="M12 21.985c-.275 0-.532-.074-.772-.202l-2.439-1.448c-.365-.203-.182-.277-.072-.314.496-.165.588-.201 1.101-.493.056-.037.129-.02.185.017l1.87 1.12c.074.036.166.036.221 0l7.319-4.237c.074-.036.11-.11.11-.202V7.768c0-.091-.036-.165-.11-.201l-7.319-4.219c-.073-.037-.165-.037-.221 0L4.552 7.566c-.073.036-.11.129-.11.201v8.457c0 .073.037.166.11.202l2 1.157c1.082.548 1.762-.095 1.762-.735V8.502c0-.11.091-.221.22-.221h.936c.108 0 .22.092.22.221v8.347c0 1.449-.788 2.294-2.164 2.294-.422 0-.752 0-1.688-.46l-1.925-1.099a1.55 1.55 0 01-.771-1.34V7.786c0-.55.293-1.064.771-1.339l7.316-4.237a1.637 1.637 0 011.544 0l7.317 4.237c.479.274.771.789.771 1.339v8.458c0 .549-.293 1.063-.771 1.34l-7.317 4.236c-.241.11-.516.165-.773.165zm2.256-5.816c-3.21 0-3.87-1.468-3.87-2.714 0-.11.092-.221.22-.221h.954c.11 0 .201.073.201.184.147.971.568 1.449 2.514 1.449 1.54 0 2.202-.35 2.202-1.175 0-.477-.185-.825-2.587-1.063-1.999-.2-3.246-.643-3.246-2.238 0-1.485 1.247-2.366 3.339-2.366 2.347 0 3.503.809 3.649 2.568a.297.297 0 01-.056.165c-.037.036-.091.073-.146.073h-.953a.212.212 0 01-.202-.164c-.221-1.012-.789-1.34-2.292-1.34-1.689 0-1.891.587-1.891 1.027 0 .531.237.696 2.514.99 2.256.293 3.32.715 3.32 2.294-.02 1.615-1.339 2.531-3.67 2.531z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Node.js</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <svg viewBox="0 0 24 24" className="size-6 text-[#38BDF8]" fill="currentColor">
                    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Tailwind</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
                    <path d="M19.14 7.5A2.86 2.86 0 0122 10.36v3.78A2.86 2.86 0 0119.14 17H12c0 .39.32.71.71.71H17v2.58h-4.29A3.29 3.29 0 019.43 17H4.86A2.86 2.86 0 012 14.14v-3.78A2.86 2.86 0 014.86 7.5h6.28c0-.39-.32-.71-.71-.71H6v-2.5h4.43A3.29 3.29 0 0114.71 7.5h4.43m-4.29 2.57h-6.5c-.31 0-.57.26-.57.57v1.71c0 .31.26.57.57.57h6.5c.71 0 1.29-.57 1.29-1.28v-.29c0-.71-.58-1.28-1.29-1.28m4.29-1.07h-1.15a.58.58 0 00-.57.57.58.58 0 00.57.57h1.15c.31 0 .57-.26.57-.57a.58.58 0 00-.57-.57m0 1.7h-1.15a.58.58 0 00-.57.58c0 .31.26.57.57.57h1.15c.31 0 .57-.26.57-.57a.58.58 0 00-.57-.58z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Unity</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
                    <path d="M12.007 0L1.301 6.203V18L12.007 24l10.695-6V6.203L12.007 0zm-8.696 16.501V7.809l8.07 4.523v8.91l-8.07-4.741zm17.184 0l-7.987 4.731v-8.91l7.987-4.523v8.702zm-8.07-14.405l7.778 4.525-7.778 4.392-7.889-4.351 7.889-4.566z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400">Unreal</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                  <span className="text-sm font-bold">C#</span>
                </div>
                <span className="text-xs text-zinc-400">C#</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Post Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Latest Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video rounded-md overflow-hidden">
              <Image
                src="/placeholder.svg?height=200&width=400"
                alt="Blog post thumbnail"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium">Building Games with React Three Fiber</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
                <span>5 min read</span>
                <span>•</span>
                <span>Feb 15, 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GitHub Card */}
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

        {/* Game Projects Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center gap-2">
            <GameController className="size-5" />
            <CardTitle>Game Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-800 p-4 rounded-md">
                <h3 className="font-medium">Pixel Runner</h3>
                <p className="text-xs text-zinc-400">Unity 2D Platformer</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-md">
                <h3 className="font-medium">Space Shooter</h3>
                <p className="text-xs text-zinc-400">Unreal Engine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get in Touch Card */}
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

        {/* Quick Links Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                <Download className="size-4 mr-2" />
                Resume
              </Button>
              <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                Portfolio
              </Button>
              <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                Blog
              </Button>
              <Button variant="outline" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
