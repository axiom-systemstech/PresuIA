"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [mode,setMode] = useState<"login"|"signup">("login");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({email,password})
      : await supabase.auth.signUp({email,password, options:{emailRedirectTo:`${window.location.origin}/auth/callback?next=/dashboard`}});
    setLoading(false);
    if (result.error) return setError(result.error.message);
    if (mode === "signup") setMessage("Cuenta creada. Revisa tu email para confirmar la cuenta.");
    else router.push("/dashboard");
  }

  async function google() {
    setError(""); setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo:`${window.location.origin}/auth/callback?next=/dashboard`}
    });
    if (error) { setLoading(false); setError(error.message); }
  }

  return <main className="container">
    <div className="form">
      <Link href="/" className="brand">Presu<span>IA</span></Link>
      <h1>{mode==="login" ? "Bienvenido" : "Crea tu cuenta"}</h1>
      <p className="muted">3 presupuestos IA gratis cada mes.</p>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <button className="btn btn-light" style={{width:"100%",margin:"15px 0"}} onClick={google} disabled={loading}>Continuar con Google</button>
      <div style={{textAlign:"center",color:"#98a2b3"}}>o</div>
      <form onSubmit={submit}>
        <label className="label">Email</label>
        <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label className="label">Contraseña</label>
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
        <button className="btn btn-primary" style={{width:"100%",marginTop:18}} disabled={loading}>{loading?"Cargando…":mode==="login"?"Entrar":"Crear cuenta"}</button>
      </form>
      <p className="small" style={{marginTop:20,textAlign:"center"}}>
        {mode==="login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <button onClick={()=>setMode(mode==="login"?"signup":"login")} style={{border:0,background:"none",color:"#635bff",fontWeight:800,cursor:"pointer"}}>{mode==="login"?"Crear cuenta":"Entrar"}</button>
      </p>
    </div>
  </main>;
}
