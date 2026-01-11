import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"
import { cn, springConfig } from "@/lib/utils"

interface LockedOverlayProps {
  isLocked: boolean
  onUnlock?: () => void
  index?: number
  className?: string
}

export function LockedOverlay({
  isLocked,
  onUnlock,
  index = 0,
  className
}: LockedOverlayProps) {
  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          className={cn(
            "absolute inset-0 z-20",
            "flex items-center justify-center",
            "cursor-pointer",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            transition: {
              delay: index * 0.05,
              duration: 0.4
            }
          }}
          onClick={onUnlock}
          style={{
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/40 to-black/50"
          />

          <motion.div
            className={cn(
              "relative z-10",
              "w-12 h-12 rounded-full",
              "bg-white/90 backdrop-blur-sm",
              "flex items-center justify-center",
              "shadow-xl"
            )}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{
              scale: 0,
              rotate: 180,
              transition: { delay: index * 0.05 }
            }}
            transition={springConfig.bouncy}
            whileHover={{ scale: 1.1 }}
          >
            <Lock className="w-5 h-5 text-primary-600" />
          </motion.div>

          <motion.div
            className="absolute bottom-3 left-3 right-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
              <p className="text-xs text-white text-center font-medium">
                Unlock to reveal
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
