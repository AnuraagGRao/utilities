export type ToolCategory = 
  | "Developer" 
  | "Design & UX" 
  | "Web & Recon" 
  | "Shopping & Deals" 
  | "Text & Data"
  | "Security & Crypto";

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  path: string;
  category: ToolCategory;
  iconName: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  badge?: string;
}

export interface DealItem {
  id: string;
  title: string;
  source: "cheapshark" | "reddit-buildapcsales" | "reddit-deals";
  sourceName: string;
  dealUrl: string;
  normalPrice?: number;
  salePrice?: number;
  savingsPercent?: number;
  thumbUrl?: string;
  category?: string;
  storeName?: string;
  publishedAt: string;
}

export interface SubdomainRecord {
  subdomain: string;
  source: string;
  ip?: string;
  status?: "pending" | "alive" | "unreachable" | "unknown";
}
