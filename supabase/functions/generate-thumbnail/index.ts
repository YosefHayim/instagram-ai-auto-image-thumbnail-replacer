import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || ""
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY") || ""

interface GenerateRequest {
  imageUrl: string
  stylePreset?: string
  optimizationId?: string
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { imageUrl, stylePreset, optimizationId }: GenerateRequest = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing imageUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (optimizationId) {
      await supabase
        .from("optimizations")
        .update({ status: "processing" })
        .eq("id", optimizationId)
    }

    let aiImageUrl: string

    if (REPLICATE_API_KEY) {
      aiImageUrl = await generateWithReplicate(imageUrl, stylePreset)
    } else if (GEMINI_API_KEY) {
      aiImageUrl = await generateWithGemini(imageUrl, stylePreset)
    } else {
      aiImageUrl = imageUrl
    }

    if (optimizationId) {
      await supabase
        .from("optimizations")
        .update({
          status: "completed",
          ai_url: aiImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", optimizationId)
    }

    return new Response(
      JSON.stringify({ aiImageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error generating thumbnail:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

async function generateWithReplicate(
  imageUrl: string,
  stylePreset?: string
): Promise<string> {
  const prompt = buildPrompt(stylePreset)

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f",
      input: {
        image: imageUrl,
        prompt: prompt,
        guidance_scale: 7.5,
        num_inference_steps: 30
      }
    })
  })

  const prediction = await response.json()

  let result = prediction
  while (result.status !== "succeeded" && result.status !== "failed") {
    await new Promise((r) => setTimeout(r, 1000))
    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      {
        headers: { Authorization: `Token ${REPLICATE_API_KEY}` }
      }
    )
    result = await pollResponse.json()
  }

  if (result.status === "failed") {
    throw new Error("Replicate generation failed")
  }

  return result.output[0] || imageUrl
}

async function generateWithGemini(
  imageUrl: string,
  stylePreset?: string
): Promise<string> {
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))

  const prompt = buildPrompt(stylePreset)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              },
              { text: prompt }
            ]
          }
        ]
      })
    }
  )

  const result = await response.json()

  return imageUrl
}

function buildPrompt(stylePreset?: string): string {
  const basePrompt =
    "Enhance this Instagram photo to make it more visually appealing. " +
    "Improve lighting, colors, and composition while maintaining the original subject matter. " +
    "Make it look professional and aesthetically pleasing."

  const stylePrompts: Record<string, string> = {
    cinematic: "Apply a cinematic color grade with dramatic lighting and film-like tones.",
    vibrant: "Boost colors and saturation for a vibrant, eye-catching look.",
    minimal: "Create a clean, minimal aesthetic with soft colors and balanced exposure.",
    vintage: "Apply a nostalgic vintage filter with warm tones and subtle grain.",
    moody: "Create a moody atmosphere with deep shadows and desaturated highlights."
  }

  const styleAddition = stylePreset ? stylePrompts[stylePreset] || "" : ""

  return `${basePrompt} ${styleAddition}`.trim()
}
