import { NextResponse } from "next/server";
import { z } from "zod";
import { groq, SYSTEM_PROMPT } from "@/lib/groq";
import { getUser } from "@/lib/auth";

const bodySchema=z.object({message:z.string().min(10).max(12000)});

export async function POST(req:Request){
  try{
    const parsed=bodySchema.parse(await req.json());
    const {supabase,user}=await getUser();
    if(!user) return NextResponse.json({error:"No autenticado"},{status:401});

    const {data:profile}=await supabase.from("profiles").select("plan").eq("id",user.id).single();
    const isPro=profile?.plan==="pro";
    if(!isPro){
      const start=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString();
      const {count}=await supabase.from("quotes").select("*",{count:"exact",head:true}).eq("user_id",user.id).gte("created_at",start);
      if((count||0)>=3) return NextResponse.json({error:"Has alcanzado tus 3 presupuestos gratuitos de este mes."},{status:402});
    }

    const completion=await groq.chat.completions.create({
      model:"openai/gpt-oss-120b",
      temperature:0.2,
      response_format:{type:"json_object"},
      messages:[
        {role:"system",content:SYSTEM_PROMPT},
        {role:"user",content:parsed.message}
      ]
    });
    const content=completion.choices[0]?.message?.content;
    if(!content) throw new Error("La IA no devolvió contenido");
    const quote=JSON.parse(content);

    const {data,error}=await supabase.from("quotes").insert({
      user_id:user.id,title:quote.title||"Nuevo presupuesto",summary:quote.summary||"",content:quote
    }).select().single();
    if(error) throw error;
    return NextResponse.json({quote:data});
  }catch(e:any){
    console.error(e);
    return NextResponse.json({error:e?.message||"Error interno"},{status:500});
  }
}
