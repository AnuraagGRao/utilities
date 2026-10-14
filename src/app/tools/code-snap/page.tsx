"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { 
  Camera, Copy, Check, Download, Sparkles, Image, 
  Layers, Sliders, FileCode, CheckCircle2, RefreshCw
} from "lucide-react";

const SAMPLE_CODE = `// Cloudflare Worker Edge Handler
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    
    // Low-latency in-memory cache lookup
    if (url.pathname === "/api/health") {
      return Response.json({
        status: "operational",
        region: request.cf?.colo ?? "BLR",
        timestamp: Date.now()
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};`;

const THEMES = [
  {
    name: "Cyberpunk",
    id: "cyberpunk",
    bgClass: "bg-gradient-to-tr from-cyan-600/40 via-violet-600/30 to-fuchsia-600/40",
    borderClass: "border-cyan-500/30",
  },
  {
    name: "Deep Space",
    id: "space",
    bgClass: "bg-gradient-to-tr from-slate-950 via-indigo-950/80 to-slate-900",
    borderClass: "border-indigo-500/20",
  },
  {
    name: "Emerald Aura",
    id: "emerald",
    bgClass: "bg-gradient-to-tr from-emerald-600/30 via-teal-700/20 to-slate-950",
    borderClass: "border-emerald-500/30",
  },
  {
    name: "Sunset Horizon",
    id: "sunset",
    bgClass: "bg-gradient-to-tr from-rose-600/30 via-amber-600/20 to-violet-900/40",
    borderClass: "border-rose-500/30",
  },
  {
    name: "Minimal Slate",
    id: "slate",
    bgClass: "bg-slate-900/90",
    borderClass: "border-slate-800",
  },
  {
    name: "Transparent",
    id: "transparent",
    bgClass: "bg-transparent",
    borderClass: "border-transparent",
  },
];

export default function CodeSnapStudioPage() {
  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [filename, setFilename] = useState<string>("worker.ts");
  const [theme, setTheme] = useState<string>("cyberpunk");
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [showWindowControls, setShowWindowControls] = useState<boolean>(true);
  const [padding, setPadding] = useState<"compact" | "normal" | "large">("normal");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [copied, setCopied] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const currentTheme = useMemo(() => {
    return THEMES.find((t) => t.id === theme) || THEMES[0];
  }, [theme]);

  const paddingClass = useMemo(() => {
    switch (padding) {
      case "compact":
        return "p-6";
      case "normal":
        return "p-10 sm:p-14";
      case "large":
        return "p-14 sm:p-20";
    }
  }, [padding]);

  const fontSizeClass = useMemo(() => {
    switch (fontSize) {
      case "sm":
        return "text-xs";
      case "base":
        return "text-sm";
      case "lg":
        return "text-base";
    }
  }, [fontSize]);

  const lines = useMemo(() => code.split("\n"), [code]);

  // Download SVG Card client-side
  const downloadSvg = () => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const width = cardEl.offsetWidth;
    const height = cardEl.offsetHeight;

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&amp;display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      </style>
      ${cardEl.outerHTML}
    </div>
  </foreignObject>
</svg>`;

    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename || "code-snap"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Link href="/" className="hover:underline text-slate-500">utils</Link>
            <span className="text-slate-600">/</span>
            <span>tools</span>
            <span className="text-slate-600">/</span>
            <span className="text-pink-300">code-snap</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Code Snap &amp; Card Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Generate aesthetic, presentation-grade syntax cards with macOS frames and custom mesh gradients.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={copyCode}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Text</span>
          </button>
          <button
            onClick={downloadSvg}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Control Ribbon */}
      <div className="w-full mt-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 glass-panel shadow-md flex items-center justify-between flex-wrap gap-4">
        {/* Filename */}
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="filename.ts"
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-100 focus:outline-none focus:border-pink-500/60 w-32"
          />
        </div>

        {/* Themes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                theme === t.id
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-pink-500 focus:ring-0"
            />
            <span>Line Numbers</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showWindowControls}
              onChange={(e) => setShowWindowControls(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-pink-500 focus:ring-0"
            />
            <span>macOS Controls</span>
          </label>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="w-full mt-6 flex flex-col items-center justify-center">
        {/* The Snapshot Card Preview */}
        <div
          ref={cardRef}
          className={`w-full rounded-3xl ${currentTheme.bgClass} ${paddingClass} transition-all duration-300 flex items-center justify-center`}
        >
          {/* Inner Terminal Window */}
          <div
            className={`w-full max-w-3xl rounded-2xl bg-slate-950/95 border border-slate-800/90 shadow-2xl backdrop-blur-2xl overflow-hidden`}
          >
            {/* Window Header */}
            {showWindowControls && (
              <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.06] bg-slate-950/80 select-none">
                {/* Traffic Lights */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50" />
                </div>

                {/* Filename title */}
                <span className="font-mono text-xs text-slate-400 font-medium">
                  {filename}
                </span>

                <div className="w-12" />
              </div>
            )}

            {/* Editable Code Box */}
            <div className="p-4 sm:p-6 font-mono overflow-x-auto">
              <div className="flex items-start">
                {showLineNumbers && (
                  <div className="flex flex-col select-none pr-4 text-slate-600 text-right leading-relaxed shrink-0">
                    {lines.map((_, i) => (
                      <span key={i} className={fontSizeClass}>
                        {i + 1}
                      </span>
                    ))}
                  </div>
                )}
                <textarea
                  rows={lines.length + 1}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full bg-transparent text-slate-100 font-mono ${fontSizeClass} focus:outline-none resize-none leading-relaxed overflow-hidden`}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
