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
  metadataBase: new URL("https://utils.anuraaggrao.com"),
  title: "utils.anuraaggrao.com | High-Performance Developer & Recon Toolkit",
  description: "A fast, zero-server privacy collection of developer utilities: JSON Studio, Screen Ruler, Subdomain Scout, Regex Playground, WebCrypto Studio, and more.",
  keywords: ["developer tools", "JSON viewer", "screen ruler", "subdomains", "deals", "utilities", "anuraaggrao"],
  openGraph: {
    title: "utils.anuraaggrao.com | High-Performance Developer Recon Suite",
    description: "15 client-side developer tools. Zero server payload leaks, in-browser Web Crypto API, and 3D cyber matrix with resident guide Koji.",
    url: "https://utils.anuraaggrao.com",
    siteName: "Developer Utilities · Anuraag G Rao",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 675,
        alt: "Developer Utilities by Anuraag G Rao",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "utils.anuraaggrao.com | Developer Recon Suite",
    description: "15 client-side developer tools. Zero server payload leaks, in-browser Web Crypto API, and 3D cyber matrix with resident guide Koji.",
    images: ["/og-image.jpg"],
  },
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
