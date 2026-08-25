# PresuIA — SaaS listo para GitHub + Vercel

PresuIA convierte una petición de cliente en un borrador de presupuesto usando Groq. Incluye Supabase Auth (email + Google), PostgreSQL + RLS, Stripe Checkout para pago único de 4,99 €, PDF y PWA.

## 1. Antes de subirlo

Has expuesto claves privadas en el chat. **Rota/revoca la clave `sk_live_...` de Stripe y la `gsk_...` de Groq antes de usarlas.** No las pegues en GitHub.

## 2. Supabase

1. Crea/abre tu proyecto.
2. En SQL Editor ejecuta `supabase/schema.sql`.
3. En Authentication > Providers activa Email.
4. Activa Google y configura las credenciales OAuth de Google.
5. En Authentication > URL Configuration añade:
   - `http://localhost:3000/auth/callback`
   - `https://TU-DOMINIO/auth/callback`
6. En Authentication > Email Templates personaliza el correo de confirmación como email de bienvenida.
7. Para producción configura SMTP propio en Supabase Auth.

## 3. Stripe

1. Crea un producto `PresuIA PRO`.
2. Crea un precio único de `4,99 EUR` (one-time).
3. Copia su `price_...`.
4. En Stripe Developers > Webhooks crea:
   `https://TU-DOMINIO/api/stripe-webhook`
5. Suscribe el evento `checkout.session.completed`.
6. Copia el signing secret `whsec_...`.

## 4. Variables de entorno

Copia `.env.example` a `.env.local`.

Además de las variables públicas, añade:

`SUPABASE_SERVICE_ROLE_KEY=...`

La service role key se usa exclusivamente en el webhook y **jamás** debe empezar por `NEXT_PUBLIC_`.

## 5. Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## 6. Vercel

Importa el repositorio desde GitHub. Añade todas las variables de `.env.example` y `SUPABASE_SERVICE_ROLE_KEY` en Project Settings > Environment Variables.

Pon:

`NEXT_PUBLIC_APP_URL=https://TU-DOMINIO`

Después de desplegar, vuelve a Supabase y Google OAuth y sustituye `TU-DOMINIO`.

## 7. Google OAuth

En Google Cloud crea un OAuth Client de tipo Web Application. El redirect URI debe apuntar al callback de Supabase que te muestra el panel de Supabase (no al callback de Next.js directamente). Después, en Supabase Authentication > Providers > Google pega Client ID y Client Secret.

## 8. Email de bienvenida

La versión base utiliza el email de confirmación de Supabase como primer email. Cambia el asunto y contenido en Authentication > Email Templates. Para campañas y emails transaccionales avanzados, añade después un proveedor SMTP/Resend.

## 9. Notas importantes

- Free: 3 presupuestos/mes.
- PRO: pago único 4,99 €.
- El límite se calcula sobre `quotes` del mes actual.
- Stripe activa PRO mediante webhook firmado.
- RLS impide que un usuario lea los presupuestos de otro.
- Groq se ejecuta exclusivamente en el servidor.
- El PDF es un MVP y puede personalizarse posteriormente con logo, IVA y numeración.
- PWA: manifest incluido. Para una experiencia de instalación más completa se puede añadir service worker/cache en una iteración posterior.

## 10. Próxima mejora recomendada

Antes de escalar tráfico, añade:
- rate limiting por IP/usuario para `/api/generate`;
- CAPTCHA/Turnstile en registro;
- logging/monitorización;
- página de términos, privacidad y cookies;
- configuración fiscal/IVA por empresa;
- editor de presupuestos y numeración;
- analytics de conversión.
