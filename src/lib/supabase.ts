import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.PLASMO_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: {
      getItem: async (key) => {
        const result = await chrome.storage.local.get(key)
        return result[key] ?? null
      },
      setItem: async (key, value) => {
        await chrome.storage.local.set({ [key]: value })
      },
      removeItem: async (key) => {
        await chrome.storage.local.remove(key)
      }
    }
  }
})

export interface Profile {
  id: string
  email: string
  credits: number
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface Optimization {
  id: string
  user_id: string
  original_url: string
  ai_url: string | null
  status: "pending" | "processing" | "completed" | "failed"
  style_preset: string | null
  created_at: string
  updated_at: string
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: chrome.identity.getRedirectURL()
    }
  })
  return { data, error }
}

export async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: chrome.identity.getRedirectURL()
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function createOptimization(
  userId: string,
  originalUrl: string,
  stylePreset?: string
): Promise<Optimization | null> {
  const { data, error } = await supabase
    .from("optimizations")
    .insert({
      user_id: userId,
      original_url: originalUrl,
      style_preset: stylePreset || null,
      status: "pending"
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating optimization:", error)
    return null
  }

  return data
}

export async function getOptimizationsByUser(userId: string): Promise<Optimization[]> {
  const { data, error } = await supabase
    .from("optimizations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching optimizations:", error)
    return []
  }

  return data || []
}

export async function updateOptimizationStatus(
  optimizationId: string,
  status: Optimization["status"],
  aiUrl?: string
): Promise<boolean> {
  const updateData: Partial<Optimization> = { status }
  if (aiUrl) {
    updateData.ai_url = aiUrl
  }

  const { error } = await supabase
    .from("optimizations")
    .update(updateData)
    .eq("id", optimizationId)

  if (error) {
    console.error("Error updating optimization:", error)
    return false
  }

  return true
}

export async function decrementCredits(userId: string): Promise<number | null> {
  const { data, error } = await supabase.rpc("decrement_credits", {
    user_id: userId
  })

  if (error) {
    console.error("Error decrementing credits:", error)
    return null
  }

  return data
}

export async function createCheckoutSession(userId: string, priceId: string) {
  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: { userId, priceId }
  })

  if (error) {
    console.error("Error creating checkout:", error)
    return null
  }

  return data
}

export async function generateThumbnail(
  imageUrl: string,
  stylePreset?: string
) {
  const { data, error } = await supabase.functions.invoke("generate-thumbnail", {
    body: { imageUrl, stylePreset }
  })

  if (error) {
    console.error("Error generating thumbnail:", error)
    return null
  }

  return data
}
