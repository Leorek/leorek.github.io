export interface Track {
  title: string
  artist: string
  url: string
}

export interface MusicPlayerState {
  isPlaying: boolean
  currentTrack: Track | null
  volume: number
  currentTime: number
  duration: number
}
