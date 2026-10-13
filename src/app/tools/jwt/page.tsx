"use client";

import { useState, useMemo, useEffect } from "react";
import { KeyRound, Copy, Check, AlertCircle, Shield, Clock, Sparkles } from "lucide-react";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFudXJhYWcgUmFvIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImFkbWluIjp0cnVlLCJlbWFpbCI6ImhlbGxvQGFudXJhYWdncmFvLmNvbSJ9.4flZl0-KjJtXw8l4tV8dD-q5G9v3v-5I5k0J7a6Z2s8";

export default function JwtInspectorPage() {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    setCurrentTime(Date.now());
  }, []);

  const { header, payload, signature, isExpired, expDate, error } = useMemo(() => {
    if (!token.trim()) {
      return { header: null, payload: null, signature: null, isExpired: false, expDate: null, error: null };
    }

    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        return { 
          header: null, 
          payload: null, 
          signature: null, 
          isExpired: false, 
          expDate: null, 
          error: "Invalid JWT format. A valid token must have 3 segments separated by dots." 
        };
      }

      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) base64 += "=";
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const decodedHeader = JSON.parse(decodeBase64Url(parts[0]));
      const decodedPayload = JSON.parse(decodeBase64Url(parts[1]));
      const signaturePart = parts[2];

      let exp: Date | null = null;
      let expired = false;

      if (decodedPayload.exp) {
        exp = new Date(decodedPayload.exp * 1000);
        expired = currentTime ? exp.getTime() < currentTime : false;
      }

      return {
        header: decodedHeader,
        payload: decodedPayload,
        signature: signaturePart,
        isExpired: expired,
        expDate: exp,
        error: null,
      };
    } catch (err: unknown) {
      return {
        header: null,
        payload: null,
        signature: null,
        isExpired: false,
        expDate: null,
        error: err instanceof Error ? err.message : "Malformed JWT base64 payload",
      };
    }
  }, [token, currentTime]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
          <span>UTILITIES</span>
          <span>/</span>
          <span>DEVELOPER</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <KeyRound className="w-7 h-7 text-cyan-400" />
          JWT Inspector
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Decode and inspect JSON Web Tokens locally. Verified 100% offline—tokens are never transmitted to any server.
        </p>
      </div>

      {/* Input Token Area */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 glass-panel flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>Encoded Token</span>
          <button
            onClick={() => setToken(SAMPLE_JWT)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample JWT
          </button>
        </div>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT string (header.payload.signature)..."
          className="w-full h-24 p-3 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 border border-slate-800 resize-none break-all"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Decoded Sections */}
      {!error && header && payload && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider font-mono">
                Algorithm & Header
              </span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(header, null, 2), "hdr")}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copiedSection === "hdr" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-rose-300 border border-slate-800/80 overflow-x-auto flex-1">
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 glass-panel flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider font-mono">
                  Payload Data
                </span>
                {expDate && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isExpired ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"}`}>
                    {isExpired ? "Expired" : "Active"}
                  </span>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(payload, null, 2), "pay")}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copiedSection === "pay" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-violet-300 border border-slate-800/80 overflow-x-auto flex-1">
              {JSON.stringify(payload, null, 2)}
            </pre>
            {expDate && (
              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Expiration: {expDate.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
