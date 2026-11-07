import type { Metadata } from "next";
import { Geist, Geist_Mono, Damion } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout/Layout';
import Providers from "./providers";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const damion = Damion({
  weight: "400",
  variable: "--font-damion",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gurukul Platform",
  description: "The ultimate learning platform where knowledge meets community.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png"
  }
};

import { warmUpBackend } from "@/lib/warmup";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Warm up backend to prevent cold start issues on Render free tier
  await warmUpBackend();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${damion.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
