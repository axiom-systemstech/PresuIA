"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type Quote = {id:string; title:string; summary:string; created_at:string; content:any};

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [user,setUser]=useState<any>(null);
  const [profile,setProfile]=useState<any>(null);
  const [quotes,setQuotes]=useState<Quote[]>([]);
  const [message,setMessage]=useState("");
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  const [used,setUsed]=useState(0);

  async function load() {
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return}
    setUser(user);
    const [{data:profile},{data:quotes},{count}] = await Promise.all([
      supabase.from("profiles").select("*").eq("id",user.id).single(),
      supabase.from("quotes").select("*").order("created_at",{ascending:false}).limit(10),
      supabase.from("quotes").select("*",{count:"exact",head:true}).eq("user_id",user.id).gte("created_at",new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString())
    ]);
    setProfile(profile); setQuotes((quotes||[]) as Quote[]); setUsed(count||0);
  }
  useEffect(()=>{load()},[]);

  async function generate() {
    if(!text.trim()) return;
    setLoading(true);setMessage("");
    const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
    const data=await res.json(); setLoading(false);
    if(!res.ok){setMessage(data.error||"No se pudo generar");return}
    setMessage("Presupuesto creado.");
    setText(""); load();
  }

  async function checkout() {
    setLoading(true);
    const res=await fetch("/api/checkout",{method:"POST"});
    const data=await res.json(); setLoading(false);
    if(data.url) window.location.href=data.url; else setMessage(data.error||"Error con Stripe");
  }

  async function logout(){await supabase.auth.signOut();router.push("/");}

  if(!user) return <main className="container" style={{paddingTop:80}}>Cargando…</main>;

  const isPro=profile?.plan==="pro";

  return <div className="dash">
    <header className="dash-header"><div className="container">
      <div className="brand">Presu<span>IA</span></div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}><span className={"pill "+(isPro?"pro":"")}>{isPro?"PRO":"GRATIS"}</span><button className="btn btn-light" onClick={logout}>Salir</button></div>
    </div></header>
    <main className="container dash-main">
      <div className="topbar">
        <div><h1 style={{margin:"0 0 5px",letterSpacing:"-.04em"}}>Hola 👋</h1><p className="muted">Convierte la próxima petición de tu cliente en un presupuesto.</p></div>
        {!isPro && <button className="btn btn-primary" onClick={checkout} disabled={loading}>Desbloquear PRO · 4,99 €</button>}
      </div>
      <div className="dash-grid" style={{marginTop:25}}>
        <section className="card">
          <h2>Nuevo presupuesto</h2>
          <p className="muted small">{isPro?"PRO: generaciones ilimitadas*":`Gratis: ${used}/3 generaciones usadas este mes`}</p>
          <textarea className="textarea" value={text} onChange={e=>setText(e.target.value)} placeholder="Pega aquí el WhatsApp, email o descripción del trabajo del cliente…"/>
          <button className={"btn btn-primary "+(loading?"loading":"")} style={{width:"100%",marginTop:12}} onClick={generate} disabled={loading || (!isPro && used>=3)}>✨ Generar presupuesto</button>
          {!isPro && used>=3 && <p className="small muted">Has alcanzado el límite gratuito. Desbloquea PRO por 4,99 € con un pago único.</p>}
          {message && <div className="success">{message}</div>}
        </section>
        <section className="card">
          <h2>Últimos presupuestos</h2>
          {quotes.length===0?<p className="muted">Todavía no tienes presupuestos.</p>:quotes.map(q=><div className="quote-row" key={q.id}><div><b>{q.title}</b><div className="small muted">{new Date(q.created_at).toLocaleDateString("es-ES")}</div></div><a className="btn btn-light small" href={`/api/pdf?id=${q.id}`} target="_blank">PDF</a></div>)}
        </section>
      </div>
    </main>
  </div>;
}
