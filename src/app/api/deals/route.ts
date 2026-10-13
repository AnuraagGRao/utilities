import { NextRequest, NextResponse } from "next/server";
import { DealItem } from "@/types";


// CheapShark store ID mapping
const CHEAPSHARK_STORES: Record<string, string> = {
  "1": "Steam",
  "2": "GamersGate",
  "3": "GreenManGaming",
  "7": "GOG",
  "11": "Humble Store",
  "25": "Epic Games",
  "31": "Blizzard",
};

// In-memory cache
interface CacheEntry {
  timestamp: number;
  data: DealItem[];
}
let dealsCache: CacheEntry | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || "all";
  const query = searchParams.get("q")?.toLowerCase() || "";

  // Fetch fresh deals if cache is stale
  const now = Date.now();
  if (!dealsCache || now - dealsCache.timestamp > CACHE_TTL_MS) {
    const deals: DealItem[] = [];

    // Helper fetcher
    const fetchWithTimeout = async (url: string, timeoutMs = 6000) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DealRadar/1.0",
            Accept: "application/json",
          },
        });
        return res;
      } finally {
        clearTimeout(timeout);
      }
    };

    // 1. CheapShark Deals
    const fetchCheapShark = async () => {
      try {
        const res = await fetchWithTimeout(
          "https://www.cheapshark.com/api/1.0/deals?pageSize=40&sortBy=Savings&desc=1"
        );
        if (res && res.ok) {
          const items = await res.json();
          if (Array.isArray(items)) {
            for (const item of items) {
              const normal = parseFloat(item.normalPrice) || 0;
              const sale = parseFloat(item.salePrice) || 0;
              const savings = Math.round(parseFloat(item.savings) || 0);

              deals.push({
                id: `cs-${item.dealID}`,
                title: item.title,
                source: "cheapshark",
                sourceName: CHEAPSHARK_STORES[item.storeID] || "Digital Store",
                dealUrl: `https://www.cheapshark.com/redirect?dealID=${item.dealID}`,
                normalPrice: normal,
                salePrice: sale,
                savingsPercent: savings,
                thumbUrl: item.thumb,
                category: "Gaming",
                storeName: CHEAPSHARK_STORES[item.storeID] || "Digital Store",
                publishedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (err) {
        console.warn("CheapShark fetch error:", err);
      }
    };

    // 2. Reddit r/buildapcsales Deals
    const fetchRedditHardware = async () => {
      try {
        const res = await fetchWithTimeout(
          "https://www.reddit.com/r/buildapcsales/hot.json?limit=25"
        );
        if (res && res.ok) {
          const data = await res.json();
          const posts = data?.data?.children || [];
          for (const post of posts) {
            const p = post.data;
            if (p.stickied || p.is_self && !p.url) continue;

            // Extract price from title if available (e.g., $199.99)
            const priceMatch = p.title.match(/\$(\d+(?:\.\d{2})?)/);
            const extractedPrice = priceMatch ? parseFloat(priceMatch[1]) : undefined;

            deals.push({
              id: `reddit-bapcs-${p.id}`,
              title: p.title,
              source: "reddit-buildapcsales",
              sourceName: "r/buildapcsales",
              dealUrl: p.url.startsWith("http") ? p.url : `https://reddit.com${p.permalink}`,
              salePrice: extractedPrice,
              thumbUrl: p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : undefined,
              category: "PC Hardware & Tech",
              storeName: p.link_flair_text || "Verified Deal",
              publishedAt: new Date(p.created_utc * 1000).toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn("Reddit buildapcsales fetch error:", err);
      }
    };

    // 3. Reddit r/deals
    const fetchRedditGeneral = async () => {
      try {
        const res = await fetchWithTimeout(
          "https://www.reddit.com/r/deals/hot.json?limit=25"
        );
        if (res && res.ok) {
          const data = await res.json();
          const posts = data?.data?.children || [];
          for (const post of posts) {
            const p = post.data;
            if (p.stickied) continue;

            const priceMatch = p.title.match(/\$(\d+(?:\.\d{2})?)/);
            const extractedPrice = priceMatch ? parseFloat(priceMatch[1]) : undefined;

            deals.push({
              id: `reddit-deals-${p.id}`,
              title: p.title,
              source: "reddit-deals",
              sourceName: "r/deals",
              dealUrl: p.url.startsWith("http") ? p.url : `https://reddit.com${p.permalink}`,
              salePrice: extractedPrice,
              thumbUrl: p.thumbnail && p.thumbnail.startsWith("http") ? p.thumbnail : undefined,
              category: "General Consumer",
              storeName: p.domain || "Retail",
              publishedAt: new Date(p.created_utc * 1000).toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn("Reddit deals fetch error:", err);
      }
    };

    await Promise.allSettled([fetchCheapShark(), fetchRedditHardware(), fetchRedditGeneral()]);

    dealsCache = {
      timestamp: now,
      data: deals,
    };
  }

  // Filter based on query and category
  let filtered = dealsCache.data;

  if (category === "gaming") {
    filtered = filtered.filter((d) => d.category === "Gaming");
  } else if (category === "hardware") {
    filtered = filtered.filter((d) => d.category === "PC Hardware & Tech");
  } else if (category === "general") {
    filtered = filtered.filter((d) => d.category === "General Consumer");
  }

  if (query) {
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(query) ||
        d.storeName?.toLowerCase().includes(query) ||
        d.category?.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    count: filtered.length,
    totalCached: dealsCache.data.length,
    cachedAt: new Date(dealsCache.timestamp).toISOString(),
    deals: filtered,
  });
}
