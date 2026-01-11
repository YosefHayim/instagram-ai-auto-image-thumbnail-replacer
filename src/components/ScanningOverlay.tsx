import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ScanningOverlayProps {
  isScanning: boolean
  className?: string
}

const processingMessages = [
  "Analyzing composition...",
  "Adjusting lighting...",
  "Enhancing colors...",
  "Optimizing contrast...",
  "Generating aesthetic..."
]

export function ScanningOverlay({ isScanning, className }: ScanningOverlayProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (!isScanning) {
      setMessageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % processingMessages.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [isScanning])

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          className={cn(
            "absolute inset-0 z-30 overflow-hidden",
            "bg-black/40 backdrop-blur-[2px]",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
            initial={{ top: "-4px" }}
            animate={{ top: "calc(100% + 4px)" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <motion.div
            className="absolute left-0 right-0 h-20 bg-gradient-to-b from-primary-400/30 via-primary-400/10 to-transparent"
            initial={{ top: "-80px" }}
            animate={{ top: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  className="text-sm font-medium text-white whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {processingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          </div>

          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 0%, transparent 49%, rgba(168, 85, 247, 0.3) 50%, transparent 51%, transparent 100%),
                linear-gradient(0deg, transparent 0%, transparent 49%, rgba(168, 85, 247, 0.3) 50%, transparent 51%, transparent 100%)
              `,
              backgroundSize: "20px 20px"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
