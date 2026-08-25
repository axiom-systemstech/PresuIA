import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PresuIA — Presupuestos profesionales en segundos",
  description: "Convierte mensajes de clientes en presupuestos profesionales con IA.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
