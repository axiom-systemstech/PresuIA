import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new NextResponse("Missing stripe signature", { status: 400 });
    }

    const rawBody = await req.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Crear Supabase SOLO cuando llega realmente un webhook.
    // Así Vercel no intenta inicializarlo durante el build.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;

      if (userId) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            plan: "pro",
            stripe_customer_id:
              typeof session.customer === "string"
                ? session.customer
                : null,
          })
          .eq("id", userId);

        if (error) {
          console.error("Supabase update error:", error);
          return NextResponse.json(
            { error: "Could not update user plan" },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
