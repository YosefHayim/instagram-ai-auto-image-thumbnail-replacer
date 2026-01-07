import { motion, AnimatePresence } from "framer-motion"
import { X, Wand2, Lock, CreditCard, Check } from "lucide-react"
import { cn, springConfig } from "~/lib/utils"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  credits: number
  isProcessing: boolean
  onOptimizeSingle: () => void
  onOptimizeFull: () => void
  onUpgrade: () => void
}

export function SidePanel({
  isOpen,
  onClose,
  credits,
  isProcessing,
  onOptimizeSingle,
  onOptimizeFull,
  onUpgrade
}: SidePanelProps) {
  const hasFreeCredits = credits > 0 || credits === -1
  const isPremium = credits === -1

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            layoutId="fab-panel"
            className={cn(
              "fixed right-6 bottom-6 z-[9999]",
              "w-80 rounded-2xl overflow-hidden",
              "glass shadow-2xl border border-white/20"
            )}
            initial={{ width: 56, height: 56 }}
            animate={{ width: 320, height: "auto" }}
            exit={{ width: 56, height: 56, opacity: 0 }}
            transition={springConfig.bouncy}
          >
            <div className="gradient-primary p-4">
              <div className="flex items-center justify-between">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Wand2 className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">AI Optimizer</h2>
                </motion.div>
                <motion.button
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              <motion.div
                className="mt-3 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                  {isPremium ? "Premium" : `${credits} credits`}
                </div>
              </motion.div>
            </div>

            <div className="p-4 space-y-3">
              <motion.button
                className={cn(
                  "w-full p-4 rounded-xl text-left",
                  "bg-gradient-to-r from-primary-50 to-accent-50",
                  "border border-primary-200",
                  "hover:shadow-glow-sm transition-all duration-200",
                  isProcessing && "opacity-50 pointer-events-none"
                )}
                onClick={onOptimizeSingle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isProcessing}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Try 1 Image</p>
                    <p className="text-sm text-gray-500">See the AI magic</p>
                  </div>
                  {hasFreeCredits && (
                    <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Free
                    </span>
                  )}
                </div>
              </motion.button>

              <motion.button
                className={cn(
                  "w-full p-4 rounded-xl text-left",
                  "bg-white border border-gray-200",
                  "hover:border-primary-300 hover:shadow-glow-sm",
                  "transition-all duration-200",
                  (!isPremium || isProcessing) && "opacity-75"
                )}
                onClick={isPremium ? onOptimizeFull : onUpgrade}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isProcessing}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    isPremium ? "gradient-primary" : "bg-gray-100"
                  )}>
                    {isPremium ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Optimize Full Feed</p>
                    <p className="text-sm text-gray-500">
                      {isPremium ? "Transform all images" : "Unlock premium features"}
                    </p>
                  </div>
                </div>
              </motion.button>

              {!isPremium && (
                <motion.button
                  className={cn(
                    "w-full p-4 rounded-xl",
                    "gradient-primary text-white font-semibold",
                    "shadow-glow-md hover:shadow-glow-lg",
                    "transition-all duration-200"
                  )}
                  onClick={onUpgrade}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Upgrade for $1.00</span>
                  </div>
                </motion.button>
              )}
            </div>

            {isProcessing && (
              <motion.div
                className="px-4 pb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="p-3 rounded-xl bg-primary-50 border border-primary-100">
                  <ProcessingIndicator />
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ProcessingIndicator() {
  const messages = [
    "Analyzing composition...",
    "Adjusting lighting...",
    "Enhancing colors...",
    "Generating aesthetic..."
  ]

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary-200"
          style={{ borderTopColor: "#a855f7" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        className="text-sm text-primary-700 font-medium"
        key={messages[0]}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {messages[0]}
      </motion.p>
    </div>
  )
}
