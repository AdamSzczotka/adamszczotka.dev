import { headers } from "next/headers";
import { safeJsonLd } from "@/lib/utils/structured-data";

// Structured data is an inline script, so it needs the request nonce to run
// under a CSP without 'unsafe-inline'. Reading the nonce here keeps every page
// from having to thread it through by hand.
export async function JsonLd({ data }: { data: object }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
