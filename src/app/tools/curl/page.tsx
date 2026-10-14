"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Code2, Copy, Check, Sparkles, Terminal, FileCode, 
  ArrowRight, ShieldCheck, RefreshCw, Send
} from "lucide-react";

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  auth: string | null;
}

const SAMPLE_CURL = `curl -X POST https://api.anuraaggrao.com/v1/telemetry \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sec_tok_99812x4" \\
  -d '{"event":"visit","route":"/tools/curl","timestamp":1776118400}'`;

function parseCurl(rawCurl: string): ParsedCurl {
  // Normalize multi-line backslashes
  const clean = rawCurl.replace(/\\\s*\n/g, " ").trim();
  
  // Method
  let method = "GET";
  const methodMatch = clean.match(/(?:-X|--request)\s+([A-Z]+)/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  } else if (clean.includes("-d ") || clean.includes("--data") || clean.includes("--data-raw")) {
    method = "POST";
  }

  // URL
  let url = "https://example.com/api";
  const urlMatch = clean.match(/(?:curl\s+)?(?:["']?)(https?:\/\/[^\s"']+)(?:["']?)/i);
  if (urlMatch) {
    url = urlMatch[1];
  }

  // Headers
  const headers: Record<string, string> = {};
  const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
  let hm: RegExpExecArray | null;
  while ((hm = headerRegex.exec(clean)) !== null) {
    const [k, ...v] = hm[1].split(":");
    if (k && v.length > 0) {
      headers[k.trim()] = v.join(":").trim();
    }
  }

  // Basic Auth (-u user:pass)
  let auth: string | null = null;
  const authMatch = clean.match(/(?:-u|--user)\s+["']?([^"'\s]+)["']?/);
  if (authMatch) {
    auth = authMatch[1];
  }

  // Body
  let body: string | null = null;
  const bodyMatch = clean.match(/(?:-d|--data|--data-raw)\s+["']([\s\S]*?)["'](?:\s+-[A-Za-z]|$)/);
  if (bodyMatch) {
    body = bodyMatch[1];
  } else {
    // Check if json enclosed in single quotes directly
    const directJsonMatch = clean.match(/-d\s+'(\{[\s\S]*?\})'/);
    if (directJsonMatch) {
      body = directJsonMatch[1];
    }
  }

  return { method, url, headers, body, auth };
}

// Transpilers
function toJavaScriptFetch(p: ParsedCurl): string {
  const hasHeaders = Object.keys(p.headers).length > 0;
  const hasBody = Boolean(p.body);

  const opts: string[] = [`  method: "${p.method}",`];
  if (hasHeaders) {
    opts.push(`  headers: ${JSON.stringify(p.headers, null, 4).replace(/\n/g, "\n  ")},`);
  }
  if (hasBody) {
    opts.push(`  body: JSON.stringify(${p.body?.trim().startsWith("{") ? p.body : JSON.stringify(p.body)}),`);
  }

  return `async function sendRequest() {
  const response = await fetch("${p.url}", {
${opts.join("\n")}
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  const data = await response.json();
  console.log(data);
  return data;
}

sendRequest();`;
}

function toPythonRequests(p: ParsedCurl): string {
  const lines: string[] = ["import requests", ""];
  lines.push(`url = "${p.url}"`);

  if (Object.keys(p.headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(p.headers, null, 4)}`);
  } else {
    lines.push("headers = {}");
  }

  let bodyParam = "";
  if (p.body) {
    try {
      JSON.parse(p.body);
      lines.push(`payload = ${p.body}`);
      bodyParam = ", json=payload";
    } catch {
      lines.push(`payload = """${p.body}"""`);
      bodyParam = ", data=payload";
    }
  }

  lines.push("");
  lines.push(`response = requests.${p.method.toLowerCase()}(url, headers=headers${bodyParam})`);
  lines.push("print(response.status_code)");
  lines.push("print(response.json())");

  return lines.join("\n");
}

function toGolang(p: ParsedCurl): string {
  const lines: string[] = [
    "package main",
    "",
    "import (",
    '\t"bytes"',
    '\t"context"',
    '\t"fmt"',
    '\t"io"',
    '\t"net/http"',
    '\t"time"',
    ")",
    "",
    "func main() {",
    "\tctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)",
    "\tdefer cancel()",
    "",
  ];

  if (p.body) {
    lines.push(`\tpayload := []byte(\`${p.body}\`)`);
    lines.push(`\treq, err := http.NewRequestWithContext(ctx, "${p.method}", "${p.url}", bytes.NewBuffer(payload))`);
  } else {
    lines.push(`\treq, err := http.NewRequestWithContext(ctx, "${p.method}", "${p.url}", nil)`);
  }

  lines.push("\tif err != nil {");
  lines.push("\t\tpanic(err)");
  lines.push("\t}");
  lines.push("");

  for (const [k, v] of Object.entries(p.headers)) {
    lines.push(`\treq.Header.Set("${k}", "${v}")`);
  }

  lines.push("");
  lines.push("\tclient := &http.Client{}");
  lines.push("\tresp, err := client.Do(req)");
  lines.push("\tif err != nil {");
  lines.push("\t\tpanic(err)");
  lines.push("\t}");
  lines.push("\tdefer resp.Body.Close()");
  lines.push("");
  lines.push("\tbody, _ := io.ReadAll(resp.Body)");
  lines.push('\tfmt.Printf("Status: %s\\nResponse: %s\\n", resp.Status, string(body))');
  lines.push("}");

  return lines.join("\n");
}

function toNodeAxios(p: ParsedCurl): string {
  return `const axios = require("axios");

const config = {
  method: "${p.method.toLowerCase()}",
  url: "${p.url}",
  headers: ${JSON.stringify(p.headers, null, 2)},
  ${p.body ? `data: ${p.body}` : ""}
};

axios(config)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });`;
}

type TargetLang = "javascript" | "python" | "go" | "axios";

export default function CurlTranspilerPage() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [targetLang, setTargetLang] = useState<TargetLang>("javascript");
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => parseCurl(curlInput), [curlInput]);

  const outputCode = useMemo(() => {
    switch (targetLang) {
      case "javascript":
        return toJavaScriptFetch(parsed);
      case "python":
        return toPythonRequests(parsed);
      case "go":
        return toGolang(parsed);
      case "axios":
        return toNodeAxios(parsed);
      default:
        return toJavaScriptFetch(parsed);
    }
  }, [parsed, targetLang]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
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
            <span className="text-sky-300">curl</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                cURL to Code Transpiler
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Convert terminal cURL commands into production-ready fetch, Python requests, Axios, or Go HTTP calls.
              </p>
            </div>
          </div>
        </div>

        {/* Client-Side Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-medium">100% Client-Side AST Parsing</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left: Input cURL */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                Raw cURL Command
              </label>
              <button
                onClick={() => setCurlInput(SAMPLE_CURL)}
                className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              >
                Load Sample
              </button>
            </div>

            <textarea
              rows={14}
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              placeholder="Paste curl command here..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500/60 leading-relaxed resize-y"
            />
          </div>

          {/* Quick Parsed Meta */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                {parsed.method}
              </span>
              <span className="text-slate-400 truncate max-w-xs">{parsed.url}</span>
            </div>
            <span className="text-[11px] text-slate-500 shrink-0">
              {Object.keys(parsed.headers).length} headers
            </span>
          </div>
        </div>

        {/* Right: Transpiled Code */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Target Lang Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: "javascript", label: "JS (fetch)" },
                  { key: "python", label: "Python (requests)" },
                  { key: "go", label: "Golang (net/http)" },
                  { key: "axios", label: "Node.js (Axios)" },
                ].map((l) => (
                  <button
                    key={l.key}
                    onClick={() => setTargetLang(l.key as TargetLang)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      targetLang === l.key
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Copy Code */}
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            {/* Code Output Area */}
            <pre className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[420px] select-all">
              <code>{outputCode}</code>
            </pre>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
            <span>Client-side generated</span>
            <span>Zero server communication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
