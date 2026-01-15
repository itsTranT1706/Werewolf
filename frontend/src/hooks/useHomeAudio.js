/**
 * useHomeAudio - Two-stage background music system
 * 
 * Stage 1: Intro music (plays once, non-looping)
 * Stage 2: Ambient loop (seamless, continuous)
 * 
 * Auto-plays on first user interaction (click anywhere)
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const AUDIO_CONFIG = {
  introSrc: '/assets/audio/intro.mp3',
  loopSrc: '/assets/audio/intro.mp3',
  introVolume: 0.4,
  loopVolume: 0.25,
  fadeInDuration: 4000,  // 4 seconds fade in
  crossfadeDuration: 3000, // 3 seconds crossfade
}

export function useHomeAudio() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [stage, setStage] = useState('idle') // 'idle' | 'intro' | 'loop'

  const introRef = useRef(null)
  const loopRef = useRef(null)
  const fadeIntervalRef = useRef(null)
  const hasStartedRef = useRef(false)

  // Fade volume helper
  const fadeVolume = useCallback((audio, fromVol, toVol, duration, onComplete) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    const steps = 50
    const stepTime = duration / steps
    const volumeStep = (toVol - fromVol) / steps
    let currentStep = 0

    fadeIntervalRef.current = setInterval(() => {
      currentStep++
      const newVolume = Math.max(0, Math.min(1, fromVol + volumeStep * currentStep))
      if (audio) audio.volume = newVolume

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current)
        fadeIntervalRef.current = null
        onComplete?.()
      }
    }, stepTime)
  }, [])

  // Start audio
  const startAudio = useCallback(() => {
    if (hasStartedRef.current || !introRef.current) return
    hasStartedRef.current = true
    
    setIsPlaying(true)
    setStage('intro')

    introRef.current.volume = 0
    introRef.current.play().then(() => {
      fadeVolume(introRef.current, 0, AUDIO_CONFIG.introVolume, AUDIO_CONFIG.fadeInDuration)
    }).catch((err) => {
      console.warn('Audio autoplay blocked:', err)
      hasStartedRef.current = false
      setIsPlaying(false)
      setStage('idle')
    })
  }, [fadeVolume])

  // Initialize audio elements
  useEffect(() => {
    introRef.current = new Audio(AUDIO_CONFIG.introSrc)
    loopRef.current = new Audio(AUDIO_CONFIG.loopSrc)
    
    introRef.current.volume = 0
    loopRef.current.volume = 0
    loopRef.current.loop = true

    introRef.current.preload = 'auto'
    loopRef.current.preload = 'auto'

    // Handle intro end - transition to loop
    const handleIntroEnd = () => {
      setStage('loop')
      if (loopRef.current) {
        loopRef.current.volume = 0
        loopRef.current.play().then(() => {
          fadeVolume(loopRef.current, 0, AUDIO_CONFIG.loopVolume, AUDIO_CONFIG.crossfadeDuration)
        }).catch(() => {})
      }
    }

    introRef.current.addEventListener('ended', handleIntroEnd)

    // Auto-start on first click anywhere
    const handleFirstInteraction = () => {
      if (!hasStartedRef.current) {
        startAudio()
      }
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
    }

    document.addEventListener('click', handleFirstInteraction)
    document.addEventListener('keydown', handleFirstInteraction)

    return () => {
      introRef.current?.removeEventListener('ended', handleIntroEnd)
      introRef.current?.pause()
      loopRef.current?.pause()
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('keydown', handleFirstInteraction)
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [fadeVolume, startAudio])

  return {
    isPlaying,
    stage,
  }
}
