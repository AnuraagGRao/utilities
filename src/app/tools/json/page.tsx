"use client";

import { useState, useMemo, useCallback } from "react";
import { 
  Braces, Copy, Check, Sparkles, AlertCircle, FileText, Download, 
  Trash2, Search, ChevronRight, ChevronDown, Layers, Hash, Code, 
  ArrowUpDown, Minimize2, CheckCircle2, FileCode, Clipboard
} from "lucide-react";

type ViewMode = "tree" | "formatted" | "minified" | "typescript";

interface JsonStats {
  sizeBytes: number;
  keysCount: number;
  maxDepth: number;
  arrayCount: number;
  objectCount: number;
}

const SAMPLE_JSON = {
  status: "success",
  requestId: "req_998a44b1c2",
  timestamp: "2026-10-14T00:30:00Z",
  data: {
    user: {
      id: 48921,
      name: "Anuraag Rao",
      username: "anuraaggrao",
      email: "hello@anuraaggrao.com",
      roles: ["admin", "creator", "engineer"],
      isVerified: true,
      profile: {
        avatar: "https://anuraaggrao.com/avatar.png",
        bio: "Building high-performance utilities and software.",
        location: "Bengaluru, IN",
        timezone: "Asia/Kolkata",
        website: "https://anuraaggrao.com"
      }
    },
    metrics: {
      activeProjects: 8,
      deployedSubdomains: ["utils", "status", "music"],
      totalRequestsServed: 1420500,
      uptimeRatio: 0.9998
    },
    settings: {
      theme: "cyber-slate",
      notifications: {
        email: true,
        push: false,
        slackWebhook: null
      }
    }
  }
};

export default function JsonStudioPage() {
  const [rawInput, setRawInput] = useState<string>(() => JSON.stringify(SAMPLE_JSON, null, 2));
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandDepth, setExpandDepth] = useState<number>(3);
  const [errorInfo, setErrorInfo] = useState<{ message: string; line?: number; column?: number } | null>(null);

  // Parse JSON and compute statistics
  const { parsedJson, stats, parseError } = useMemo(() => {
    if (!rawInput.trim()) {
      return { parsedJson: null, stats: null, parseError: null };
    }

    try {
      const parsed = JSON.parse(rawInput);
      
      // Calculate recursive stats
      let keys = 0;
      let arrays = 0;
      let objects = 0;
      let maxD = 0;

      const traverse = (node: unknown, depth: number) => {
        maxD = Math.max(maxD, depth);
        if (node && typeof node === "object") {
          if (Array.isArray(node)) {
            arrays++;
            node.forEach((item) => traverse(item, depth + 1));
          } else {
            objects++;
            const objKeys = Object.keys(node as object);
            keys += objKeys.length;
            objKeys.forEach((k) => traverse((node as Record<string, unknown>)[k], depth + 1));
          }
        }
      };

      traverse(parsed, 1);

      const computedStats: JsonStats = {
        sizeBytes: new Blob([rawInput]).size,
        keysCount: keys,
        maxDepth: maxD,
        arrayCount: arrays,
        objectCount: objects,
      };

      return { parsedJson: parsed, stats: computedStats, parseError: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid JSON syntax";
      let line: number | undefined;
      let col: number | undefined;

      const lineMatch = msg.match(/line (\d+) column (\d+)/i);
      if (lineMatch) {
        line = parseInt(lineMatch[1], 10);
        col = parseInt(lineMatch[2], 10);
      }

      return { 
        parsedJson: null, 
        stats: null, 
        parseError: { message: msg, line, column: col } 
      };
    }
  }, [rawInput]);

  const copyToClipboard = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  }, []);

  const handleFormat = (indent = 2) => {
    if (!parsedJson) return;
    setRawInput(JSON.stringify(parsedJson, null, indent));
  };

  const handleMinify = () => {
    if (!parsedJson) return;
    setRawInput(JSON.stringify(parsedJson));
  };

  const handleSortKeys = () => {
    if (!parsedJson) return;
    const sortObject = (obj: unknown): unknown => {
      if (Array.isArray(obj)) return obj.map(sortObject);
      if (obj !== null && typeof obj === "object") {
        return Object.keys(obj as Record<string, unknown>)
          .sort()
          .reduce((acc: Record<string, unknown>, key) => {
            acc[key] = sortObject((obj as Record<string, unknown>)[key]);
            return acc;
          }, {});
      }
      return obj;
    };
    const sorted = sortObject(parsedJson);
    setRawInput(JSON.stringify(sorted, null, 2));
  };

  const handleFixCommon = () => {
    try {
      // Clean trailing commas, single quotes
      let fixed = rawInput
        .replace(/,\s*([\]}])/g, "$1") // trailing commas
        .replace(/'/g, '"'); // single quotes to double
      // Attempt parse
      JSON.parse(fixed);
      setRawInput(fixed);
    } catch {
      // If still fails, leave as is
    }
  };

  const handleDownload = () => {
    const blob = new Blob([rawInput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setRawInput(content);
    };
    reader.readAsText(file);
  };

  // TypeScript interface generator
  const generatedTypes = useMemo(() => {
    if (!parsedJson || typeof parsedJson !== "object") return "// Provide an object to generate TypeScript interfaces";

    const generateInterface = (name: string, obj: Record<string, unknown>): string => {
      let result = `export interface ${name} {\n`;
      for (const [key, val] of Object.entries(obj)) {
        let typeStr = "unknown";
        if (val === null) typeStr = "null | unknown";
        else if (Array.isArray(val)) {
          if (val.length > 0 && typeof val[0] === "string") typeStr = "string[]";
          else if (val.length > 0 && typeof val[0] === "number") typeStr = "number[]";
          else if (val.length > 0 && typeof val[0] === "object") typeStr = "Record<string, unknown>[]";
          else typeStr = "unknown[]";
        } else if (typeof val === "object") {
          typeStr = "Record<string, unknown>";
        } else {
          typeStr = typeof val;
        }
        result += `  ${key}: ${typeStr};\n`;
      }
      result += "}";
      return result;
    };

    return generateInterface("RootObject", parsedJson as Record<string, unknown>);
  }, [parsedJson]);

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
            <span>UTILITIES</span>
            <span>/</span>
            <span>DEVELOPER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Braces className="w-7 h-7 text-cyan-400" />
            JSON Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Format, inspect, debug, and query JSON payloads with instant tree traversal and deep path extraction.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setRawInput(JSON.stringify(SAMPLE_JSON, null, 2))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Sample Data
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer transition-all">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Load File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={handleDownload}
            disabled={!parsedJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 disabled:opacity-40 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Download
          </button>
          <button
            onClick={() => setRawInput("")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
            title="Clear JSON"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Diagnostics / Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Payload Size</div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {(stats.sizeBytes / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Total Keys</div>
              <div className="text-sm font-bold font-mono text-slate-100">{stats.keysCount}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Max Depth</div>
              <div className="text-sm font-bold font-mono text-slate-100">{stats.maxDepth} Levels</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Objects & Arrays</div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {stats.objectCount} obj · {stats.arrayCount} arr
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Validation</div>
              <div className="text-sm font-bold text-emerald-400">Valid Syntax</div>
            </div>
          </div>
        </div>
      )}

      {/* Syntax Error Notification if invalid */}
      {parseError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-rose-200">Invalid JSON: </span>
            {parseError.message}
            {parseError.line && (
              <span className="ml-2 font-mono bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-200">
                Line {parseError.line}, Col {parseError.column}
              </span>
            )}
            <div className="mt-2">
              <button
                onClick={handleFixCommon}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium transition-colors"
              >
                Attempt Auto-Fix (Quotes & Trailing Commas)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Split Editor & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch">
        {/* Left Side: Raw Input & Format Actions */}
        <div className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span>Input Raw JSON</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleFormat(2)}
                disabled={!parsedJson}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Format with 2 spaces"
              >
                Format
              </button>
              <button
                onClick={handleMinify}
                disabled={!parsedJson}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Minify JSON"
              >
                <Minimize2 className="w-3.5 h-3.5 inline mr-1" />
                Minify
              </button>
              <button
                onClick={handleSortKeys}
                disabled={!parsedJson}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
                title="Sort object keys alphabetically"
              >
                <ArrowUpDown className="w-3.5 h-3.5 inline mr-1" />
                Sort Keys
              </button>
              <button
                onClick={() => copyToClipboard(rawInput, "raw")}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Copy input"
              >
                {copiedKey === "raw" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="Paste your JSON string here..."
            className="w-full flex-1 min-h-[480px] p-4 bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/40 border-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Right Side: Interactive Visualizer & Tabs */}
        <div className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden glass-panel">
          {/* Tab Bar */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/40 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "tree"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Interactive Tree
              </button>
              <button
                onClick={() => setViewMode("typescript")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "typescript"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                TypeScript Types
              </button>
              <button
                onClick={() => setViewMode("minified")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  viewMode === "minified"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Minified
              </button>
            </div>

            {viewMode === "tree" && (
              <div className="flex items-center gap-2">
                {/* Search in tree */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search keys/vals..."
                    className="pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-36 sm:w-44"
                  />
                </div>

                {/* Expand / Collapse buttons */}
                <button
                  onClick={() => setExpandDepth((d) => (d >= 8 ? 1 : d + 1))}
                  className="px-2 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors"
                  title="Toggle expansion depth"
                >
                  Depth: {expandDepth}
                </button>
              </div>
            )}
          </div>

          {/* Tab Content Display */}
          <div className="flex-1 p-4 overflow-auto min-h-[480px]">
            {parseError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <AlertCircle className="w-10 h-10 text-rose-500/50 mb-3" />
                <p className="text-sm text-slate-400 font-medium">Unable to parse tree</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Fix the syntax error in the left editor to explore the interactive visualizer.
                </p>
              </div>
            ) : viewMode === "tree" && parsedJson !== null ? (
              <div className="font-mono text-xs space-y-1">
                <JsonTreeNode
                  nodeKey="root"
                  value={parsedJson}
                  currentPath="$"
                  currentDotPath=""
                  depth={1}
                  maxExpandDepth={expandDepth}
                  searchTerm={searchTerm}
                  onCopy={copyToClipboard}
                  copiedKey={copiedKey}
                />
              </div>
            ) : viewMode === "typescript" ? (
              <div className="relative">
                <div className="absolute right-2 top-2">
                  <button
                    onClick={() => copyToClipboard(generatedTypes, "ts")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
                  >
                    {copiedKey === "ts" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Interface
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800/80">
                  {generatedTypes}
                </pre>
              </div>
            ) : viewMode === "minified" && parsedJson !== null ? (
              <div className="relative">
                <div className="absolute right-2 top-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(parsedJson), "min")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
                  >
                    {copiedKey === "min" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Minified
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 break-all whitespace-pre-wrap overflow-x-auto leading-relaxed border border-slate-800/80">
                  {JSON.stringify(parsedJson)}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Braces className="w-10 h-10 text-slate-700 mb-2" />
                <p className="text-sm">Enter or paste JSON to visualize</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tree Node Component
interface JsonTreeNodeProps {
  nodeKey: string;
  value: unknown;
  currentPath: string;
  currentDotPath: string;
  depth: number;
  maxExpandDepth: number;
  searchTerm: string;
  onCopy: (text: string, id: string) => void;
  copiedKey: string | null;
}

function JsonTreeNode({
  nodeKey,
  value,
  currentPath,
  currentDotPath,
  depth,
  maxExpandDepth,
  searchTerm,
  onCopy,
  copiedKey,
}: JsonTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth <= maxExpandDepth);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  // Type styling
  const getTypeColor = () => {
    if (value === null) return "text-rose-400";
    if (typeof value === "boolean") return "text-amber-400 font-bold";
    if (typeof value === "number") return "text-emerald-400 font-mono";
    if (typeof value === "string") return "text-cyan-300";
    return "text-slate-400";
  };

  const matchesSearch = Boolean(
    searchTerm &&
      (nodeKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isObject) {
    const entries = isArray 
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : Object.entries(value as Record<string, unknown>);
    const count = entries.length;

    return (
      <div className={`pl-${Math.min(depth * 3, 12)} py-0.5 group/node`}>
        <div className={`flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800/40 transition-colors ${matchesSearch ? "bg-cyan-500/10 border border-cyan-500/30" : ""}`}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 rounded hover:bg-slate-700/60 text-slate-400 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <span className="font-semibold text-slate-200">
            {nodeKey !== "root" && `${nodeKey}: `}
          </span>

          <span className="text-[11px] text-slate-500 font-mono">
            {isArray ? `Array(${count})` : `Object(${count})`}
          </span>

          {/* Quick Copy actions for path */}
          <div className="opacity-0 group-hover/node:opacity-100 flex items-center gap-1.5 ml-auto text-[10px]">
            <button
              onClick={() => onCopy(currentPath, currentPath)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Copy JSONPath"
            >
              {copiedKey === currentPath ? "Copied!" : "JSONPath"}
            </button>
            <button
              onClick={() => onCopy(JSON.stringify(value, null, 2), `${currentPath}-val`)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Copy Subtree JSON"
            >
              {copiedKey === `${currentPath}-val` ? "Copied!" : "Copy Value"}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-l border-slate-800/80 ml-3.5 pl-2 mt-0.5 space-y-0.5">
            {entries.map(([k, val]) => {
              const childPath = isArray ? `${currentPath}[${k}]` : `${currentPath}.${k}`;
              const childDotPath = currentDotPath ? (isArray ? `${currentDotPath}[${k}]` : `${currentDotPath}.${k}`) : k;
              return (
                <JsonTreeNode
                  key={k}
                  nodeKey={k}
                  value={val}
                  currentPath={childPath}
                  currentDotPath={childDotPath}
                  depth={depth + 1}
                  maxExpandDepth={maxExpandDepth}
                  searchTerm={searchTerm}
                  onCopy={onCopy}
                  copiedKey={copiedKey}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Primitive value node
  return (
    <div className={`pl-${Math.min(depth * 3, 12)} py-0.5 group/node`}>
      <div className={`flex items-center gap-2 py-0.5 px-2 rounded-lg hover:bg-slate-800/40 transition-colors ${matchesSearch ? "bg-cyan-500/10 border border-cyan-500/30" : ""}`}>
        <span className="text-slate-400 font-medium">{nodeKey}:</span>
        <span className={`${getTypeColor()} break-all`}>
          {typeof value === "string" ? `"${value}"` : String(value)}
        </span>

        {/* Copy actions */}
        <div className="opacity-0 group-hover/node:opacity-100 flex items-center gap-1.5 ml-auto text-[10px]">
          <button
            onClick={() => onCopy(currentPath, currentPath)}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
            title="Copy JSONPath"
          >
            {copiedKey === currentPath ? "Copied!" : "Path"}
          </button>
          <button
            onClick={() => onCopy(String(value), `${currentPath}-v`)}
            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
            title="Copy Raw Value"
          >
            {copiedKey === `${currentPath}-v` ? "Copied!" : "Value"}
          </button>
        </div>
      </div>
    </div>
  );
}
