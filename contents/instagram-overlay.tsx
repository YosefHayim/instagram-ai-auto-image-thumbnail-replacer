import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useState, useEffect, useCallback } from "react"
import { createRoot } from "react-dom/client"
import { LayoutGroup } from "framer-motion"
import cssText from "data-text:../src/style.css"

import { FloatingActionButton } from "../src/components/FloatingActionButton"
import { SidePanel } from "../src/components/SidePanel"
import { ImageOverlay, type OverlayState } from "../src/components/ImageOverlay"
import { ConfettiCelebration, fireSuccessConfetti } from "../src/components/ConfettiCelebration"
import {
  getInstagramFeedManager,
  type GridPost
} from "../src/lib/instagram-feed-manager"
import {
  getUserState,
  decrementCredits,
  setPremium,
  optimizeImage,
  createCheckout,
  onMessage,
  type MessageType
} from "../src/lib/messaging"

export const config: PlasmoCSConfig = {
  matches: ["https://www.instagram.com/*", "https://instagram.com/*"],
  all_frames: false,
  run_at: "document_idle"
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

interface PostState {
  state: OverlayState
  aiImage?: string
}

function InstagramAIOptimizer() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isOnProfile, setIsOnProfile] = useState(false)
  const [credits, setCredits] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [posts, setPosts] = useState<GridPost[]>([])
  const [postStates, setPostStates] = useState<Map<string, PostState>>(new Map())
  const [mountedOverlays, setMountedOverlays] = useState<Set<string>>(new Set())

  useEffect(() => {
    getUserState().then((state) => {
      setCredits(state.credits)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    const unsubscribe = onMessage((message: MessageType) => {
      if (message.type === "TOGGLE_PANEL") {
        setIsPanelOpen((prev) => !prev)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const manager = getInstagramFeedManager()

    const checkProfile = () => {
      setIsOnProfile(manager.isOnProfilePage())
    }

    checkProfile()

    const handleNavigation = () => {
      setTimeout(checkProfile, 500)
    }

    window.addEventListener("popstate", handleNavigation)

    const originalPushState = history.pushState
    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      handleNavigation()
    }

    return () => {
      window.removeEventListener("popstate", handleNavigation)
      history.pushState = originalPushState
    }
  }, [])

  useEffect(() => {
    if (!isOnProfile) return

    const manager = getInstagramFeedManager()
    manager.start()

    const unsubscribe = manager.subscribe((newPosts) => {
      setPosts((prev) => {
        const existing = new Set(prev.map((p) => p.postId))
        const filtered = newPosts.filter((p) => !existing.has(p.postId))
        return [...prev, ...filtered]
      })
    })

    return () => {
      unsubscribe()
      manager.stop()
    }
  }, [isOnProfile])

  useEffect(() => {
    posts.forEach((post) => {
      if (mountedOverlays.has(post.postId)) return

      const container = post.element
      if (!container) return

      const existingOverlay = container.querySelector("[data-ai-overlay]")
      if (existingOverlay) return

      const overlayContainer = document.createElement("div")
      overlayContainer.setAttribute("data-ai-overlay", post.postId)
      overlayContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10;
        pointer-events: auto;
      `

      const parentStyle = window.getComputedStyle(container)
      if (parentStyle.position === "static") {
        container.style.position = "relative"
      }

      container.appendChild(overlayContainer)

      const state = postStates.get(post.postId) || { state: "idle" as OverlayState }
      const root = createRoot(overlayContainer)

      root.render(
        <OverlayWrapper
          post={post}
          state={state}
          onUnlock={() => handleUnlock(post.postId)}
        />
      )

      setMountedOverlays((prev) => new Set(prev).add(post.postId))
    })
  }, [posts, postStates])

  const handleOptimizeSingle = useCallback(async () => {
    if (posts.length === 0) return

    setIsProcessing(true)
    const firstPost = posts[0]

    setPostStates((prev) => {
      const next = new Map(prev)
      next.set(firstPost.postId, { state: "scanning" })
      return next
    })

    try {
      const response = await optimizeImage(firstPost.imageUrl)
      const aiImage = response.aiImageUrl || firstPost.imageUrl

      setPostStates((prev) => {
        const next = new Map(prev)
        next.set(firstPost.postId, { state: "ready", aiImage })
        return next
      })

      const creditsResponse = await decrementCredits()
      setCredits(creditsResponse.credits)
    } catch (error) {
      console.error("Optimization failed:", error)
      setPostStates((prev) => {
        const next = new Map(prev)
        next.set(firstPost.postId, { state: "idle" })
        return next
      })
    }

    setIsProcessing(false)
  }, [posts])

  const handleOptimizeFull = useCallback(async () => {
    if (credits !== -1) return

    setIsProcessing(true)

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]

      setPostStates((prev) => {
        const next = new Map(prev)
        next.set(post.postId, { state: "scanning" })
        return next
      })

      try {
        const response = await optimizeImage(post.imageUrl)
        const aiImage = response.aiImageUrl || post.imageUrl

        setPostStates((prev) => {
          const next = new Map(prev)
          next.set(post.postId, { state: "ready", aiImage })
          return next
        })
      } catch (error) {
        console.error(`Optimization failed for post ${post.postId}:`, error)
      }
    }

    setIsProcessing(false)
    fireSuccessConfetti()
  }, [posts, credits])

  const handleUpgrade = useCallback(async () => {
    posts.slice(1).forEach((post) => {
      setPostStates((prev) => {
        const next = new Map(prev)
        const existing = prev.get(post.postId)
        if (!existing || existing.state === "idle") {
          next.set(post.postId, { state: "locked" })
        }
        return next
      })
    })

    try {
      const checkoutResponse = await createCheckout()
      if (checkoutResponse.url) {
        window.open(checkoutResponse.url, "_blank")
      }

      await setPremium(true)
      setCredits(-1)
      setShowConfetti(true)

      posts.forEach((post, index) => {
        setTimeout(() => {
          setPostStates((prev) => {
            const next = new Map(prev)
            const existing = prev.get(post.postId)
            if (existing?.state === "locked") {
              next.set(post.postId, { state: "idle" })
            }
            return next
          })
        }, index * 100)
      })

      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      console.error("Upgrade failed:", error)
    }
  }, [posts])

  const handleUnlock = useCallback((postId: string) => {
    handleUpgrade()
  }, [handleUpgrade])

  if (!isOnProfile) return null

  return (
    <LayoutGroup>
      <FloatingActionButton
        onClick={() => setIsPanelOpen(true)}
        isOpen={isPanelOpen}
      />

      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        credits={credits}
        isProcessing={isProcessing}
        onOptimizeSingle={handleOptimizeSingle}
        onOptimizeFull={handleOptimizeFull}
        onUpgrade={handleUpgrade}
      />

      <ConfettiCelebration trigger={showConfetti} />
    </LayoutGroup>
  )
}

interface OverlayWrapperProps {
  post: GridPost
  state: PostState
  onUnlock: () => void
}

function OverlayWrapper({ post, state, onUnlock }: OverlayWrapperProps) {
  if (state.state === "idle") return null

  return (
    <ImageOverlay
      originalImage={post.imageUrl}
      aiImage={state.aiImage}
      state={state.state}
      onUnlock={onUnlock}
    />
  )
}

export default InstagramAIOptimizer
