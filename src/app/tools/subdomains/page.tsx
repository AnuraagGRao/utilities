"use client";

import { useState } from "react";
import { 
  Globe, Search, Download, Copy, Check, ExternalLink, 
  ShieldCheck, AlertCircle, RefreshCw, Terminal, Layers
} from "lucide-react";
import { SubdomainRecord } from "@/types";

export default function SubdomainScoutPage() {
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SubdomainRecord[]>([]);
  const [searchedDomain, setSearchedDomain] = useState<string | null>(null);
  const [tookMs, setTookMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  const handleScan = async (targetDomain?: string) => {
    const domain = (targetDomain || domainInput).trim();
    if (!domain) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchedDomain(domain);

    try {
      const res = await fetch(`/api/subdomains?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to scan subdomains");
      }

      setResults(data.subdomains || []);
      setTookMs(data.tookMs || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error scanning target");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) =>
    r.subdomain.toLowerCase().includes(filterText.toLowerCase())
  );

  const copyAll = () => {
    const text = filteredResults.map((r) => r.subdomain).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  const downloadTxt = () => {
    const text = filteredResults.map((r) => r.subdomain).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${searchedDomain || "subdomains"}-list.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const rows = [
      ["Subdomain", "Source", "IP Address"].join(","),
      ...filteredResults.map((r) => [r.subdomain, r.source, r.ip || ""].join(",")),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${searchedDomain || "subdomains"}-list.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleDomains = ["spotify.com", "tesla.com", "github.com", "anuraaggrao.com"];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
          <span>UTILITIES</span>
          <span>/</span>
          <span>WEB & RECON</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Globe className="w-7 h-7 text-cyan-400" />
          Subdomain Scout
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Passive infrastructure reconnaissance. Scour Certificate Transparency logs and DNS records to map public attack surfaces.
        </p>
      </div>

      {/* Target Domain Input Box */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glass-panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter target domain or URL (e.g. github.com, anuraaggrao.com)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !domainInput.trim()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning Logs...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Find Subdomains
              </>
            )}
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 flex-wrap">
          <span>Quick test:</span>
          {sampleDomains.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setDomainInput(sample);
                handleScan(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-colors font-mono text-[11px]"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {searchedDomain && !loading && (
        <div className="flex flex-col gap-4">
          {/* Summary Metric Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Total Discovered</span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                  {results.length} Hosts
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-cyan-400/50" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Target Root</span>
                <div className="text-sm font-bold font-mono text-slate-200 mt-0.5 truncate max-w-[200px]">
                  {searchedDomain}
                </div>
              </div>
              <Terminal className="w-6 h-6 text-violet-400/50" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Scan Duration</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  {tookMs ? `${tookMs}ms` : "< 1s"}
                </div>
              </div>
              <Layers className="w-6 h-6 text-emerald-400/50" />
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden glass-panel flex flex-col">
            {/* Table controls */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter discovered subdomains..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-56 sm:w-72"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyAll}
                  disabled={filteredResults.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy List ({filteredResults.length})
                </button>
                <button
                  onClick={downloadTxt}
                  disabled={filteredResults.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  TXT
                </button>
                <button
                  onClick={downloadCsv}
                  disabled={filteredResults.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No subdomains match the filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800/80 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Subdomain</th>
                      <th className="py-2.5 px-4 font-medium">Discovery Source</th>
                      <th className="py-2.5 px-4 font-medium">Resolved IP</th>
                      <th className="py-2.5 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredResults.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-2.5 px-4 font-mono text-cyan-300 font-medium">
                          {record.subdomain}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                            {record.source}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                          {record.ip || "-"}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <a
                            href={`https://${record.subdomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
