import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const springConfig = {
  snappy: { type: "spring" as const, stiffness: 400, damping: 25 },
  bouncy: { type: "spring" as const, stiffness: 200, damping: 15, mass: 1 },
  smooth: { type: "spring" as const, stiffness: 100, damping: 20 },
  gentle: { type: "spring" as const, stiffness: 80, damping: 20, mass: 0.8 }
}

export const easingPresets = {
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  easeOutQuart: [0.25, 1, 0.5, 1] as const,
  easeInOutQuint: [0.83, 0, 0.17, 1] as const
}
