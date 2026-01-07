import { Storage } from "@plasmohq/storage"

const storage = new Storage()

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await storage.set("credits", 1)
    await storage.set("isPremium", false)
    await storage.set("isAuthenticated", false)

    console.log("[Instagram AI Optimizer] Extension installed, defaults set")
  } else if (details.reason === "update") {
    console.log("[Instagram AI Optimizer] Extension updated to version", chrome.runtime.getManifest().version)
  }
})

chrome.action.onClicked.addListener((tab) => {
  if (tab.url?.includes("instagram.com")) {
    chrome.tabs.sendMessage(tab.id!, { type: "TOGGLE_PANEL" })
  }
})

type MessageType =
  | { type: "GET_AUTH_STATE" }
  | { type: "SET_AUTH_STATE"; payload: { isAuthenticated: boolean; userId?: string } }
  | { type: "GET_CREDITS" }
  | { type: "SET_CREDITS"; payload: number }
  | { type: "DECREMENT_CREDITS" }
  | { type: "SET_PREMIUM"; payload: boolean }
  | { type: "GET_USER_STATE" }
  | { type: "OPTIMIZE_IMAGE"; payload: { imageUrl: string; stylePreset?: string } }
  | { type: "CREATE_CHECKOUT" }

chrome.runtime.onMessage.addListener((message: MessageType, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse)
  return true
})

async function handleMessage(
  message: MessageType,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
) {
  try {
    switch (message.type) {
      case "GET_AUTH_STATE": {
        const isAuthenticated = await storage.get<boolean>("isAuthenticated")
        const userId = await storage.get<string>("userId")
        sendResponse({ isAuthenticated: isAuthenticated ?? false, userId })
        break
      }

      case "SET_AUTH_STATE": {
        await storage.set("isAuthenticated", message.payload.isAuthenticated)
        if (message.payload.userId) {
          await storage.set("userId", message.payload.userId)
        }
        sendResponse({ success: true })
        break
      }

      case "GET_CREDITS": {
        const credits = await storage.get<number>("credits")
        sendResponse({ credits: credits ?? 1 })
        break
      }

      case "SET_CREDITS": {
        await storage.set("credits", message.payload)
        sendResponse({ success: true })
        break
      }

      case "DECREMENT_CREDITS": {
        const currentCredits = await storage.get<number>("credits") ?? 1
        const isPremium = await storage.get<boolean>("isPremium")
        
        if (isPremium) {
          sendResponse({ credits: -1 })
        } else if (currentCredits > 0) {
          const newCredits = currentCredits - 1
          await storage.set("credits", newCredits)
          sendResponse({ credits: newCredits })
        } else {
          sendResponse({ credits: 0, error: "No credits remaining" })
        }
        break
      }

      case "SET_PREMIUM": {
        await storage.set("isPremium", message.payload)
        if (message.payload) {
          await storage.set("credits", -1)
        }
        sendResponse({ success: true })
        break
      }

      case "GET_USER_STATE": {
        const [isAuthenticated, isPremium, credits, userId] = await Promise.all([
          storage.get<boolean>("isAuthenticated"),
          storage.get<boolean>("isPremium"),
          storage.get<number>("credits"),
          storage.get<string>("userId")
        ])
        sendResponse({
          isAuthenticated: isAuthenticated ?? false,
          isPremium: isPremium ?? false,
          credits: isPremium ? -1 : (credits ?? 1),
          userId
        })
        break
      }

      case "OPTIMIZE_IMAGE": {
        sendResponse({
          success: true,
          aiImageUrl: message.payload.imageUrl
        })
        break
      }

      case "CREATE_CHECKOUT": {
        const checkoutUrl = "https://checkout.stripe.com/placeholder"
        sendResponse({ url: checkoutUrl })
        break
      }

      default:
        sendResponse({ error: "Unknown message type" })
    }
  } catch (error) {
    console.error("[Instagram AI Optimizer] Message handling error:", error)
    sendResponse({ error: String(error) })
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("instagram.com")) {
    chrome.tabs.sendMessage(tabId, { type: "PAGE_LOADED" }).catch(() => {
    })
  }
})
