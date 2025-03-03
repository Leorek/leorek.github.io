'use client'

import { useState, useRef, useEffect } from 'react'

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  cover: string
  duration: number
  url: string
}

export function useAudioPlayer(playlist: Song[]) {
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentSong = playlist[currentSongIndex]

  useEffect(() => {
    audioRef.current = new Audio(currentSong.url)
    audioRef.current.volume = volume

    const updateProgress = () => {
      if (audioRef.current) {
        const value = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(isNaN(value) ? 0 : value)
      }
    }

    const handleEnded = () => {
      if (currentSongIndex < playlist.length - 1) {
        setCurrentSongIndex((prev) => prev + 1)
      } else {
        setCurrentSongIndex(0)
        setIsPlaying(false)
      }
    }

    audioRef.current.addEventListener('timeupdate', updateProgress)
    audioRef.current.addEventListener('ended', handleEnded)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('timeupdate', updateProgress)
        audioRef.current.removeEventListener('ended', handleEnded)
      }
    }
  }, [currentSongIndex, playlist, volume, currentSong.url])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const playNextSong = () => {
    if (currentSongIndex < playlist.length - 1) {
      setCurrentSongIndex((prev) => prev + 1)
    } else {
      setCurrentSongIndex(0)
    }
    setIsPlaying(true)
  }

  const playPreviousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex((prev) => prev - 1)
    } else {
      setCurrentSongIndex(playlist.length - 1)
    }
    setIsPlaying(true)
  }

  const seekTo = (percent: number) => {
    if (audioRef.current) {
      const newTime = (percent / 100) * audioRef.current.duration
      audioRef.current.currentTime = newTime
      setProgress(percent)
    }
  }

  const changeVolume = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value
      setVolume(value)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'
  const totalDuration = audioRef.current ? formatTime(audioRef.current.duration) : '0:00'

  return {
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
  }
}
