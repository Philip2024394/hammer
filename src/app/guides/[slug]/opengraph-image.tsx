import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const alt = "Hammerex Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await supabase
    .from("hammerex_guides")
    .select("hero_image_url, title")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const heroUrl = res.data?.hero_image_url as string | null | undefined;
  const title = (res.data?.title as string | undefined) ?? "Hammerex Guide";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {heroUrl ? (
          <img
            src={heroUrl}
            alt={title}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain"
            }}
          />
        ) : (
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 700,
              padding: 80,
              textAlign: "center",
              letterSpacing: "-0.02em",
              lineHeight: 1.1
            }}
          >
            {title}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}

