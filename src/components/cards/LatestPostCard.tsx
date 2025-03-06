import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BlogPost } from './projects/types'

interface LatestPostCardProps {
  post: BlogPost
}

export const LatestPostCard = ({ post }: LatestPostCardProps) => {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle>Latest Post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-md overflow-hidden">
          <Image
            src={post.thumbnail}
            alt={`${post.title} thumbnail`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">{post.title}</h3>
          {post.description && <p className="text-sm text-zinc-400 mt-1">{post.description}</p>}
          <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
            <span>{post.readTime}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
