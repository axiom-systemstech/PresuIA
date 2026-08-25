import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUser } from "@/lib/auth";

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(){
  try{
    const {user}=await getUser();
    if(!user) return NextResponse.json({error:"No autenticado"},{status:401});
    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      line_items:[{price:process.env.STRIPE_PRO_PRICE_ID!,quantity:1}],
      customer_email:user.email,
      metadata:{user_id:user.id},
      success_url:`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
      allow_promotion_codes:true
    });
    return NextResponse.json({url:session.url});
  }catch(e:any){
    console.error(e); return NextResponse.json({error:e?.message||"Stripe error"},{status:500});
  }
}
