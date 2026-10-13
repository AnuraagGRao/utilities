"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Search, Sparkles, Terminal, ExternalLink, Globe, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { CommandPalette } from "../CommandPalette";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, login, logout } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Hub", href: "/" },
    { name: "JSON Studio", href: "/tools/json" },
    { name: "Screen Ruler", href: "/tools/ruler" },
    { name: "Subdomain Scout", href: "/tools/subdomains" },
    { name: "Deal Radar", href: "/tools/deals" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-500 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                    utils
                  </span>
                  <span className="text-xs text-slate-500 font-mono">.anuraaggrao.com</span>
                </div>
                <span className="text-[10px] text-cyan-400/90 font-medium tracking-wider uppercase">
                  Developer Toolkit
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-sm shadow-cyan-500/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Search, Auth & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-cyan-500/40 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Search utilities...</span>
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Firebase Auth User Status */}
            {!loading && (
              user ? (
                <div className="flex items-center gap-2 pl-1">
                  <div className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl bg-slate-900 border border-slate-800">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-5 h-5 rounded-full ring-1 ring-cyan-500/40"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                        {user.displayName?.[0] || "U"}
                      </div>
                    )}
                    <span className="text-xs text-slate-200 font-medium hidden sm:inline max-w-[100px] truncate">
                      {user.displayName?.split(" ")[0] || "User"}
                    </span>
                    <button
                      onClick={logout}
                      title="Sign Out"
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 hover:from-cyan-500/30 hover:to-violet-500/30 border border-cyan-500/30 text-xs font-medium text-cyan-300 hover:text-white transition-all shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )
            )}

            <a
              href="https://anuraaggrao.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-400 hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>anuraaggrao.com</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </>
  );
}
