"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSortedToolsByUsage, recordToolVisit, ToolWithUsage } from "@/lib/usage";

export function useTopTools(limit = 6) {
  const [topTools, setTopTools] = useState<ToolWithUsage[]>(() => getSortedToolsByUsage(limit));
  const pathname = usePathname();

  // Track visit when navigating to a tool page
  useEffect(() => {
    if (pathname && pathname.startsWith("/tools/")) {
      const toolId = pathname.replace("/tools/", "").split("/")[0];
      if (toolId) {
        recordToolVisit(toolId);
      }
    }
  }, [pathname]);

  // Sync state on updates
  useEffect(() => {
    const handleUpdate = () => {
      setTopTools(getSortedToolsByUsage(limit));
    };

    window.addEventListener("tool-usage-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // Initial sync once mounted in browser
    handleUpdate();

    return () => {
      window.removeEventListener("tool-usage-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [limit]);

  return topTools;
}
