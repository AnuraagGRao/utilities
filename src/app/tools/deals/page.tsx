"use client";

import { useState, useEffect } from "react";
import { 
  Tag, Search, ExternalLink, RefreshCw, Flame, ShoppingBag, 
  Gamepad2, Cpu, Percent, AlertCircle, TrendingDown, Clock
} from "lucide-react";
import { DealItem } from "@/types";

export default function DealRadarPage() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeals = async (cat = category, q = searchQuery) => {
    try {
      setRefreshing(true);
      setError(null);
      const url = `/api/deals?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load deals feed");
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading deals");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeals(category, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeals(category, searchQuery);
  };

  // Compute stats
  const hotDealsCount = deals.filter((d) => (d.savingsPercent || 0) >= 50).length;
  const gamingDealsCount = deals.filter((d) => d.category === "Gaming").length;
  const techDealsCount = deals.filter((d) => d.category === "PC Hardware & Tech").length;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
            <span>UTILITIES</span>
            <span>/</span>
            <span>SHOPPING & DEALS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Tag className="w-7 h-7 text-cyan-400" />
            Deal Radar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time discount radar aggregating verified bargains across tech hardware, PC components, and digital gaming.
          </p>
        </div>

        <button
          onClick={() => fetchDeals()}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
          Refresh Radar
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Total Deals Tracked</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{deals.length}</div>
          </div>
          <ShoppingBag className="w-6 h-6 text-cyan-400/50" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Deep Discounts (&gt;50%)</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{hotDealsCount} Hot</div>
          </div>
          <Flame className="w-6 h-6 text-rose-400/50" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">PC Hardware & Tech</span>
            <div className="text-xl font-bold font-mono text-violet-400 mt-0.5">{techDealsCount} Items</div>
          </div>
          <Cpu className="w-6 h-6 text-violet-400/50" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Gaming & Digital</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{gamingDealsCount} Titles</div>
          </div>
          <Gamepad2 className="w-6 h-6 text-emerald-400/50" />
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 glass-panel">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 w-full md:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Deals", icon: SparklesIcon },
            { id: "hardware", label: "PC Hardware", icon: Cpu },
            { id: "gaming", label: "Gaming", icon: Gamepad2 },
            { id: "general", label: "Retail & Consumer", icon: ShoppingBag },
          ].map((tab) => {
            const isActive = category === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals (e.g. RTX, SSD, Steam)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </form>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Deals Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
          <p className="text-sm font-medium">Scouring deal feeds across the internet...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="py-24 text-center text-slate-500 text-sm">
          No deals found matching your criteria. Try resetting the search or category filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => {
            const hasSavings = typeof deal.savingsPercent === "number" && deal.savingsPercent > 0;
            return (
              <div
                key={deal.id}
                className="group p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col justify-between glass-panel"
              >
                <div>
                  {/* Store & Category Header */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80">
                      {deal.storeName || deal.sourceName}
                    </span>

                    {hasSavings && (
                      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <TrendingDown className="w-3 h-3" />
                        -{deal.savingsPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-3 items-start my-2">
                    {deal.thumbUrl && (
                      <img
                        src={deal.thumbUrl}
                        alt=""
                        className="w-16 h-12 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {deal.title}
                    </h3>
                  </div>
                </div>

                {/* Footer with Price & External Link */}
                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    {deal.salePrice !== undefined && (
                      <span className="text-base font-bold font-mono text-cyan-400">
                        ${deal.salePrice.toFixed(2)}
                      </span>
                    )}
                    {deal.normalPrice !== undefined && deal.normalPrice > (deal.salePrice || 0) && (
                      <span className="text-xs font-mono text-slate-500 line-through">
                        ${deal.normalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <a
                    href={deal.dealUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/15 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 border border-cyan-500/30 transition-all"
                  >
                    <span>View Deal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
