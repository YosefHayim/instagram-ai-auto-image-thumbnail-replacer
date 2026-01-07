export interface GridPost {
  element: HTMLElement
  imageUrl: string
  postId: string
}

export type GridPostCallback = (posts: GridPost[]) => void

const GRID_CONTAINER_SELECTORS = [
  "article",
  "[role='tabpanel']",
  "main [style*='flex-direction: column']"
]

const IMAGE_SELECTORS = [
  "img[srcset]",
  "img[src*='instagram']",
  "img:not([alt=''])"
]

export class InstagramFeedManager {
  private observer: MutationObserver | null = null
  private resizeObserver: ResizeObserver | null = null
  private posts: Map<string, GridPost> = new Map()
  private callbacks: Set<GridPostCallback> = new Set()
  private isProfilePage = false

  constructor() {
    this.checkIfProfilePage()
  }

  private checkIfProfilePage(): boolean {
    const path = window.location.pathname
    this.isProfilePage = /^\/[^\/]+\/?$/.test(path) &&
      !path.includes("/p/") &&
      !path.includes("/reel/") &&
      !path.includes("/stories/")
    return this.isProfilePage
  }

  private generatePostId(element: HTMLElement, imageUrl: string): string {
    const href = element.querySelector("a")?.getAttribute("href") || ""
    const shortcode = href.match(/\/p\/([^\/]+)/)?.[1]
    if (shortcode) return shortcode

    const urlHash = imageUrl.split("/").pop()?.split("?")[0] || ""
    return `post-${urlHash}-${Date.now()}`
  }

  private findGridPosts(): GridPost[] {
    const posts: GridPost[] = []

    const gridContainers = document.querySelectorAll(
      'article a[href*="/p/"], article a[href*="/reel/"]'
    )

    gridContainers.forEach((link) => {
      const container = link.closest("div")
      if (!container) return

      const img = container.querySelector("img") as HTMLImageElement
      if (!img || !img.src) return

      const postId = this.generatePostId(container as HTMLElement, img.src)

      if (!this.posts.has(postId)) {
        const post: GridPost = {
          element: container as HTMLElement,
          imageUrl: img.src,
          postId
        }
        posts.push(post)
        this.posts.set(postId, post)
      }
    })

    return posts
  }

  private handleMutations = (mutations: MutationRecord[]) => {
    let hasNewNodes = false

    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        hasNewNodes = true
        break
      }
    }

    if (hasNewNodes) {
      const newPosts = this.findGridPosts()
      if (newPosts.length > 0) {
        this.notifyCallbacks(newPosts)
      }
    }
  }

  private notifyCallbacks(posts: GridPost[]) {
    this.callbacks.forEach((callback) => callback(posts))
  }

  public start() {
    if (this.observer) return

    const initialPosts = this.findGridPosts()
    if (initialPosts.length > 0) {
      this.notifyCallbacks(initialPosts)
    }

    this.observer = new MutationObserver(this.handleMutations)
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    window.addEventListener("scroll", this.handleScroll, { passive: true })
  }

  private handleScroll = () => {
    requestAnimationFrame(() => {
      const newPosts = this.findGridPosts()
      if (newPosts.length > 0) {
        this.notifyCallbacks(newPosts)
      }
    })
  }

  public stop() {
    this.observer?.disconnect()
    this.observer = null
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    window.removeEventListener("scroll", this.handleScroll)
  }

  public subscribe(callback: GridPostCallback): () => void {
    this.callbacks.add(callback)

    const existingPosts = Array.from(this.posts.values())
    if (existingPosts.length > 0) {
      callback(existingPosts)
    }

    return () => {
      this.callbacks.delete(callback)
    }
  }

  public getPost(postId: string): GridPost | undefined {
    return this.posts.get(postId)
  }

  public getAllPosts(): GridPost[] {
    return Array.from(this.posts.values())
  }

  public isOnProfilePage(): boolean {
    return this.checkIfProfilePage()
  }
}

let managerInstance: InstagramFeedManager | null = null

export function getInstagramFeedManager(): InstagramFeedManager {
  if (!managerInstance) {
    managerInstance = new InstagramFeedManager()
  }
  return managerInstance
}
