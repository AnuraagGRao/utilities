"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { 
  Ruler, Upload, Crosshair, ZoomIn, ZoomOut, RotateCcw, 
  Copy, Check, Sparkles, Layers, Sliders, Maximize2, Move
} from "lucide-react";

interface MeasurementBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export default function RulerToolPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [measurement, setMeasurement] = useState<MeasurementBox | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dpi, setDpi] = useState<number>(96); // Standard web CSS DPI
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [guides, setGuides] = useState<{ type: "h" | "v"; pos: number }[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);

  // Default sample wireframe canvas if no image uploaded
  const handleLoadSampleMockup = () => {
    // Generate clean geometric mockup using SVG canvas data URL
    const svgMockup = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#0f172a" />
        <rect x="40" y="40" width="720" height="70" rx="12" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <circle cx="80" cy="75" r="16" fill="#06b6d4" />
        <rect x="120" y="65" width="180" height="20" rx="6" fill="#475569" />
        <rect x="580" y="60" width="140" height="30" rx="8" fill="#8b5cf6" />
        
        <rect x="40" y="140" width="460" height="310" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <rect x="70" y="170" width="300" height="32" rx="6" fill="#06b6d4" fill-opacity="0.2"/>
        <rect x="70" y="220" width="400" height="14" rx="4" fill="#64748b" />
        <rect x="70" y="245" width="360" height="14" rx="4" fill="#64748b" />
        <rect x="70" y="270" width="280" height="14" rx="4" fill="#64748b" />
        <rect x="70" y="320" width="130" height="42" rx="8" fill="#10b981" />
        <rect x="220" y="320" width="130" height="42" rx="8" fill="#334155" />

        <rect x="520" y="140" width="240" height="145" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <circle cx="560" cy="180" r="14" fill="#f59e0b" />
        <rect x="590" y="172" width="130" height="16" rx="4" fill="#94a3b8" />
        <rect x="545" y="220" width="190" height="40" rx="8" fill="#0f172a" />

        <rect x="520" y="305" width="240" height="145" rx="16" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <circle cx="560" cy="345" r="14" fill="#ec4899" />
        <rect x="590" y="337" width="130" height="16" rx="4" fill="#94a3b8" />
      </svg>
    `;
    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svgMockup)}`;
    setImageSrc(encoded);
    setMeasurement(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setMeasurement(null);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasAreaRef.current) return;
    const rect = canvasAreaRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    setIsDrawing(true);
    setMeasurement({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasAreaRef.current) return;
    const rect = canvasAreaRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    setCursorPos({ x, y });

    if (isDrawing && measurement) {
      setMeasurement({
        ...measurement,
        currentX: x,
        currentY: y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // Dimensions math
  const width = measurement ? Math.abs(measurement.currentX - measurement.startX) : 0;
  const height = measurement ? Math.abs(measurement.currentY - measurement.startY) : 0;
  const diagonal = Math.round(Math.sqrt(width * width + height * height));
  const angle = measurement && width > 0
    ? Math.round((Math.atan2(measurement.currentY - measurement.startY, measurement.currentX - measurement.startX) * 180) / Math.PI)
    : 0;

  // Aspect ratio helper
  const getAspectRatio = (w: number, h: number): string => {
    if (w === 0 || h === 0) return "-";
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  };

  // Physical unit conversions based on DPI
  const widthInches = (width / dpi).toFixed(2);
  const heightInches = (height / dpi).toFixed(2);
  const widthCm = ((width / dpi) * 2.54).toFixed(2);
  const heightCm = ((height / dpi) * 2.54).toFixed(2);

  const copyCssSnippet = () => {
    const snippet = `width: ${width}px;\nheight: ${height}px;\naspect-ratio: ${width} / ${height};`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1800);
  };

  const addHorizontalGuide = () => {
    setGuides((prev) => [...prev, { type: "h", pos: cursorPos.y }]);
  };

  const addVerticalGuide = () => {
    setGuides((prev) => [...prev, { type: "v", pos: cursorPos.x }]);
  };

  const clearGuides = () => setGuides([]);

  // Bounding rect for drawing box
  const boxLeft = measurement ? Math.min(measurement.startX, measurement.currentX) : 0;
  const boxTop = measurement ? Math.min(measurement.startY, measurement.currentY) : 0;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono mb-1">
            <span>UTILITIES</span>
            <span>/</span>
            <span>DESIGN & UX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Ruler className="w-7 h-7 text-cyan-400" />
            Screen Ruler & Caliper
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pixel-accurate caliper canvas. Measure layout elements, component spacing, aspect ratios, and angles.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleLoadSampleMockup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Load Sample UI
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            Upload Screenshot
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <button
            onClick={() => {
              setImageSrc(null);
              setMeasurement(null);
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700/60 transition-all"
            title="Reset Canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Measurement Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Width</span>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{width} px</div>
          <span className="text-[10px] text-slate-500">{widthInches} in · {widthCm} cm</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Height</span>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{height} px</div>
          <span className="text-[10px] text-slate-500">{heightInches} in · {heightCm} cm</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Diagonal Distance</span>
          <div className="text-lg font-bold font-mono text-violet-400 mt-0.5">{diagonal} px</div>
          <span className="text-[10px] text-slate-500">Angle: {angle}°</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Aspect Ratio</span>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
            {getAspectRatio(width, height)}
          </div>
          <span className="text-[10px] text-slate-500">
            {width > 0 && height > 0 ? (width / height).toFixed(2) : "0.00"}:1
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Cursor (X, Y)</span>
          <div className="text-lg font-bold font-mono text-slate-300 mt-0.5">
            {cursorPos.x}, {cursorPos.y}
          </div>
          <span className="text-[10px] text-slate-500">Canvas coordinate</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400">CSS Snippet</span>
          <button
            onClick={copyCssSnippet}
            disabled={width === 0 || height === 0}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 transition-colors mt-1"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            Copy CSS
          </button>
        </div>
      </div>

      {/* Canvas Controls Bar */}
      <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Zoom:</span>
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-slate-200 px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px]"
          >
            100%
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* DPI Setting */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Display DPI:</span>
            <select
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value={96}>96 DPI (Standard Web)</option>
              <option value={72}>72 DPI (Print / Mac)</option>
              <option value={192}>192 DPI (Retina 2x)</option>
            </select>
          </div>

          {/* Guideline creators */}
          <button
            onClick={addHorizontalGuide}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
          >
            + H-Guide
          </button>
          <button
            onClick={addVerticalGuide}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs"
          >
            + V-Guide
          </button>
          {guides.length > 0 && (
            <button
              onClick={clearGuides}
              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs"
            >
              Clear Guides ({guides.length})
            </button>
          )}
        </div>
      </div>

      {/* Interactive Measuring Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[540px] rounded-2xl bg-slate-950 border border-slate-800 overflow-auto flex items-center justify-center p-8 bg-grid-pattern cursor-crosshair select-none"
      >
        {!imageSrc ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
              <Crosshair className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">No Image or Wireframe Loaded</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Upload any UI screenshot or load our interactive sample wireframe to measure element dimensions, padding, and alignments with pixel precision.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLoadSampleMockup}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all"
              >
                Load Sample Mockup
              </button>
              <label className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-all">
                Upload Custom Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <div
            ref={canvasAreaRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="relative border border-slate-700/80 shadow-2xl rounded-lg overflow-hidden bg-slate-900"
          >
            {/* Target Image / Canvas */}
            <img
              src={imageSrc}
              alt="Measurement Target"
              className="max-w-none block pointer-events-none"
              draggable={false}
            />

            {/* Guides */}
            {guides.map((g, idx) => (
              <div
                key={idx}
                className={`absolute pointer-events-none ${
                  g.type === "h"
                    ? "left-0 right-0 border-t border-cyan-400/80"
                    : "top-0 bottom-0 border-l border-cyan-400/80"
                }`}
                style={g.type === "h" ? { top: `${g.pos}px` } : { left: `${g.pos}px` }}
              >
                <span className="absolute top-1 left-1 text-[9px] font-mono text-cyan-300 bg-slate-950/80 px-1 rounded">
                  {g.pos}px
                </span>
              </div>
            ))}

            {/* Active Measurement Selection Bounding Box */}
            {measurement && width > 0 && height > 0 && (
              <div
                className="absolute border-2 border-cyan-400 bg-cyan-500/20 pointer-events-none transition-none shadow-sm"
                style={{
                  left: `${boxLeft}px`,
                  top: `${boxTop}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
              >
                {/* Dimensions Tag */}
                <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-bold font-mono shadow-md whitespace-nowrap">
                  {width} × {height} px
                </div>

                {/* Diagonal Guide line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  <line
                    x1="0"
                    y1="0"
                    x2={width}
                    y2={height}
                    stroke="#8b5cf6"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
