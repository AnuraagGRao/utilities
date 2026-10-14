"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Binary, Copy, Check, Sparkles, AlertCircle, Clock, BookOpen, 
  HelpCircle, ArrowRight, Zap, RefreshCw, FileText, ChevronRight,
  ShieldCheck, Layers
} from "lucide-react";

interface RegexPreset {
  name: string;
  category: string;
  pattern: string;
  flags: string;
  sampleText: string;
  description: string;
}

const REGEX_PRESETS: RegexPreset[] = [
  {
    name: "Email Address (RFC 5322)",
    category: "Validation",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    sampleText: "Reach out to dev@anuraaggrao.com, support@company.org, or invalid-email@.",
    description: "Matches standard compliant email address formats.",
  },
  {
    name: "URL & Web Addresses",
    category: "Web",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
    flags: "g",
    sampleText: "Visit https://utils.anuraaggrao.com or check out http://localhost:3000/api/v1?query=test#hash.",
    description: "Captures fully qualified HTTP and HTTPS URLs.",
  },
  {
    name: "IPv4 Address",
    category: "Networking",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    sampleText: "Server cluster endpoints: 192.168.1.1, 10.0.0.254, 127.0.0.1, and 999.999.999.999 (invalid).",
    description: "Validates numerical range 0-255 across 4 octets.",
  },
  {
    name: "Semantic Versioning (SemVer)",
    category: "Development",
    pattern: "v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?",
    flags: "g",
    sampleText: "Releases: v1.0.0, 2.15.4-beta.1, 0.4.0+build.2026, and 1.2 (not semver).",
    description: "Full SemVer 2.0.0 regex with pre-release and build metadata groups.",
  },
  {
    name: "Hex Color Codes",
    category: "Design",
    pattern: "#(?:[0-9a-fA-F]{3,4}){1,2}\\b",
    flags: "g",
    sampleText: "Colors: #06b6d4 (cyan), #8b5cf6 (violet), #fff, #10b98188 (alpha), and #XYZ (invalid).",
    description: "Matches 3, 4, 6, or 8 digit hex color codes with optional alpha channel.",
  },
  {
    name: "ISO 8601 Date & Timestamp",
    category: "Time",
    pattern: "\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})?)?",
    flags: "g",
    sampleText: "Events at 2026-10-14T02:00:00Z, 2026-12-31, and 2025-01-01T14:30:15.500+05:30.",
    description: "Matches ISO 8601 dates with optional time and timezone offsets.",
  },
  {
    name: "Markdown Links",
    category: "Content",
    pattern: "\\[([^\\]]+)\\]\\(([^\\)]+)\\)",
    flags: "g",
    sampleText: "Check [Google](https://google.com) and [Utilities](https://utils.anuraaggrao.com/tools).",
    description: "Extracts label in Group 1 and target URL in Group 2.",
  },
  {
    name: "UUID v4",
    category: "Identity",
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}",
    flags: "g",
    sampleText: "Tokens: c38290f1-4cbb-4627-8ad2-6f29631980ca and 00000000-0000-0000-0000-000000000000 (not v4).",
    description: "Matches RFC 4122 compliant version 4 UUIDs.",
  },
];

interface MatchItem {
  fullMatch: string;
  index: number;
  groups: string[];
}

export default function RegexPlaygroundPage() {
  const [pattern, setPattern] = useState<string>("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState<string>("g");
  const [testText, setTestText] = useState<string>(
    "Contact engineering at dev@anuraaggrao.com or hello@anuraaggrao.com.\nFeel free to ping support@test.io or test.fake@sub.domain.co.uk!"
  );
  const [replacement, setReplacement] = useState<string>("[REDACTED_EMAIL]");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"matches" | "replace" | "cheatsheet">("matches");

  const flagOptions = [
    { key: "g", label: "global", desc: "Don't return after first match" },
    { key: "i", label: "insensitive", desc: "Case-insensitive matching" },
    { key: "m", label: "multiline", desc: "^ and $ match line starts/ends" },
    { key: "s", label: "dotAll", desc: ". matches newlines too" },
    { key: "u", label: "unicode", desc: "Treat pattern as full unicode" },
  ];

  const toggleFlag = (f: string) => {
    if (flags.includes(f)) {
      setFlags(flags.replace(f, ""));
    } else {
      setFlags(flags + f);
    }
  };

  // Safe Regex execution with runtime benchmark
  const { matches, replacedText, error, execTimeMs } = useMemo(() => {
    if (!pattern) {
      return { matches: [], replacedText: testText, error: null, execTimeMs: 0 };
    }

    const t0 = performance.now();
    try {
      const rx = new RegExp(pattern, flags);
      const results: MatchItem[] = [];

      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        let iterations = 0;
        const maxIterations = 5000;

        while ((m = rx.exec(testText)) !== null && iterations < maxIterations) {
          iterations++;
          results.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          });

          // Prevent infinite loop on zero-width match
          if (m.index === rx.lastIndex) {
            rx.lastIndex++;
          }
        }
      } else {
        const m = rx.exec(testText);
        if (m) {
          results.push({
            fullMatch: m[0],
            index: m.index,
            groups: m.slice(1),
          });
        }
      }

      const replaced = testText.replace(new RegExp(pattern, flags), replacement);
      const t1 = performance.now();

      return {
        matches: results,
        replacedText: replaced,
        error: null,
        execTimeMs: Number((t1 - t0).toFixed(2)),
      };
    } catch (err: unknown) {
      return {
        matches: [],
        replacedText: testText,
        error: (err as Error).message,
        execTimeMs: 0,
      };
    }
  }, [pattern, flags, testText, replacement]);

  // Highlighted markup generator
  const highlightedMarkup = useMemo(() => {
    if (!pattern || error || matches.length === 0) {
      return testText;
    }

    try {
      const rx = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      let lastIdx = 0;
      const parts: React.ReactNode[] = [];
      let m: RegExpExecArray | null;
      let count = 0;

      while ((m = rx.exec(testText)) !== null && count < 2000) {
        count++;
        const matchStart = m.index;
        const matchEnd = matchStart + m[0].length;

        // Prefix text
        if (matchStart > lastIdx) {
          parts.push(testText.slice(lastIdx, matchStart));
        }

        // Highlighted match
        parts.push(
          <mark
            key={`match-${count}`}
            className="bg-cyan-500/30 text-cyan-200 border-b-2 border-cyan-400 font-mono rounded px-1 py-0.5"
            title={`Match #${count} [${matchStart}:${matchEnd}]`}
          >
            {m[0]}
          </mark>
        );

        lastIdx = matchEnd;

        if (m.index === rx.lastIndex) {
          rx.lastIndex++;
        }
      }

      if (lastIdx < testText.length) {
        parts.push(testText.slice(lastIdx));
      }

      return parts;
    } catch {
      return testText;
    }
  }, [pattern, flags, testText, matches, error]);

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const loadPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestText(preset.sampleText);
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
            <span className="text-cyan-300">regex</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Regex Playground
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time pattern debugging, live group highlighting, and plain-English token breakdown.
              </p>
            </div>
          </div>
        </div>

        {/* Live Privacy & Benchmark Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-300">{execTimeMs}ms</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-medium">{matches.length} matches</span>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Client-Side</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Pattern, Flags & Test String (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pattern Input Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Regular Expression
              </label>
              <div className="flex items-center gap-1">
                {flagOptions.map((f) => {
                  const isActive = flags.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleFlag(f.key)}
                      title={`${f.label}: ${f.desc}`}
                      className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                          : "bg-slate-800/60 text-slate-500 hover:text-slate-300 border border-transparent"
                      }`}
                    >
                      {f.key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delimited Pattern Input */}
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-700/80 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/30 px-3 py-2 transition-all">
              <span className="text-slate-500 font-mono text-base select-none mr-2">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g. [a-z0-9]+)..."
                className="flex-1 bg-transparent text-slate-100 font-mono text-sm placeholder-slate-600 focus:outline-none"
              />
              <span className="text-slate-500 font-mono text-base select-none mx-2">/</span>
              <span className="text-cyan-400 font-mono text-xs font-semibold select-none">{flags}</span>
            </div>

            {/* Error display if invalid regex */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-mono">{error}</span>
              </div>
            )}
          </div>

          {/* Test String & Live Visualizer */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Test Corpus & Live Matches
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => copyToClipboard(testText, "corpus")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  {copiedType === "corpus" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Text</span>
                </button>
              </div>
            </div>

            {/* Input textarea */}
            <textarea
              rows={5}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste or type test strings here..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500/50 leading-relaxed resize-y"
            />

            {/* Visual Highlight Output View */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Visual Highlight Canvas
              </div>
              <div className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap break-all leading-relaxed max-h-60 overflow-y-auto">
                {highlightedMarkup}
              </div>
            </div>
          </div>

          {/* Tabbed View: Matches vs Replace */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("matches")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === "matches"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Captured Matches ({matches.length})
                </button>
                <button
                  onClick={() => setActiveTab("replace")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activeTab === "replace"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Substitution & Replace
                </button>
              </div>

              {activeTab === "matches" && matches.length > 0 && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(matches, null, 2), "json-matches")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5"
                >
                  {copiedType === "json-matches" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Export JSON</span>
                </button>
              )}
            </div>

            {/* Matches List View */}
            {activeTab === "matches" && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {matches.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No matches found for the current pattern.
                  </div>
                ) : (
                  matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-mono text-cyan-300 font-semibold truncate bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/30">
                          {m.fullMatch}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          idx: {m.index}
                        </span>
                      </div>

                      {/* Capture Groups */}
                      {m.groups.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {m.groups.map((grp, gIdx) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/25 text-violet-300 font-mono text-[11px]"
                              title={`Group $${gIdx + 1}`}
                            >
                              ${gIdx + 1}: {grp ?? "undefined"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Substitution View */}
            {activeTab === "replace" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                    Replacement Pattern (Supports $1, $2, $&amp;)
                  </label>
                  <input
                    type="text"
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    placeholder="e.g. $1 or [REDACTED]"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono uppercase text-slate-400">
                      Transformed Output
                    </span>
                    <button
                      onClick={() => copyToClipboard(replacedText, "replaced")}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1"
                    >
                      {copiedType === "replaced" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Result</span>
                    </button>
                  </div>
                  <div className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
                    {replacedText}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Presets Library & Cheat Sheet (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Presets Library */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Common Pattern Presets
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              1-click load production-vetted patterns directly into the tester.
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {REGEX_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Syntax Cheat Sheet */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Syntax Quick Reference
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">\d</span>
                <span className="text-slate-400 text-[11px]">Any digit [0-9]</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">\w</span>
                <span className="text-slate-400 text-[11px]">Word char [a-zA-Z0-9_]</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">\s</span>
                <span className="text-slate-400 text-[11px]">Whitespace (space, tab, \n)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">^ / $</span>
                <span className="text-slate-400 text-[11px]">Start / End of line</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">* / + / ?</span>
                <span className="text-slate-400 text-[11px]">0+, 1+, 0 or 1 match</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">(...)</span>
                <span className="text-slate-400 text-[11px]">Capture group</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/50">
                <span className="text-cyan-300">(?:...)</span>
                <span className="text-slate-400 text-[11px]">Non-capturing group</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
