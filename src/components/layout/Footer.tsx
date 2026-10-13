import Link from "next/link";
import { Terminal, Shield, Zap, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-slate-950/60 mt-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>utils.anuraaggrao.com</span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="text-slate-400">Zero trackers. 100% Client-first processing.</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private & Encrypted</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>Fast Turbopack Engine</span>
          </div>
          <a
            href="https://anuraaggrao.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            Built by Anuraag Rao
          </a>
        </div>
      </div>
    </footer>
  );
}
