import type { Metadata } from "next";
import { Geist_Mono, Public_Sans } from "next/font/google";

import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Auth Central",
  description: "Autenticación central para aplicaciones internas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${publicSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
