"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Clock, Copy, Check, Sparkles, Calendar, CalendarClock, 
  HelpCircle, ArrowRight, Play, Sliders, CheckCircle2, RefreshCw
} from "lucide-react";

interface CronPreset {
  name: string;
  expression: string;
  description: string;
}

const CRON_PRESETS: CronPreset[] = [
  { name: "Every minute", expression: "* * * * *", description: "Fires once every 60 seconds." },
  { name: "Every 5 minutes", expression: "*/5 * * * *", description: "At every 5th minute past the hour." },
  { name: "Every 15 minutes", expression: "*/15 * * * *", description: "Common interval for polling and sync tasks." },
  { name: "Every hour on the hour", expression: "0 * * * *", description: "At minute 0 of every hour." },
  { name: "Daily at midnight (00:00)", expression: "0 0 * * *", description: "Standard daily maintenance schedule." },
  { name: "Daily at 09:00 AM", expression: "0 9 * * *", description: "Morning daily digests and notifications." },
  { name: "Weekdays at 5:00 PM (17:00)", expression: "0 17 * * 1-5", description: "End of business day summary reports." },
  { name: "Weekly on Sunday midnight", expression: "0 0 * * 0", description: "Weekly backups and batch migrations." },
  { name: "Twice a month (1st & 15th)", expression: "0 0 1,15 * *", description: "Bi-weekly payroll and billing runs." },
  { name: "Monthly on the 1st at 00:00", expression: "0 0 1 * *", description: "First day of each month." },
];

const MONTH_NAMES = [
  "", "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Parser & Plain English explainer logic
function explainCron(expr: string): { explanation: string; isValid: boolean; error?: string } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      explanation: "A standard cron expression requires exactly 5 fields: minute hour day-of-month month day-of-week",
      isValid: false,
      error: `Expected 5 fields, found ${parts.length}`,
    };
  }

  const [min, hour, dom, mon, dow] = parts;

  try {
    let minText = "";
    if (min === "*") minText = "every minute";
    else if (min.startsWith("*/")) minText = `every ${min.replace("*/", "")} minutes`;
    else if (min.includes(",")) minText = `at minutes ${min}`;
    else minText = `at minute ${min}`;

    let hourText = "";
    if (hour === "*") hourText = "";
    else if (hour.startsWith("*/")) hourText = `past every ${hour.replace("*/", "")} hours`;
    else if (hour.includes(",")) hourText = `past hours ${hour}`;
    else hourText = `past hour ${hour.padStart(2, "0")}:00`;

    let domText = "";
    if (dom === "*") domText = "";
    else if (dom.startsWith("*/")) domText = `every ${dom.replace("*/", "")} days`;
    else if (dom.includes(",")) domText = `on day ${dom} of the month`;
    else domText = `on day-of-month ${dom}`;

    let monText = "";
    if (mon === "*") monText = "every month";
    else if (mon.includes(",")) monText = `in months ${mon}`;
    else {
      const mNum = parseInt(mon, 10);
      monText = `in ${MONTH_NAMES[mNum] || mon}`;
    }

    let dowText = "";
    if (dow === "*") dowText = "";
    else if (dow === "1-5") dowText = "on every weekday (Monday through Friday)";
    else if (dow === "0,6" || dow === "6,0") dowText = "on weekends (Saturday and Sunday)";
    else if (dow.includes(",")) dowText = `on day-of-week ${dow}`;
    else {
      const dNum = parseInt(dow, 10);
      dowText = `on ${DAY_NAMES[dNum] || `day-of-week ${dow}`}`;
    }

    // Assemble smooth English summary
    let summary = "";
    if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
      summary = "At every minute of every hour, every single day.";
    } else {
      const clauses = [minText, hourText, domText, dowText, monText].filter(Boolean);
      summary = clauses.join(", ") + ".";
      summary = summary.charAt(0).toUpperCase() + summary.slice(1);
    }

    return { explanation: summary, isValid: true };
  } catch (err: unknown) {
    return {
      explanation: "Unable to parse cron syntax",
      isValid: false,
      error: (err as Error).message,
    };
  }
}

// Compute next 5 projected execution times
function computeNextRuns(expr: string, count: number = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const [minPart, hourPart] = parts;
  const runs: Date[] = [];
  const now = new Date();
  let cursor = new Date(now.getTime() + 60000); // Start 1 min in future
  cursor.setSeconds(0, 0);

  let attempts = 0;
  while (runs.length < count && attempts < 1000) {
    attempts++;
    const m = cursor.getMinutes();
    const h = cursor.getHours();

    let matchMin = false;
    if (minPart === "*") matchMin = true;
    else if (minPart.startsWith("*/")) {
      const step = parseInt(minPart.replace("*/", ""), 10);
      matchMin = m % step === 0;
    } else if (minPart.split(",").map(Number).includes(m)) {
      matchMin = true;
    }

    let matchHour = false;
    if (hourPart === "*") matchHour = true;
    else if (hourPart.startsWith("*/")) {
      const step = parseInt(hourPart.replace("*/", ""), 10);
      matchHour = h % step === 0;
    } else if (hourPart.split(",").map(Number).includes(h)) {
      matchHour = true;
    }

    if (matchMin && matchHour) {
      runs.push(new Date(cursor));
    }

    // Advance 1 minute
    cursor = new Date(cursor.getTime() + 60000);
  }

  return runs;
}

export default function CronBuilderPage() {
  const [expression, setExpression] = useState<string>("*/15 0 1,15 * 1-5");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Field breakdown
  const fields = useMemo(() => {
    const p = expression.trim().split(/\s+/);
    return {
      minute: p[0] || "*",
      hour: p[1] || "*",
      dom: p[2] || "*",
      month: p[3] || "*",
      dow: p[4] || "*",
    };
  }, [expression]);

  const { explanation, isValid, error } = useMemo(() => explainCron(expression), [expression]);
  const nextRuns = useMemo(() => (isValid ? computeNextRuns(expression, 5) : []), [expression, isValid]);

  const updateField = (index: number, val: string) => {
    const parts = expression.trim().split(/\s+/);
    while (parts.length < 5) parts.push("*");
    parts[index] = val;
    setExpression(parts.join(" "));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
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
            <span className="text-amber-300">cron</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Cron Schedule Builder
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Plain-English translation of crontab syntax, interactive builder, and projected execution times.
              </p>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
          <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300 font-mono">POSIX Standard</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Expression & Interactive Builder (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Input Banner */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Cron Expression (5 Fields)
              </label>
              <button
                onClick={() => copyToClipboard(expression, "cron-expr")}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedType === "cron-expr" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy Cron</span>
              </button>
            </div>

            {/* Expression Big Input */}
            <div className="flex items-center bg-slate-950 rounded-2xl border border-slate-700/80 focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 p-2 sm:p-3 transition-all">
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="* * * * *"
                className="w-full bg-transparent text-center sm:text-left text-xl sm:text-2xl font-mono font-bold text-amber-300 tracking-wider focus:outline-none px-2"
              />
            </div>

            {/* Plain English Translation Card */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400/80 mb-1">
                Human Readable Translation
              </div>
              <p className="text-sm sm:text-base font-medium leading-relaxed">
                “{explanation}”
              </p>
              {error && (
                <div className="mt-2 text-xs text-rose-400 font-mono">
                  Syntax Error: {error}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Field-by-Field Visual Builder */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Interactive Schedule Selector
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Field 1: Minute */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">1. Minute (0-59)</span>
                <input
                  type="text"
                  value={fields.minute}
                  onChange={(e) => updateField(0, e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 flex-wrap">
                  {["*", "*/5", "*/15", "0"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateField(0, v)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-400"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 2: Hour */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">2. Hour (0-23)</span>
                <input
                  type="text"
                  value={fields.hour}
                  onChange={(e) => updateField(1, e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 flex-wrap">
                  {["*", "*/2", "0", "9", "18"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateField(1, v)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-400"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 3: Day of Month */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">3. Day (1-31)</span>
                <input
                  type="text"
                  value={fields.dom}
                  onChange={(e) => updateField(2, e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 flex-wrap">
                  {["*", "1", "15", "1,15"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateField(2, v)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-400"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 4: Month */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">4. Month (1-12)</span>
                <input
                  type="text"
                  value={fields.month}
                  onChange={(e) => updateField(3, e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 flex-wrap">
                  {["*", "*/3", "1", "12"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateField(3, v)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-400"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field 5: Day of Week */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">5. Weekday (0-6)</span>
                <input
                  type="text"
                  value={fields.dow}
                  onChange={(e) => updateField(4, e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-sm text-cyan-300 text-center focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-1 flex-wrap">
                  {["*", "1-5", "0,6", "0"].map((v) => (
                    <button
                      key={v}
                      onClick={() => updateField(4, v)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-400"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next Projected Execution Dates */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Upcoming Execution Timestamps
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Calculated from current local time
              </span>
            </div>

            <div className="space-y-2">
              {nextRuns.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 text-slate-500 text-xs text-center">
                  Enter a valid cron expression to calculate execution projections.
                </div>
              ) : (
                nextRuns.map((date, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-200">
                        {date.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {date.toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {date.toISOString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Presets Library (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 glass-panel shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Common Schedule Presets
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              1-click load production schedules for cron jobs, background runners, and CI/CD pipelines.
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {CRON_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setExpression(p.expression)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-amber-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      {p.expression}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {p.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
