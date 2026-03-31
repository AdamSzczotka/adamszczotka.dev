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
          borderTop: "4px solid #3b82f6",
        }}
      >
        {/* Top: terminal icon + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Mini terminal favicon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "56px",
              height: "56px",
              border: "1.5px solid #262626",
              backgroundColor: "#0f0f0f",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 6px",
                borderBottom: "1px solid #1a1a1a",
                backgroundColor: "#141414",
              }}
            >
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#3b3b3b" }} />
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#3b3b3b" }} />
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#3b3b3b" }} />
            </div>
            {/* AS text */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <span style={{ color: "#fafafa", fontSize: "22px", fontWeight: 900 }}>AS</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                color: "#e5e5e5",
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Adam Szczotka
            </span>
            <span
              style={{
                color: "#525252",
                fontSize: "18px",
                fontFamily: "monospace",
              }}
            >
              Software Engineer
            </span>
          </div>
        </div>

        {/* Center: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {category && (
            <span
              style={{
                color: "#3b82f6",
                fontSize: "20px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "3px",
              }}
            >
              {category}
            </span>
          )}
          <h1
            style={{
              color: "#ffffff",
              fontSize: title.length > 60 ? "48px" : "64px",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom: URL + decorative line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #262626",
            paddingTop: "24px",
          }}
        >
          <span
            style={{
              color: "#737373",
              fontSize: "22px",
              fontFamily: "monospace",
            }}
          >
            adamszczotka.dev
          </span>
          <span
            style={{
              color: "#404040",
              fontSize: "18px",
              fontFamily: "monospace",
            }}
          >
            ~/dev
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
