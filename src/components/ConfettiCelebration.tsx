import { useEffect, useCallback } from "react"
import confetti from "canvas-confetti"

interface ConfettiCelebrationProps {
  trigger: boolean
  origin?: { x: number; y: number }
}

export function ConfettiCelebration({
  trigger,
  origin = { x: 0.95, y: 0.95 }
}: ConfettiCelebrationProps) {
  const fireConfetti = useCallback(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 10000,
      colors: ["#a855f7", "#ec4899", "#f472b6", "#c084fc", "#d946ef"]
    }

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    confetti({
      particleCount: 100,
      spread: 70,
      origin,
      colors: ["#a855f7", "#ec4899", "#f472b6", "#c084fc", "#d946ef"],
      zIndex: 10000
    })
  }, [origin])

  useEffect(() => {
    if (trigger) {
      fireConfetti()
    }
  }, [trigger, fireConfetti])

  return null
}

export function fireSuccessConfetti(origin?: { x: number; y: number }) {
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 10000,
    colors: ["#a855f7", "#ec4899", "#f472b6", "#c084fc", "#d946ef"]
  }

  confetti({
    ...defaults,
    particleCount: 100,
    origin: origin ?? { x: 0.95, y: 0.95 }
  })

  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      origin: { x: 0.5, y: 0.3 }
    })
  }, 150)
}
