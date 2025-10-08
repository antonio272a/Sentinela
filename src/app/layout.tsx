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

const description = "Plataforma de monitoramento inteligente Sentinela.";

export const metadata: Metadata = {
  title: {
    default: "Sentinela",
    template: "%s | Sentinela",
  },
  description,
  metadataBase: new URL("https://sentinela.example.com"),
  openGraph: {
    title: "Sentinela",
    description,
    url: "https://sentinela.example.com",
    siteName: "Sentinela",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sentinel-canvas text-sentinel-foreground`}
      >
        <div className="min-h-screen bg-sentinel-gradient">
          {children}
        </div>
      </body>
    </html>
  );
}
