import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ClientStage } from "@/components/ClientStage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "utils.anuraaggrao.com | High-Performance Developer & Recon Toolkit",
  description: "A fast, privacy-focused collection of utilities: JSON Studio, Screen Ruler, Subdomain Scout, Deal Radar, and more.",
  keywords: ["developer tools", "JSON viewer", "screen ruler", "subdomains", "deals", "utilities", "anuraaggrao"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-x-hidden">
        {/* Client-side 3D CyberStage & Koji Companion Guide */}
        <ClientStage />

        <AuthProvider>
          <div className="relative z-10 flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
        <Script
          src="https://analytics.anuraaggrao.com/tracker.js"
          data-project="utils"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
