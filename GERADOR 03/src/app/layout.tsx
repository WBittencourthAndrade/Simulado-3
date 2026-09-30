import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Especialista FCC | Bancas, Raio-X & Questões Inéditas (Nível Médio)",
  description:
    "Especialista Sênior em Bancas de Concursos Públicos da Fundação Carlos Chagas (FCC). Diagnóstico de incidência recente, questões inéditas calibradas e engenharia de distratores para Técnico Judiciário e Administrativo.",
  keywords: [
    "FCC",
    "Fundação Carlos Chagas",
    "Concursos Públicos",
    "Técnico Judiciário",
    "TRT",
    "TRE",
    "TRF",
    "TJ",
    "Questões Inéditas",
    "Raio-X FCC",
  ],
  // Web App Manifest real (display: standalone)
  manifest: "/manifest.json",
  applicationName: "Especialista FCC",
  // iOS: <meta name="apple-mobile-web-app-capable" content="yes"> + status-bar-style
  appleWebApp: {
    capable: true,
    title: "Especialista FCC",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    // Tag explícita da Apple (o Next moderno só emite "mobile-web-app-capable" via appleWebApp)
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
