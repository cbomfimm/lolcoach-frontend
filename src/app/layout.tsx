import type { Metadata } from "next";
import "./globals.css";
import logo from "./icon.png";

export const metadata: Metadata = {
  title: "MindRiftAi — Plataforma de Coaching com IA",
  description:
    "Aproveite o poder do aprendizado de máquina para dominar as mecânicas dos campeões e subir na ranqueada com precisão.",
  icons: {
    icon: logo.src,
    shortcut: logo.src,
    apple: logo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
