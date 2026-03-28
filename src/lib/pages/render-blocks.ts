import type { Locale } from "@/lib/i18n";

export interface BlockData {
  id: number;
  type: "hero" | "project_showcase" | "blog_feed" | "cta" | "text";
  position: number;
  dataEn: Record<string, unknown>;
  dataPl: Record<string, unknown>;
}

export function getBlockData(block: BlockData, locale: Locale): Record<string, unknown> {
  return locale === "pl" ? block.dataPl : block.dataEn;
}
