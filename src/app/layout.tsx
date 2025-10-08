import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultTitle = "Sentinela – Monitoramento Inteligente de Bem-estar";
const description =
  "Check-ins diários e analytics preventivos para mapear estresse e orientar ações rápidas com total conformidade.";

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: "%s | Sentinela",
  },
  description,
  metadataBase: new URL("https://sentinela.example.com"),
  openGraph: {
    title: defaultTitle,
    description,
    url: "https://sentinela.example.com",
    siteName: "Sentinela",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description,
  },
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#07132b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased bg-sentinel-canvas text-sentinel-foreground`}>
        <div className="min-h-screen bg-sentinel-gradient">
          {children}
        </div>
      </body>
    </html>
  );
}
