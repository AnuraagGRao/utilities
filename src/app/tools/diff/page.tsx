"use client";

import { useState, useMemo } from "react";
import { GitCompare, Copy, Check, RotateCcw, ArrowRightLeft } from "lucide-react";

export default function DiffToolPage() {
  const [originalText, setOriginalText] = useState(
`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`
  );

  const [modifiedText, setModifiedText] = useState(
`function calculateTotal(items) {
  // Use modern reduce with tax calculation
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.18;
  return subtotal + tax;
}`
  );

  const [copied, setCopied] = useState(false);

  // Simple line-by-line diff calculation
  const diffLines = useMemo(() => {
    const orig = originalText.split("\n");
    const mod = modifiedText.split("\n");
    const maxLen = Math.max(orig.length, mod.length);
    const lines: { type: "same" | "diff"; orig?: string; mod?: string; lineNum: number }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const o = orig[i];
      const m = mod[i];
      if (o === m) {
        lines.push({ type: "same", orig: o, mod: m, lineNum: i + 1 });
      } else {
        lines.push({ type: "diff", orig: o, mod: m, lineNum: i + 1 });
      }
    }
    return lines;
  }, [originalText, modifiedText]);

  const swapTexts = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
            <span>UTILITIES</span>
            <span>/</span>
            <span>TEXT & DATA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <GitCompare className="w-7 h-7 text-cyan-400" />
            Diff & Code Compare
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Side-by-side text, code, and configuration comparison with line-by-line diff detection.
          </p>
        </div>

        <button
          onClick={swapTexts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" />
          Swap Text
        </button>
      </div>

      {/* Input Editors Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden glass-panel">
          <div className="p-3 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-slate-400">
            Original Text / Version A
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            className="w-full h-48 p-3 bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden glass-panel">
          <div className="p-3 bg-slate-950/40 border-b border-slate-800 text-xs font-semibold text-cyan-400">
            Modified Text / Version B
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            className="w-full h-48 p-3 bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Visual Diff Output */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden glass-panel flex flex-col">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Side-by-Side Diff Output</span>
        </div>

        <div className="p-4 overflow-x-auto font-mono text-xs divide-y divide-slate-800/40">
          {diffLines.map((line, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-2 py-1 px-2 rounded ${
                line.type === "diff" ? "bg-amber-500/10" : "hover:bg-slate-800/20"
              }`}
            >
              <div className="flex items-start gap-3 pr-4 border-r border-slate-800/80">
                <span className="text-slate-600 select-none text-[10px] w-6 text-right">
                  {line.orig !== undefined ? line.lineNum : ""}
                </span>
                <span className={`break-all ${line.type === "diff" ? "text-rose-400" : "text-slate-400"}`}>
                  {line.orig ?? ""}
                </span>
              </div>

              <div className="flex items-start gap-3 pl-4">
                <span className="text-slate-600 select-none text-[10px] w-6 text-right">
                  {line.mod !== undefined ? line.lineNum : ""}
                </span>
                <span className={`break-all ${line.type === "diff" ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                  {line.mod ?? ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
