// Hammerex Trade Off — edit flow
// Server shell that validates the magic-link token, loads the listing,
// and hands it to the shared TradeOffForm in "edit" mode.
//
// If the token is missing or invalid, we render a friendly error with a
// WhatsApp escape hatch — not a 404, so tradies who fat-finger the URL
// still get a useful page.

import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DeliveryFooter } from "@/components/DeliveryFooter";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminWhatsapp } from "@/lib/whatsapp";
import { TradeOffForm, type TradeOffFormInitial } from "../../signup/TradeOffForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit your Trade Off profile | Hammerex",
  robots: { index: false, follow: false }
};

type SearchParams = Promise<{ token?: string | string[] }>;
type Params = Promise<{ slug: string }>;

export default async function TradeOffEditPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const rawToken = Array.isArray(sp.token) ? sp.token[0] : sp.token;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!slug || !token) return <InvalidLink reason="missing-token" />;

  const row = await supabaseAdmin
    .from("hammerex_trade_off_listings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!row.data) return <InvalidLink reason="not-found" />;
  if (row.data.edit_token !== token) return <InvalidLink reason="bad-token" />;

  const initial: TradeOffFormInitial = {
    display_name: row.data.display_name ?? "",
    trading_name: row.data.trading_name ?? "",
    primary_trade: row.data.primary_trade ?? "",
    secondary_trades: Array.isArray(row.data.secondary_trades) ? row.data.secondary_trades : [],
    city: row.data.city ?? "",
    country: row.data.country ?? "United Kingdom",
    postcode_prefix: row.data.postcode_prefix ?? "",
    service_postcodes: Array.isArray(row.data.service_postcodes)
      ? row.data.service_postcodes.join(", ")
      : "",
    whatsapp: row.data.whatsapp ?? "",
    phone: row.data.phone ?? "",
    email: row.data.email ?? "",
    website: row.data.website ?? "",
    instagram: row.data.instagram ?? "",
    bio: row.data.bio === "(draft)" ? "" : row.data.bio ?? "",
    years_in_trade:
      row.data.years_in_trade === null || row.data.years_in_trade === undefined
        ? ""
        : String(row.data.years_in_trade),
    start_year:
      row.data.start_year === null || row.data.start_year === undefined
        ? ""
        : String(row.data.start_year),
    avatar_url: row.data.avatar_url ?? "",
    photos: Array.isArray(row.data.photos) ? row.data.photos : []
  };

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Header />
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Trade Off · Edit profile
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
          {row.data.display_name}
        </h1>
        <p className="mt-3 text-xs text-brand-muted">
          Status:{" "}
          <span
            className={
              row.data.status === "live"
                ? "font-semibold text-brand-success"
                : "font-semibold text-brand-text"
            }
          >
            {row.data.status.toUpperCase()}
          </span>
          {row.data.status === "hidden" && (
            <span className="ml-2 text-brand-muted">
              (hidden — message Hammerex on WhatsApp to appeal)
            </span>
          )}
        </p>
      </section>
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <TradeOffForm
          mode={{ kind: "edit", slug, editToken: token }}
          initial={initial}
        />
      </section>
      <DeliveryFooter />
    </main>
  );
}

function InvalidLink({ reason }: { reason: string }) {
  const wa = adminWhatsapp().replace(/\D/g, "");
  const msg = encodeURIComponent(
    "Hi Hammerex — I'm trying to edit my Trade Off profile but my link isn't working. Can you help?"
  );
  return (
    <main className="min-h-screen bg-brand-bg text-brand-text">
      <Header />
      <section className="mx-auto max-w-xl px-4 pb-16 pt-16 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
          Trade Off
        </p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">
          This link is invalid or has expired.
        </h1>
        <p className="mt-4 text-xs text-brand-muted">
          The edit URL you used doesn't match a live profile. Double-check the
          link in your bookmarks — the token after <code>?token=</code> must be
          exact.
        </p>
        <p className="mt-2 text-[11px] text-brand-muted">Reference: {reason}</p>
        <a
          href={`https://wa.me/${wa}?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-brand-whatsapp px-6 text-xs font-bold text-white transition hover:opacity-90"
        >
          Message Hammerex on WhatsApp
        </a>
      </section>
      <DeliveryFooter />
    </main>
  );
}
