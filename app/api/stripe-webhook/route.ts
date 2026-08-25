import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe=new Stripe(process.env.STRIPE_SECRET_KEY!);
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req:Request){
  const signature=req.headers.get("stripe-signature");
  if(!signature) return new NextResponse("Missing signature",{status:400});
  const raw=await req.text();
  let event:Stripe.Event;
  try{event=stripe.webhooks.constructEvent(raw,signature,process.env.STRIPE_WEBHOOK_SECRET!);}
  catch(err){return new NextResponse("Invalid signature",{status:400});}

  if(event.type==="checkout.session.completed"){
    const session=event.data.object as Stripe.Checkout.Session;
    const userId=session.metadata?.user_id;
    if(userId){
      await admin.from("profiles").update({plan:"pro",stripe_customer_id:typeof session.customer==="string"?session.customer:null}).eq("id",userId);
    }
  }
  return NextResponse.json({received:true});
}
