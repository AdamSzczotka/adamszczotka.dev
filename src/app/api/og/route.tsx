import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "Adam Szczotka";
  const category = searchParams.get("category");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "60px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {category && (
            <span
              style={{
                color: "#737373",
                fontSize: "24px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {category}
            </span>
          )}
          <h1
            style={{
              color: "#fafafa",
              fontSize: title.length > 60 ? "48px" : "64px",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#525252",
              fontSize: "24px",
              fontFamily: "monospace",
            }}
          >
            adamszczotka.dev
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
