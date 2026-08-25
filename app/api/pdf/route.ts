import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getUser } from "@/lib/auth";

export async function GET(req:Request){
  const id=new URL(req.url).searchParams.get("id");
  if(!id) return new NextResponse("Missing id",{status:400});
  const {supabase,user}=await getUser();
  if(!user) return new NextResponse("Unauthorized",{status:401});
  const {data:q}=await supabase.from("quotes").select("*").eq("id",id).eq("user_id",user.id).single();
  if(!q) return new NextResponse("Not found",{status:404});
  const {data:p}=await supabase.from("profiles").select("company_name,email,phone").eq("id",user.id).single();
  const pdf=await PDFDocument.create();
  const page=pdf.addPage([595,842]);
  const font=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  let y=790;
  page.drawText(p?.company_name||"PresuIA",{x:50,y,size:20,font:bold,color:rgb(.25,.23,.8)});
  y-=35; page.drawText(q.title||"Presupuesto",{x:50,y,size:18,font:bold}); y-=28;
  page.drawText(`Fecha: ${new Date(q.created_at).toLocaleDateString("es-ES")}`,{x:50,y,size:10,font}); y-=28;
  const content=q.content||{}; page.drawText(content.summary||q.summary||"",{x:50,y,size:11,font,maxWidth:495,lineHeight:16}); y-=45;
  page.drawText("Partidas",{x:50,y,size:13,font:bold}); y-=22;
  let total=0;
  for(const item of (content.items||[])){
    const line=String(item.description||"").slice(0,70);
    const qty=Number(item.quantity||1), price=Number(item.unit_price||0), subtotal=qty*price; total+=subtotal;
    page.drawText(`${line} — ${qty} ${item.unit||"ud"} × ${price.toFixed(2)} € = ${subtotal.toFixed(2)} €`,{x:50,y,size:10,font,maxWidth:495}); y-=18;
    if(y<100){page.addPage([595,842]);y=790}
  }
  y-=10; page.drawText(`Total orientativo: ${total.toFixed(2)} €`,{x:50,y,size:14,font:bold});
  const bytes=await pdf.save();
  return new NextResponse(bytes,{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="presupuesto-${id}.pdf"`}});
}
