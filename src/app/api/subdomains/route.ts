import { NextRequest, NextResponse } from "next/server";
import { SubdomainRecord } from "@/types";


function sanitizeDomain(raw: string): string {
  let domain = raw.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.replace(/^www\./i, "");
  domain = domain.split("/")[0];
  domain = domain.split(":")[0];
  return domain;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const rawDomain = searchParams.get("domain");

  if (!rawDomain) {
    return NextResponse.json(
      { error: "Domain parameter is required (e.g., ?domain=example.com)" },
      { status: 400 }
    );
  }

  const domain = sanitizeDomain(rawDomain);
  if (!domain || !domain.includes(".")) {
    return NextResponse.json(
      { error: "Please enter a valid apex domain (e.g., github.com, uber.com)" },
      { status: 400 }
    );
  }

  const resultsMap = new Map<string, SubdomainRecord>();

  // Helper with timeout
  const fetchWithTimeout = async (url: string, timeoutMs: number = 7000) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) UtilitiesBot/1.0",
        },
      });
      return res;
    } finally {
      clearTimeout(timeout);
    }
  };

  // 1. Fetch from crt.sh (Certificate Transparency Logs)
  const fetchCrtSh = async () => {
    try {
      const url = `https://crt.sh/?q=%.${encodeURIComponent(domain)}&output=json`;
      const res = await fetchWithTimeout(url, 7500);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            if (typeof item.name_value === "string") {
              const lines = item.name_value.split("\n");
              for (const line of lines) {
                const sub = line.trim().toLowerCase().replace(/^\*\./, "");
                if (
                  sub &&
                  (sub === domain || sub.endsWith(`.${domain}`)) &&
                  !sub.includes(" ")
                ) {
                  if (!resultsMap.has(sub)) {
                    resultsMap.set(sub, {
                      subdomain: sub,
                      source: "crt.sh (CT Logs)",
                      status: "unknown",
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      // crt.sh occasionally rate limits or times out; continue with HackerTarget
    }
  };

  // 2. Fetch from HackerTarget HostSearch
  const fetchHackerTarget = async () => {
    try {
      const url = `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`;
      const res = await fetchWithTimeout(url, 6000);
      if (res && res.ok) {
        const text = await res.text();
        if (text && !text.includes("error") && !text.includes("No records")) {
          const lines = text.split("\n");
          for (const line of lines) {
            const parts = line.split(",");
            if (parts.length >= 1) {
              const sub = parts[0].trim().toLowerCase();
              const ip = parts[1]?.trim();
              if (
                sub &&
                (sub === domain || sub.endsWith(`.${domain}`)) &&
                !sub.includes(" ")
              ) {
                const existing = resultsMap.get(sub);
                if (existing) {
                  if (ip && !existing.ip) existing.ip = ip;
                } else {
                  resultsMap.set(sub, {
                    subdomain: sub,
                    source: "HackerTarget (DNS)",
                    ip: ip || undefined,
                    status: ip ? "alive" : "unknown",
                  });
                }
              }
            }
          }
        }
      }
    } catch {
      // HackerTarget error ignored
    }
  };

  // Execute in parallel
  await Promise.allSettled([fetchCrtSh(), fetchHackerTarget()]);

  // Ensure root domain is present if not already
  if (!resultsMap.has(domain)) {
    resultsMap.set(domain, {
      subdomain: domain,
      source: "Apex Host",
      status: "alive",
    });
  }

  const subdomains = Array.from(resultsMap.values()).sort((a, b) =>
    a.subdomain.localeCompare(b.subdomain)
  );

  return NextResponse.json({
    domain,
    count: subdomains.length,
    subdomains,
    tookMs: Date.now() - startTime,
  });
}
