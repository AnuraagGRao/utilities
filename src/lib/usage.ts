import { TOOLS } from "./tools";
import { ToolItem } from "@/types";

const USAGE_STORAGE_KEY = "utils_tool_usage_v1";

// Sensible seed counts so the top bar has smart defaults before any clicks
export const DEFAULT_USAGE: Record<string, number> = {
  json: 24,
  ruler: 18,
  subdomains: 15,
  deals: 12,
  jwt: 8,
  diff: 5,
};

export interface ToolWithUsage extends ToolItem {
  visits: number;
}

export function getToolUsageCounts(): Record<string, number> {
  if (typeof window === "undefined") {
    return { ...DEFAULT_USAGE };
  }

  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(DEFAULT_USAGE));
      return { ...DEFAULT_USAGE };
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USAGE, ...parsed };
  } catch {
    return { ...DEFAULT_USAGE };
  }
}

export function recordToolVisit(toolId: string): void {
  if (typeof window === "undefined" || !toolId) return;

  try {
    const counts = getToolUsageCounts();
    counts[toolId] = (counts[toolId] || 0) + 1;
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(counts));

    // Dispatch custom event for real-time reactive sync across Navbar & pages
    window.dispatchEvent(new CustomEvent("tool-usage-updated", { detail: { toolId, count: counts[toolId] } }));
  } catch (err) {
    console.warn("Could not save tool usage to localStorage:", err);
  }
}

export function getSortedToolsByUsage(limit = 4): ToolWithUsage[] {
  const counts = getToolUsageCounts();

  const sorted = [...TOOLS].map((tool) => ({
    ...tool,
    visits: counts[tool.id] || 0,
  })).sort((a, b) => b.visits - a.visits);

  return limit ? sorted.slice(0, limit) : sorted;
}
