"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  History, Copy, Check, Clock, Play, Pause, Calendar, 
  Code, ArrowRightLeft, Sparkles, Layers, RefreshCw
} from "lucide-react";

const CODE_SNIPPETS = [
  {
    lang: "JavaScript / TypeScript",
    nowSeconds: "Math.floor(Date.now() / 1000)",
    nowMs: "Date.now()",
    parse: "new Date(timestamp * 1000).toISOString()",
  },
  {
    lang: "Python 3",
    nowSeconds: "import time; int(time.time())",
    nowMs: "import time; int(time.time() * 1000)",
    parse: "from datetime import datetime; datetime.utcfromtimestamp(ts)",
  },
  {
    lang: "Go (Golang)",
    nowSeconds: "time.Now().Unix()",
    nowMs: "time.Now().UnixMilli()",
    parse: "time.Unix(timestamp, 0).UTC()",
  },
  {
    lang: "Rust",
    nowSeconds: "SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()",
    nowMs: "SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()",
    parse: "DateTime::from_timestamp(ts, 0)",
  },
  {
    lang: "Bash / CLI",
    nowSeconds: "date +%s",
    nowMs: "date +%s%3N",
    parse: "date -d @1776118400",
  },
  {
    lang: "PHP",
    nowSeconds: "time()",
    nowMs: "round(microtime(true) * 1000)",
    parse: "date('Y-m-d H:i:s', $timestamp)",
  },
];

function getRelativeTime(d: Date): string {
  const diffSec = Math.floor((d.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const absSec = Math.abs(diffSec);
  if (absSec < 60) return rtf.format(diffSec, "second");
  if (absSec < 3600) return rtf.format(Math.floor(diffSec / 60), "minute");
  if (absSec < 86400) return rtf.format(Math.floor(diffSec / 3600), "hour");
  if (absSec < 2592000) return rtf.format(Math.floor(diffSec / 86400), "day");
  if (absSec < 31536000) return rtf.format(Math.floor(diffSec / 2592000), "month");
  return rtf.format(Math.floor(diffSec / 31536000), "year");
}

export default function EpochStudioPage() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [isTicking, setIsTicking] = useState<boolean>(true);
  const [inputEpoch, setInputEpoch] = useState<string>(() => String(Math.floor(Date.now() / 1000)));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Human date input state for reverse conversion
  const [humanDate, setHumanDate] = useState<string>(() => new Date().toISOString().slice(0, 16));

  // Live ticking timer
  useEffect(() => {
    if (!isTicking) return;
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isTicking]);

  // Convert Epoch to formats
  const parsedEpoch = useMemo(() => {
    const raw = inputEpoch.trim();
    if (!raw) return null;

    const num = Number(raw);
    if (isNaN(num)) return { error: "Invalid numeric timestamp" };

    // Detect if input is seconds (<= 11 digits) or ms
    const isSeconds = raw.length <= 11;
    const dateObj = new Date(isSeconds ? num * 1000 : num);

    if (isNaN(dateObj.getTime())) {
      return { error: "Timestamp out of range" };
    }

    return {
      dateObj,
      isSeconds,
      seconds: isSeconds ? num : Math.floor(num / 1000),
      milliseconds: isSeconds ? num * 1000 : num,
      iso: dateObj.toISOString(),
      utc: dateObj.toUTCString(),
      local: dateObj.toString(),
      relative: getRelativeTime(dateObj),
    };
  }, [inputEpoch]);

  // Convert Human date picker to Epoch
  const humanEpoch = useMemo(() => {
    try {
      const d = new Date(humanDate);
      if (isNaN(d.getTime())) return null;
      return {
        seconds: Math.floor(d.getTime() / 1000),
        ms: d.getTime(),
        iso: d.toISOString(),
        utc: d.toUTCString(),
      };
    } catch {
      return null;
    }
  }, [humanDate]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
            <span className="text-indigo-300">epoch</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Unix Epoch &amp; Timestamp Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time ticking Unix clock, bidirectional timestamp conversions, and cross-language syntax snippets.
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="font-mono text-indigo-300 font-bold">{currentEpoch}</span>
            <button
              onClick={() => setIsTicking(!isTicking)}
              title={isTicking ? "Pause clock" : "Resume clock"}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              {isTicking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => copyToClipboard(String(currentEpoch), "live-now")}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              {copiedKey === "live-now" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Bidirectional Converters (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Timestamp to Human Date */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                Timestamp &rarr; Human Date
              </span>
              <button
                onClick={() => setInputEpoch(String(Math.floor(Date.now() / 1000)))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to Now</span>
              </button>
            </div>

            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700/80 focus-within:border-indigo-500/60 p-2">
              <input
                type="text"
                value={inputEpoch}
                onChange={(e) => setInputEpoch(e.target.value)}
                placeholder="Enter Unix timestamp (e.g. 1776118400)..."
                className="w-full bg-transparent px-2 font-mono text-base sm:text-lg text-indigo-200 focus:outline-none"
              />
              {parsedEpoch && !("error" in parsedEpoch) && (
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-xs border border-indigo-500/20 whitespace-nowrap mr-2">
                  {parsedEpoch.isSeconds ? "Seconds" : "Milliseconds"}
                </span>
              )}
            </div>

            {/* Results Grid */}
            {parsedEpoch && "error" in parsedEpoch ? (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                {parsedEpoch.error}
              </div>
            ) : parsedEpoch ? (
              <div className="space-y-2.5 pt-2">
                {/* ISO 8601 */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                    <span className="text-slate-500 uppercase text-[10px] w-20">ISO 8601</span>
                    <span className="text-cyan-300 truncate font-semibold">{parsedEpoch.iso}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(parsedEpoch.iso, "iso")}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "iso" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Local Timezone */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                    <span className="text-slate-500 uppercase text-[10px] w-20">Local Time</span>
                    <span className="text-slate-200 truncate">{parsedEpoch.local}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(parsedEpoch.local, "local")}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "local" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Relative Difference */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                    <span className="text-slate-500 uppercase text-[10px] w-20">Relative</span>
                    <span className="text-emerald-400 font-bold">{parsedEpoch.relative}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Section 2: Human Date to Timestamp */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Human Date &rarr; Unix Timestamp
            </span>

            <input
              type="datetime-local"
              value={humanDate}
              onChange={(e) => setHumanDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500/60"
            />

            {humanEpoch && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Epoch Seconds</span>
                    <span className="text-amber-300 font-bold text-sm">{humanEpoch.seconds}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(String(humanEpoch.seconds), "h-sec")}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "h-sec" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Epoch Milliseconds</span>
                    <span className="text-indigo-300 font-bold text-sm">{humanEpoch.ms}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(String(humanEpoch.ms), "h-ms")}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    {copiedKey === "h-ms" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Snippets (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Language Syntax Snippets
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Instant copy-paste syntax for getting the current Unix epoch across programming languages.
            </p>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {CODE_SNIPPETS.map((snippet) => (
                <div
                  key={snippet.lang}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs">{snippet.lang}</span>
                    <button
                      onClick={() => copyToClipboard(snippet.nowSeconds, snippet.lang)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] flex items-center gap-1"
                    >
                      {copiedKey === snippet.lang ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-cyan-300 break-all select-all">
                    {snippet.nowSeconds}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
