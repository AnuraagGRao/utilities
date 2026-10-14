"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  Hash, Copy, Check, ShieldCheck, Lock, Key, RefreshCw, 
  Upload, FileText, ArrowRightLeft, Sparkles, Layers, Sliders
} from "lucide-react";

// Pure JS MD5 implementation (RFC 1321) for client-side legacy hashing
function md5(string: string): string {
  function md5_RotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function md5_AddUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    } else return lResult ^ lX8 ^ lY8;
  }
  function md5_F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function md5_G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function md5_H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function md5_I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function md5_FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
    return md5_AddUnsigned(md5_RotateLeft(a, s), b);
  }
  function md5_ConvertToWordArray(string: string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function md5_WordToHex(lValue: number) {
    let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = md5_ConvertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = md5_FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = md5_FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = md5_FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = md5_FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = md5_FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = md5_FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = md5_FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = md5_FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = md5_FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = md5_GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = md5_GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = md5_GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = md5_GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = md5_GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = md5_GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = md5_GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = md5_GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = md5_GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = md5_GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = md5_HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = md5_HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = md5_HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = md5_HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = md5_HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = md5_HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = md5_HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = md5_HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = md5_HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = md5_HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = md5_II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = md5_II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = md5_II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = md5_II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = md5_II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = md5_II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = md5_II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = md5_II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = md5_II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = md5_II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = md5_II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = md5_II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = md5_II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = md5_II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = md5_II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = md5_AddUnsigned(a, AA);
    b = md5_AddUnsigned(b, BB);
    c = md5_AddUnsigned(c, CC);
    d = md5_AddUnsigned(d, DD);
  }
  return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
}

type StudioTab = "hash" | "base64" | "hmac" | "uuid";

export default function HashStudioPage() {
  const [activeTab, setActiveTab] = useState<StudioTab>("hash");
  const [inputText, setInputText] = useState<string>("Hello, Cloudflare Workers & Antigravity!");
  const [isUppercase, setIsUppercase] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Hash state
  const [hashes, setHashes] = useState<Record<string, string>>({
    "SHA-256": "",
    "SHA-512": "",
    "SHA-384": "",
    "SHA-1": "",
    "MD5": "",
  });

  // Base64 state
  const [base64Encoded, setBase64Encoded] = useState<string>("");
  const [base64Decoded, setBase64Decoded] = useState<string>("");
  const [urlSafeBase64, setUrlSafeBase64] = useState<boolean>(false);

  // HMAC state
  const [hmacSecret, setHmacSecret] = useState<string>("super-secret-key-123");
  const [hmacAlgo, setHmacAlgo] = useState<string>("SHA-256");
  const [hmacHex, setHmacHex] = useState<string>("");
  const [hmacBase64, setHmacBase64] = useState<string>("");

  // UUID Generator state
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuidNoHyphens, setUuidNoHyphens] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);

  // Compute Hashes via Web Crypto API
  const computeHashes = useCallback(async (text: string) => {
    if (!text) {
      setHashes({ "SHA-256": "", "SHA-512": "", "SHA-384": "", "SHA-1": "", "MD5": "" });
      return;
    }

    const enc = new TextEncoder();
    const data = enc.encode(text);

    const toHex = (buffer: ArrayBuffer) => {
      const bytes = new Uint8Array(buffer);
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    try {
      const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
        window.crypto.subtle.digest("SHA-256", data),
        window.crypto.subtle.digest("SHA-512", data),
        window.crypto.subtle.digest("SHA-384", data),
        window.crypto.subtle.digest("SHA-1", data),
      ]);

      setHashes({
        "SHA-256": toHex(sha256Buf),
        "SHA-512": toHex(sha512Buf),
        "SHA-384": toHex(sha384Buf),
        "SHA-1": toHex(sha1Buf),
        "MD5": md5(text),
      });
    } catch (err) {
      console.error("Crypto error:", err);
    }
  }, []);

  // Compute Base64
  useEffect(() => {
    try {
      // Encode
      const encoded = btoa(unescape(encodeURIComponent(inputText)));
      setBase64Encoded(urlSafeBase64 ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : encoded);
    } catch {
      setBase64Encoded("Encoding error");
    }

    try {
      // Try decode inputText in case user pasted Base64
      const normalized = inputText.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = decodeURIComponent(escape(atob(normalized)));
      setBase64Decoded(decoded);
    } catch {
      setBase64Decoded("(Input is not valid Base64)");
    }
  }, [inputText, urlSafeBase64]);

  // Compute HMAC
  useEffect(() => {
    async function calculateHmac() {
      if (!inputText || !hmacSecret) {
        setHmacHex("");
        setHmacBase64("");
        return;
      }

      try {
        const enc = new TextEncoder();
        const keyData = enc.encode(hmacSecret);
        const msgData = enc.encode(inputText);

        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: hmacAlgo },
          false,
          ["sign"]
        );

        const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, msgData);
        const bytes = new Uint8Array(signature);
        const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
        const b64 = btoa(String.fromCharCode(...bytes));

        setHmacHex(hex);
        setHmacBase64(b64);
      } catch (e) {
        console.error("HMAC calculation error", e);
      }
    }
    calculateHmac();
  }, [inputText, hmacSecret, hmacAlgo]);

  // Compute UUIDs
  const generateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = crypto.randomUUID();
      if (uuidNoHyphens) u = u.replace(/-/g, "");
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setUuids(list);
  }, [uuidCount, uuidNoHyphens, uuidUppercase]);

  useEffect(() => {
    computeHashes(inputText);
  }, [inputText, computeHashes]);

  useEffect(() => {
    generateUuids();
  }, [generateUuids]);

  const copyToClipboard = (text: string, key: string) => {
    const val = isUppercase ? text.toUpperCase() : text;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setInputText(reader.result);
      }
    };
    reader.readAsText(file);
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
            <span className="text-teal-300">hash</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Base64 &amp; Hash Studio
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                100% Client-Side WebCrypto. Zero-server transmission for hashes, Base64, HMAC, and UUIDs.
              </p>
            </div>
          </div>
        </div>

        {/* Client-Side Privacy Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-medium">Web Crypto API · Sandboxed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("hash")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === "hash"
              ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Cryptographic Hashes</span>
        </button>
        <button
          onClick={() => setActiveTab("base64")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === "base64"
              ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Base64 Studio</span>
        </button>
        <button
          onClick={() => setActiveTab("hmac")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === "hmac"
              ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>HMAC Signatures</span>
        </button>
        <button
          onClick={() => setActiveTab("uuid")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
            activeTab === "uuid"
              ? "bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>UUID v4 Generator</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full mt-6 space-y-6">
        {activeTab !== "uuid" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                Raw Input Text / Payload
              </label>
              <div className="flex items-center gap-3 text-xs">
                <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                  <Upload className="w-3 h-3 text-teal-400" />
                  <span>Upload File</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={() => setIsUppercase(!isUppercase)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    isUppercase ? "bg-teal-500/20 text-teal-300 border border-teal-500/30" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  UPPERCASE
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text or paste payload to hash / encode..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500/60 leading-relaxed resize-y"
            />
          </div>
        )}

        {/* Tab 1: Hashes */}
        {activeTab === "hash" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(hashes).map(([algo, val]) => {
              const displayVal = isUppercase ? val.toUpperCase() : val;
              const isCopied = copiedKey === algo;

              return (
                <div
                  key={algo}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-300">{algo}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {val ? `${val.length / 2} bytes (${val.length * 4} bits)` : "0 bytes"}
                      </span>
                    </div>
                    <button
                      disabled={!val}
                      onClick={() => copyToClipboard(val, algo)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all leading-relaxed">
                    {displayVal || <span className="text-slate-600">Enter input above to calculate hash...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Base64 */}
        {activeTab === "base64" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Encode */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                    Base64 Encoded
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={urlSafeBase64}
                      onChange={(e) => setUrlSafeBase64(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
                    />
                    <span>URL-Safe (-_)</span>
                  </label>
                </div>
                <button
                  onClick={() => copyToClipboard(base64Encoded, "b64-enc")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 hover:bg-slate-700"
                >
                  {copiedKey === "b64-enc" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                value={base64Encoded}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed break-all select-all focus:outline-none"
              />
            </div>

            {/* Decode */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Base64 Decoded (as UTF-8)
                </span>
                <button
                  disabled={base64Decoded.startsWith("(")}
                  onClick={() => copyToClipboard(base64Decoded, "b64-dec")}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5 hover:bg-slate-700 disabled:opacity-40"
                >
                  {copiedKey === "b64-dec" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={6}
                value={base64Decoded}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed break-all select-all focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 3: HMAC */}
        {activeTab === "hmac" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-teal-400" />
                  Secret Key
                </label>
                <input
                  type="text"
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  placeholder="Enter secret key string..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hash Algorithm
                </label>
                <select
                  value={hmacAlgo}
                  onChange={(e) => setHmacAlgo(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-teal-500/60"
                >
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-512">SHA-512</option>
                  <option value="SHA-384">SHA-384</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-teal-300 font-semibold">HMAC (Hex Digest)</span>
                  <button
                    onClick={() => copyToClipboard(hmacHex, "hmac-hex")}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1 hover:bg-slate-700"
                  >
                    {copiedKey === "hmac-hex" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Hex</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs break-all select-all">
                  {hmacHex || <span className="text-slate-600">Calculating signature...</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-teal-300 font-semibold">HMAC (Base64 Digest)</span>
                  <button
                    onClick={() => copyToClipboard(hmacBase64, "hmac-b64")}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1 hover:bg-slate-700"
                  >
                    {copiedKey === "hmac-b64" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Base64</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs break-all select-all">
                  {hmacBase64 || <span className="text-slate-600">Calculating signature...</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: UUID Generator */}
        {activeTab === "uuid" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">Count:</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={uuidCount}
                    onChange={(e) => setUuidCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                    className="w-16 p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-xs text-slate-100"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uuidUppercase}
                    onChange={(e) => setUuidUppercase(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <span>Uppercase</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uuidNoHyphens}
                    onChange={(e) => setUuidNoHyphens(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-0"
                  />
                  <span>No Hyphens</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateUuids}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={() => copyToClipboard(uuids.join("\n"), "uuid-all")}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === "uuid-all" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy All</span>
                </button>
              </div>
            </div>

            {/* UUID List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {uuids.map((u, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/70 flex items-center justify-between gap-3 text-xs font-mono group hover:border-teal-500/30 transition-colors"
                >
                  <span className="text-slate-500 w-6">#{i + 1}</span>
                  <span className="text-slate-200 select-all flex-1 truncate">{u}</span>
                  <button
                    onClick={() => copyToClipboard(u, `uuid-${i}`)}
                    className="opacity-75 group-hover:opacity-100 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                  >
                    {copiedKey === `uuid-${i}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
