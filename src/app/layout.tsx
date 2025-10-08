import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Sentinela – Monitoramento Inteligente de Bem-estar";
const description =
  "Plataforma que antecipa riscos com prevenção inteligente, aciona respostas imediatas e opera em conformidade com a LGPD.";

export const metadata: Metadata = {
  title,
  description,
  themeColor: "#0B1F3A",
  icons: {
    icon: "/file.svg",
    apple: "/file.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Sentinela",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
