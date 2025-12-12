import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';
import AuthButton from "@/components/AuthButton";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Analytics } from "@vercel/analytics/next";
import { Search } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata = {
  title: "Zaffaron | Global Cuisine",
  description: "The world's most advanced AI cooking platform. Experience the future of food.",
  manifest: "/manifest.json",
};

import ChefAssistant from "@/components/ChefAssistant"; // [NEW] Restore Chat

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased font-sans bg-background text-foreground`}
      >
        <LanguageProvider>
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
              <Link href="/" className="mr-6 flex items-center space-x-2 gap-2">
                <Image
                  src="/logo_vector.svg"
                  alt="Zaffaron Logo"
                  width={32}
                  height={32}
                  className="rounded-full bg-white"
                />
                <span className="font-bold text-xl text-amber-600">Zaffaron</span>
              </Link>
              <div className="flex items-center space-x-2 gap-1">
                <Link href="/search" className="p-2 rounded-full hover:bg-muted transition-colors">
                  <Search size={20} className="text-muted-foreground hover:text-foreground" />
                </Link>
                <LanguageSwitcher />
                <AuthButton />
              </div>
            </div>
          </header>
          <main className="min-h-screen pb-16">
            {children}
            <footer className="w-full py-4 text-center text-xs text-muted-foreground opacity-50">
              v2.5.2 (Latest) - {new Date().toLocaleDateString('fa-IR')}
            </footer>
          </main>
          <ChefAssistant />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
