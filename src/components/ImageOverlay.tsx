import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { BeforeAfterSlider } from "./BeforeAfterSlider"
import { ScanningOverlay } from "./ScanningOverlay"
import { LockedOverlay } from "./LockedOverlay"
import { cn, springConfig } from "@/lib/utils"

export type OverlayState = "idle" | "scanning" | "ready" | "locked"

interface ImageOverlayProps {
  originalImage: string
  aiImage?: string
  state: OverlayState
  index?: number
  onUnlock?: () => void
  className?: string
}

export function ImageOverlay({
  originalImage,
  aiImage,
  state,
  index = 0,
  onUnlock,
  className
}: ImageOverlayProps) {
  const [hasInteracted, setHasInteracted] = useState(false)

  const handleSlideComplete = (position: number) => {
    if (position > 90 && !hasInteracted) {
      setHasInteracted(true)
    }
  }

  return (
    <motion.div
      className={cn(
        "absolute inset-0 z-10",
        "overflow-hidden",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <AnimatePresence mode="wait">
        {state === "scanning" && (
          <ScanningOverlay key="scanning" isScanning={true} />
        )}

        {state === "ready" && aiImage && (
          <motion.div
            key="ready"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={springConfig.smooth}
          >
            <BeforeAfterSlider
              beforeImage={originalImage}
              afterImage={aiImage}
              onSlideComplete={handleSlideComplete}
              showActions={false}
            />
          </motion.div>
        )}

        {state === "locked" && (
          <LockedOverlay
            key="locked"
            isLocked={true}
            onUnlock={onUnlock}
            index={index}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
