import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="container nav">
        <div className="brand">Presu<span>IA</span></div>
        <Link href="/login" className="btn btn-light">Entrar</Link>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">Presupuestos con IA para profesionales</span>
          <h1>Convierte un WhatsApp en un presupuesto profesional.</h1>
          <p>Pega la petición de tu cliente y PresuIA prepara en segundos un borrador que puedes editar, guardar y convertir en PDF.</p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-primary">Crear mi primer presupuesto gratis →</Link>
            <a href="#como-funciona" className="btn btn-light">Ver cómo funciona</a>
          </div>

          <div className="demo">
            <div className="demo-left">
              <strong>Mensaje del cliente</strong>
              <p style={{lineHeight:1.7,color:"#d1d5db"}}>“Hola, necesito pintar un piso de 90 m², 3 habitaciones y salón. Las paredes están bastante bien. ¿Me podéis pasar precio?”</p>
            </div>
            <div className="demo-right">
              <strong>Presupuesto generado</strong>
              <div className="quote" style={{marginTop:14}}>
                <b>Pintura de vivienda — 90 m²</b>
                <p className="muted">Preparación · Pintura · Materiales</p>
                <b>Total orientativo: 1.020 €</b>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="container">
            <h2>De mensaje a presupuesto.</h2>
            <p className="section-sub">Diseñado para quien recibe peticiones de clientes constantemente y no quiere perder tiempo redactando presupuestos desde cero.</p>
            <div className="grid">
              <div className="card"><h3>1. Pega el mensaje</h3><p className="muted">Copia el WhatsApp, email o descripción del trabajo.</p></div>
              <div className="card"><h3>2. Genera con IA</h3><p className="muted">PresuIA organiza el trabajo, partidas y preguntas pendientes.</p></div>
              <div className="card"><h3>3. Edita y envía</h3><p className="muted">Revisa precios, guarda el presupuesto y prepara un PDF profesional.</p></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2>Empieza gratis.</h2>
            <p className="section-sub">3 presupuestos IA al mes sin tarjeta. Cuando necesites más, desbloquea PRO con un único pago.</p>
            <div className="grid" style={{maxWidth:850,margin:"auto"}}>
              <div className="card"><h3>Gratis</h3><div className="stat">0 €</div><p className="muted">3 generaciones/mes · Historial · Edición · Copiar</p><Link href="/login" className="btn btn-light">Probar gratis</Link></div>
              <div className="card" style={{border:"2px solid #635bff"}}><h3>PRO</h3><div className="stat">4,99 €</div><p className="muted">Pago único · Generaciones ilimitadas* · PDF · Datos de empresa · Personalización</p><Link href="/login" className="btn btn-primary">Desbloquear PRO</Link></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">© {new Date().getFullYear()} PresuIA · Hecho para profesionales</footer>
    </>
  );
}
