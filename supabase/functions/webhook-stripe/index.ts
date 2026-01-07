import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.10.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient()
})

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
)

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""

serve(async (req) => {
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return new Response("No signature", { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.user_id

        if (!userId) {
          console.error("No user ID found in session")
          break
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            is_premium: true,
            credits: -1,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId)

        if (error) {
          console.error("Error updating profile:", error)
        } else {
          console.log(`User ${userId} upgraded to premium`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              is_premium: false,
              credits: 0,
              updated_at: new Date().toISOString()
            })
            .eq("id", profile.id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
