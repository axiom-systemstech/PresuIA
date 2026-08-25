import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    if (!secretKey) throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno.");
    if (!priceId) throw new Error("Falta STRIPE_PRO_PRICE_ID (o STRIPE_PRICE_ID) en las variables de entorno.");
    if (!appUrl) throw new Error("Falta NEXT_PUBLIC_APP_URL en las variables de entorno.");

    const stripe = new Stripe(secretKey);
    const { user } = await getUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email || undefined,
      metadata: { user_id: user.id },
      success_url: `${appUrl}/dashboard?payment=success`,
      cancel_url: `${appUrl}/dashboard?payment=cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error("Stripe no devolvió una URL de Checkout.");
    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: e?.message || "Error creando Checkout de Stripe" }, { status: 500 });
  }
}
