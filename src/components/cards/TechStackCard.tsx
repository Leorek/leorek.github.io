import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TECH_STACK = [
  {
    name: 'React',
    icon: (
      <svg viewBox="0 0 24 24" className="size-6 text-[#61DAFB]" fill="currentColor">
        <path d="M12 13.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  { name: 'TypeScript', icon: <span className="text-sm font-bold">TS</span> },
  {
    name: 'Node.js',
    icon: (
      <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
        <path d="M12 21.985c-.275 0-.532-.074-.772-.202l-2.439-1.448c-.365-.203-.182-.277-.072-.314.496-.165.588-.201 1.101-.493.056-.037.129-.02.185.017l1.87 1.12c.074.036.166.036.221 0l7.319-4.237c.074-.036.11-.11.11-.202V7.768c0-.091-.036-.165-.11-.201l-7.319-4.219c-.073-.037-.165-.037-.221 0L4.552 7.566c-.073.036-.11.129-.11.201v8.457c0 .073.037.166.11.202l2 1.157c1.082.548 1.762-.095 1.762-.735V8.502c0-.11.091-.221.22-.221h.936c.108 0 .22.092.22.221v8.347c0 1.449-.788 2.294-2.164 2.294-.422 0-.752 0-1.688-.46l-1.925-1.099a1.55 1.55 0 01-.771-1.34V7.786c0-.55.293-1.064.771-1.339l7.316-4.237a1.637 1.637 0 011.544 0l7.317 4.237c.479.274.771.789.771 1.339v8.458c0 .549-.293 1.063-.771 1.34l-7.317 4.236c-.241.11-.516.165-.773.165zm2.256-5.816c-3.21 0-3.87-1.468-3.87-2.714 0-.11.092-.221.22-.221h.954c.11 0 .201.073.201.184.147.971.568 1.449 2.514 1.449 1.54 0 2.202-.35 2.202-1.175 0-.477-.185-.825-2.587-1.063-1.999-.2-3.246-.643-3.246-2.238 0-1.485 1.247-2.366 3.339-2.366 2.347 0 3.503.809 3.649 2.568a.297.297 0 01-.056.165c-.037.036-.091.073-.146.073h-.953a.212.212 0 01-.202-.164c-.221-1.012-.789-1.34-2.292-1.34-1.689 0-1.891.587-1.891 1.027 0 .531.237.696 2.514.99 2.256.293 3.32.715 3.32 2.294-.02 1.615-1.339 2.531-3.67 2.531z" />
      </svg>
    ),
  },
  {
    name: 'Tailwind',
    icon: (
      <svg viewBox="0 0 24 24" className="size-6 text-[#38BDF8]" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
      </svg>
    ),
  },
  { name: 'Unity', icon: <span className="text-sm font-bold">U</span> },
  { name: 'Unreal', icon: <span className="text-sm font-bold">UE</span> },
  { name: 'C#', icon: <span className="text-sm font-bold">C#</span> },
]

export const TechStackCard = () => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Tech Stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-6">
          {TECH_STACK.map((tech) => (
            <div key={tech.name} className="flex flex-col items-center gap-2">
              <div className="size-10 flex items-center justify-center bg-zinc-800 rounded-md">
                {tech.icon}
              </div>
              <span className="text-xs text-zinc-400">{tech.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
