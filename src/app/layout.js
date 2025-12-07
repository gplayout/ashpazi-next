import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import AuthButton from "@/components/AuthButton";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} antialiased font-sans bg-background text-foreground`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl text-amber-600">Zaffaron</span>
            </Link>
            <div className="flex items-center space-x-2">
              <AuthButton />
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
