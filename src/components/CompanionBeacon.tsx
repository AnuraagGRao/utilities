"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Terminal, Volume2, ExternalLink, X, ShieldCheck } from "lucide-react";

export function CompanionBeacon() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const tips = [
    "Zero telemetry leak: every hash, regex, and AST parse runs locally in your browser's V8 isolate.",
    "Pro-tip: Press ⌘K (or Ctrl+K) anywhere to instantly fuzzy-filter through all 15 developer tools.",
    "Need color inspection? The Screen Ruler utility includes a real-time pixel magnifier.",
    "Deal Radar scans verified developer discounts directly with zero affiliate tracking.",
  ];

  useEffect(() => {
    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      setScrollPercent(pct);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const playChirp = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio safety
    }
  };

  const handleToggle = () => {
    playChirp();
    if (!isOpen) {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }
    setIsOpen(!isOpen);
  };

  return (
    <aside aria-label="Companion HUD" className="fixed bottom-5 right-5 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Speech Bubble / Tip Flyout */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-80 p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <span>🐼</span> KOJI // ADVISORY
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {tips[tipIndex]}
          </p>
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Edge SLA: 0.8ms</span>
            </span>
            <a
              href="https://craft.anuraaggrao.com/companions"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Companions Lab</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Beacon Capsule */}
      <button
        onClick={handleToggle}
        className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/30 text-white shadow-xl hover:scale-105 transition-all backdrop-blur-xl group cursor-pointer"
        title="Koji the Cyber Panda - Click for system tips"
      >
        {/* Scroll Progress Circular SVG */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-cyan-400 transition-all duration-150"
              strokeDasharray={`${scrollPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs">🐼</span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono font-bold leading-tight group-hover:text-cyan-300 transition-colors">
            Koji
          </span>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none">
            {scrollPercent}% FLIGHT
          </span>
        </div>
      </button>
    </aside>
  );
}
