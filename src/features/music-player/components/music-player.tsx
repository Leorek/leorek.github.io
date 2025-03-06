'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAudioPlayer, type Song } from '@/features/music-player/hooks/useAudioPlayer'

// Sample playlist data
const samplePlaylist: Song[] = [
  {
    id: '1',
    title: 'Synthwave Dreams',
    artist: 'Neon Rider',
    album: 'Digital Horizons',
    cover: '/placeholder.svg?height=300&width=300',
    duration: 237,
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3',
  },
  {
    id: '2',
    title: 'Midnight Cruise',
    artist: 'Retrowave',
    album: 'Night Drive',
    cover: '/placeholder.svg?height=300&width=300',
    duration: 184,
    url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc8e82a.mp3?filename=electronic-rock-king-around-here-15045.mp3',
  },
  {
    id: '3',
    title: 'Cyber City',
    artist: 'Digital Pulse',
    album: 'Neon Streets',
    cover: '/placeholder.svg?height=300&width=300',
    duration: 195,
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=the-beat-of-nature-122841.mp3',
  },
  {
    id: '4',
    title: 'Retro Gaming',
    artist: '8-Bit Heroes',
    album: 'Arcade Memories',
    cover: '/placeholder.svg?height=300&width=300',
    duration: 210,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8c567b7.mp3?filename=chiptune-grooving-142242.mp3',
  },
]

export function MusicPlayer() {
  const [showVolume, setShowVolume] = useState(false)
  const {
    currentSong,
    isPlaying,
    progress,
    volume,
    currentTime,
    totalDuration,
    togglePlayPause,
    playNextSong,
    playPreviousSong,
    seekTo,
    changeVolume,
    playlist,
    currentSongIndex,
    setCurrentSongIndex,
  } = useAudioPlayer(samplePlaylist)

  return (
    <Card className="bg-zinc-900 border-zinc-800 col-span-full md:col-span-2">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Album Art */}
          <div className="relative aspect-square w-full max-w-[200px] mx-auto md:mx-0">
            <Image
              src={currentSong.cover || '/placeholder.svg'}
              alt={`${currentSong.title} album cover`}
              fill
              className="object-cover rounded-md"
            />
          </div>

          {/* Player Controls */}
          <div className="flex flex-col flex-1 justify-between">
            <div>
              <h3 className="text-xl font-bold line-clamp-1">{currentSong.title}</h3>
              <p className="text-zinc-400">{currentSong.artist}</p>
              <p className="text-zinc-500 text-sm">{currentSong.album}</p>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-400 tabular-nums">{currentTime}</span>
                <Slider
                  value={[progress]}
                  max={100}
                  step={0.1}
                  className="flex-1"
                  onValueChange={(value) => seekTo(value[0])}
                />
                <span className="text-xs text-zinc-400 tabular-nums">{totalDuration}</span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={() => setShowVolume(!showVolume)}
                  >
                    {volume === 0 ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                  </Button>

                  {showVolume && (
                    <div className="w-24">
                      <Slider
                        value={[volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(value) => changeVolume(value[0] / 100)}
                      />
                    </div>
                  )}

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <ListMusic className="size-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
                      <SheetHeader>
                        <SheetTitle className="text-white">Playlist</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-1">
                        {playlist.map((song, index) => (
                          <button
                            key={song.id}
                            className={`w-full text-left p-3 rounded-md flex items-center gap-3 hover:bg-zinc-800 transition-colors ${
                              currentSongIndex === index ? 'bg-zinc-800' : ''
                            }`}
                            onClick={() => {
                              setCurrentSongIndex(index)
                            }}
                          >
                            <div className="relative size-10 flex-shrink-0">
                              <Image
                                src={song.cover || '/placeholder.svg'}
                                alt={`${song.title} cover`}
                                fill
                                className="object-cover rounded-sm"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium line-clamp-1">{song.title}</p>
                              <p className="text-sm text-zinc-400 line-clamp-1">{song.artist}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={playPreviousSong}
                  >
                    <SkipBack className="size-5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-12 rounded-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={playNextSong}
                  >
                    <SkipForward className="size-5" />
                  </Button>
                </div>

                <div className="w-[72px]">{/* Empty div to balance the layout */}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
