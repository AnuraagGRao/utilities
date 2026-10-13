"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Braces, Ruler, Globe, Tag, KeyRound, GitCompare, 
  Search, ArrowRight, ShieldCheck, Zap, Sparkles, Terminal, 
  Command, Flame
} from "lucide-react";
import { TOOLS, TOOL_CATEGORIES } from "@/lib/tools";
import { ToolCategory } from "@/types";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchFilter, setSearchFilter] = useState("");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCat = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesSearch =
      !searchFilter ||
      tool.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getToolIcon = (name: string) => {
    switch (name) {
      case "Braces":
        return <Braces className="w-6 h-6 text-cyan-400" />;
      case "Ruler":
        return <Ruler className="w-6 h-6 text-violet-400" />;
      case "Globe":
        return <Globe className="w-6 h-6 text-emerald-400" />;
      case "Tag":
        return <Tag className="w-6 h-6 text-amber-400" />;
      case "KeyRound":
        return <KeyRound className="w-6 h-6 text-rose-400" />;
      case "GitCompare":
        return <GitCompare className="w-6 h-6 text-sky-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 via-violet-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Subdomain pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 mb-6 shadow-sm">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-cyan-300">utils.anuraaggrao.com</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 font-medium">Production Suite</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          The High-Performance{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
            Developer & Recon
          </span>{" "}
          Toolkit
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Zero ads. Zero tracking. Instant client-side processing for JSON inspection, screen caliper measurement, passive domain intelligence, and live deal hunting.
        </p>

        {/* Search Bar Input */}
        <div className="mt-8 w-full max-w-lg relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search utilities by name, syntax, or keyword..."
            className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 shadow-xl transition-all"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex items-center justify-center gap-1.5 flex-wrap">
          {TOOL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 glass-panel glass-panel-hover"
            >
              <div>
                {/* Header Icon & Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 group-hover:scale-110 transition-transform">
                    {getToolIcon(tool.iconName)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {tool.badge}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      {tool.category}
                    </span>
                  </div>
                </div>

                {/* Tool Name & Description */}
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                  <span>{tool.name}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Card Footer: Tags & Action */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tool.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/70 text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Core Guarantees Banner */}
      <section className="w-full border-t border-white/[0.06] bg-slate-950/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sensitive JSON structures and tokens never leave your browser window. All parsing happens locally.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Zero CORS Headaches</h4>
              <p className="text-xs text-slate-400 mt-1">
                Passive recon and deal feeds leverage optimized Next.js serverless route proxies to bypass browser blocking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Terminal className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-slate-200">Production Subdomain</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tailored for <span className="font-mono text-cyan-300">utils.anuraaggrao.com</span> with turnkey Firebase user persistence readiness.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
