import { motion, AnimatePresence } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { cn, springConfig } from "~/lib/utils"

interface FloatingActionButtonProps {
  onClick: () => void
  isOpen: boolean
  className?: string
}

export function FloatingActionButton({
  onClick,
  isOpen,
  className
}: FloatingActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <AnimatePresence mode="wait">
      {!isOpen && (
        <motion.button
          key="fab"
          className={cn(
            "fixed bottom-6 right-6 z-[9999]",
            "w-14 h-14 rounded-full",
            "flex items-center justify-center",
            "gradient-primary text-white",
            "shadow-glow-lg hover:shadow-glow-xl",
            "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2",
            "transition-shadow duration-300",
            className
          )}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{
            y: 0,
            opacity: 1,
            scale: isHovered ? 1.05 : 1,
            boxShadow: isHovered
              ? "0 0 40px rgba(168, 85, 247, 0.7), 0 0 80px rgba(168, 85, 247, 0.4)"
              : undefined
          }}
          exit={{
            scale: 0.8,
            opacity: 0,
            transition: { duration: 0.2 }
          }}
          transition={springConfig.bouncy}
          whileTap={{ scale: 0.95 }}
          layoutId="fab-panel"
        >
          <motion.div
            className="absolute inset-0 rounded-full gradient-primary opacity-0"
            animate={{
              opacity: [0, 0.5, 0],
              scale: [1, 1.4, 1.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />

          <motion.div
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={springConfig.snappy}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
