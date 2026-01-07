import { motion, useMotionValue, useTransform, useSpring, PanInfo } from "framer-motion"
import { useRef, useState, useCallback } from "react"
import { cn, springConfig } from "~/lib/utils"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  className?: string
  onSlideComplete?: (position: number) => void
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  className,
  onSlideComplete
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  const x = useMotionValue(0)
  const springX = useSpring(x, springConfig.snappy)
  const sliderPosition = useTransform(springX, (val) => {
    if (containerWidth === 0) return 50
    const percent = ((val + containerWidth / 2) / containerWidth) * 100
    return Math.max(0, Math.min(100, percent))
  })

  const clipPath = useTransform(sliderPosition, (pos) => `inset(0 ${100 - pos}% 0 0)`)

  const handleDragStart = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
    setIsDragging(true)
  }, [])

  const handleDrag = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const newX = Math.max(
        -containerRect.width / 2,
        Math.min(containerRect.width / 2, info.point.x - containerRect.left - containerRect.width / 2)
      )
      x.set(newX)
    }
  }, [x])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    const currentPosition = sliderPosition.get()
    onSlideComplete?.(currentPosition)

    if (currentPosition > 95) {
      x.set(containerWidth / 2)
    } else if (currentPosition < 5) {
      x.set(-containerWidth / 2)
    }
  }, [sliderPosition, onSlideComplete, x, containerWidth])

  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && !isDragging) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerWidth(rect.width)
      const clickX = e.clientX - rect.left - rect.width / 2
      x.set(clickX)
    }
  }, [isDragging, x])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden cursor-ew-resize select-none",
        className
      )}
      onClick={handleContainerClick}
    >
      <img
        src={beforeImage}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      <motion.div
        className="absolute inset-0"
        style={{ clipPath }}
      >
        <img
          src={afterImage}
          alt="After"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      <motion.div
        className="absolute top-0 bottom-0 flex items-center justify-center z-20"
        style={{ left: useTransform(sliderPosition, (pos) => `${pos}%`), x: "-50%" }}
      >
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          className="relative flex items-center justify-center touch-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute h-full w-[2px] bg-white shadow-lg" style={{ height: "200vh" }} />

          <motion.div
            className={cn(
              "relative w-10 h-10 rounded-full flex items-center justify-center",
              "bg-white shadow-xl border-2 border-white",
              "transition-shadow duration-200"
            )}
            animate={{
              boxShadow: isDragging
                ? "0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4)"
                : "0 0 20px rgba(0, 0, 0, 0.3)"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary-600">
              <path
                d="M6 10L3 7M3 7L6 4M3 7H9M14 10L17 13M17 13L14 16M17 13H11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Before
      </motion.div>

      <motion.div
        className="absolute top-3 right-3 px-2 py-1 text-xs font-medium gradient-primary text-white rounded-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        AI Enhanced
      </motion.div>
    </div>
  )
}
