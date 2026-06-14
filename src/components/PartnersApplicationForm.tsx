"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminWhatsapp, quoteUrl } from "@/lib/whatsapp";

type PartnerType = "retail" | "wholesale" | "both";

export function PartnersApplicationForm() {
  const router = useRouter();

  const [type, setType] = useState<PartnerType>("retail");

  // Business basics
  const [contactName, setContactName] = useState("");
  const [position, setPosition] = useState("");
  const [companyLegal, setCompanyLegal] = useState("");
  const [shopName, setShopName] = useState("");
  const [yearsTrading, setYearsTrading] = useState("");
  const [taxId, setTaxId] = useState("");

  // Location & contact
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [territoryRegion, setTerritoryRegion] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  // Online presence
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [otherSocial, setOtherSocial] = useState("");

  // Retail
  const [retailLocations, setRetailLocations] = useState("");
  const [retailMonthlyKg, setRetailMonthlyKg] = useState("");
  const [retailProducts, setRetailProducts] = useState("");
  const [retailBrands, setRetailBrands] = useState("");

  // Wholesale
  const [wholesaleSole, setWholesaleSole] = useState<"yes" | "no" | "">("");
  const [wholesaleMonthlyKg, setWholesaleMonthlyKg] = useState("");
  const [wholesaleChannels, setWholesaleChannels] = useState("");
  const [wholesaleReferences, setWholesaleReferences] = useState("");
  const [wholesalePromoNeeds, setWholesalePromoNeeds] = useState<"yes" | "no" | "">("");

  const [notes, setNotes] = useState("");

  const valid =
    contactName.trim() &&
    companyLegal.trim() &&
    city.trim() &&
    country.trim() &&
    whatsapp.trim() &&
    email.trim();

  const messageHref = useMemo(() => {
    if (!valid) return "#";
    const lines: string[] = [];
    lines.push("Hi Hammerex — distribution partner application.");
    lines.push("");
    lines.push(`Type: ${type.toUpperCase()}`);
    lines.push("");
    lines.push("BUSINESS");
    lines.push(`Contact: ${contactName}${position ? ` (${position})` : ""}`);
    lines.push(`Company: ${companyLegal}`);
    if (shopName.trim()) lines.push(`Shop / Trading name: ${shopName}`);
    if (yearsTrading.trim()) lines.push(`Years trading: ${yearsTrading}`);
    if (taxId.trim()) lines.push(`Tax / VAT / registration ID: ${taxId}`);
    lines.push("");

    lines.push("LOCATION & CONTACT");
    lines.push(`City / Country: ${city}, ${country}`);
    if (territoryRegion.trim()) lines.push(`Territory / region: ${territoryRegion}`);
    lines.push(`WhatsApp: ${whatsapp}`);
    lines.push(`Email: ${email}`);
    lines.push("");

    lines.push("ONLINE PRESENCE");
    if (website.trim())     lines.push(`Website: ${website}`);
    if (instagram.trim())   lines.push(`Instagram: ${instagram}`);
    if (facebook.trim())    lines.push(`Facebook: ${facebook}`);
    if (tiktok.trim())      lines.push(`TikTok: ${tiktok}`);
    if (otherSocial.trim()) lines.push(`Other social: ${otherSocial}`);
    lines.push("");

    if (type === "retail" || type === "both") {
      lines.push("RETAIL DETAILS");
      if (retailLocations.trim())  lines.push(`Number of physical shop locations: ${retailLocations}`);
      if (retailMonthlyKg.trim())  lines.push(`Estimated monthly purchase volume: ${retailMonthlyKg}`);
      if (retailProducts.trim())   lines.push(`Products of interest: ${retailProducts}`);
      if (retailBrands.trim())     lines.push(`Existing brands stocked: ${retailBrands}`);
      lines.push("");
    }

    if (type === "wholesale" || type === "both") {
      lines.push("WHOLESALE DETAILS");
      if (wholesaleSole)             lines.push(`Sole-territory appointment requested: ${wholesaleSole}`);
      if (wholesaleMonthlyKg.trim()) lines.push(`Estimated monthly volume commitment: ${wholesaleMonthlyKg}`);
      if (wholesaleChannels.trim())  lines.push(`Existing distribution channels: ${wholesaleChannels}`);
      if (wholesaleReferences.trim())lines.push(`Trade references: ${wholesaleReferences}`);
      if (wholesalePromoNeeds)       lines.push(`Requesting promotional stands / displays: ${wholesalePromoNeeds}`);
      lines.push("");
    }

    if (notes.trim()) {
      lines.push("ADDITIONAL NOTES");
      lines.push(notes);
      lines.push("");
    }

    lines.push("Please review and come back with pricing, territory and proposed terms.");

    return quoteUrl(lines.join("\n"), adminWhatsapp());
  }, [
    valid, type, contactName, position, companyLegal, shopName, yearsTrading, taxId,
    city, country, territoryRegion, whatsapp, email,
    website, instagram, facebook, tiktok, otherSocial,
    retailLocations, retailMonthlyKg, retailProducts, retailBrands,
    wholesaleSole, wholesaleMonthlyKg, wholesaleChannels, wholesaleReferences, wholesalePromoNeeds,
    notes
  ]);

  const showRetail = type === "retail" || type === "both";
  const showWholesale = type === "wholesale" || type === "both";

  return (
    <section id="apply" className="mx-auto max-w-6xl px-4 pb-10">
      <div className="rounded-2xl border border-brand-line bg-brand-surface p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-brand-text">Partner application</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Submit your details below and our team will respond within two working days. All fields
          marked <span className="text-brand-accent">*</span> are required.
        </p>

        <fieldset className="mt-6">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-muted">
            Application type <span className="text-brand-accent">*</span>
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(["retail", "wholesale", "both"] as PartnerType[]).map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={type === opt}
                onClick={() => setType(opt)}
                className={`h-11 rounded-full border text-xs font-semibold capitalize transition ${
                  type === opt
                    ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                    : "border-brand-line bg-black/30 text-brand-muted hover:border-brand-accent"
                }`}
              >{opt === "both" ? "Retail + Wholesale" : opt}</button>
            ))}
          </div>
        </fieldset>

        <FormSection title="Business" subtitle="Who we'll be working with">
          <Field label="Contact name" required value={contactName} onChange={setContactName} placeholder="Full name" />
          <Field label="Position / role" value={position} onChange={setPosition} placeholder="Owner, buyer, branch manager…" />
          <Field label="Company / legal name" required value={companyLegal} onChange={setCompanyLegal} placeholder="Registered business name" />
          <Field label="Shop / trading name" value={shopName} onChange={setShopName} placeholder="If different to the legal name" />
          <Field label="Years trading" value={yearsTrading} onChange={setYearsTrading} placeholder="e.g. 7" inputMode="numeric" />
          <Field label="Tax / VAT / registration ID" value={taxId} onChange={setTaxId} placeholder="If available" />
        </FormSection>

        <FormSection title="Location & contact" subtitle="Where you operate and how to reach you">
          <Field label="City" required value={city} onChange={setCity} placeholder="City" />
          <Field label="Country" required value={country} onChange={setCountry} placeholder="Country" />
          <Field label="Territory / region you cover" value={territoryRegion} onChange={setTerritoryRegion} placeholder="State, region or trading radius" />
          <Field label="WhatsApp number" required value={whatsapp} onChange={setWhatsapp} placeholder="+44 7700 900000" inputMode="tel" />
          <Field label="Email" required value={email} onChange={setEmail} placeholder="you@company.com" inputMode="email" />
        </FormSection>

        <FormSection title="Online presence" subtitle="Helps us verify your trading activity">
          <Field label="Website" value={website} onChange={setWebsite} placeholder="https://example.com" />
          <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="@handle or URL" />
          <Field label="Facebook" value={facebook} onChange={setFacebook} placeholder="Page name or URL" />
          <Field label="TikTok" value={tiktok} onChange={setTiktok} placeholder="@handle or URL" />
          <Field label="Other social / marketplace" value={otherSocial} onChange={setOtherSocial} placeholder="LinkedIn, YouTube, Amazon storefront…" />
        </FormSection>

        {showRetail && (
          <FormSection title="Retail details" subtitle="Helps us size your account fairly">
            <Field label="Number of physical shop locations" value={retailLocations} onChange={setRetailLocations} placeholder="e.g. 1, 3, 12" inputMode="numeric" />
            <Field label="Estimated monthly purchase volume" value={retailMonthlyKg} onChange={setRetailMonthlyKg} placeholder="e.g. 30 kg mixed, 80 kg, 200 kg" />
            <Field label="Products of interest" value={retailProducts} onChange={setRetailProducts} placeholder="Scaffolders belts, lifting bags, lanyards…" multiline />
            <Field label="Existing brands you stock" value={retailBrands} onChange={setRetailBrands} placeholder="Brands you currently carry" multiline />
          </FormSection>
        )}

        {showWholesale && (
          <FormSection title="Wholesale details" subtitle="Wholesale partners stock the full Hammerex line">
            <ChoiceField
              label="Are you applying for a sole-territory appointment?"
              value={wholesaleSole}
              onChange={(v) => setWholesaleSole(v as "yes" | "no" | "")}
              options={["yes", "no"]}
            />
            <Field label="Estimated monthly volume commitment" value={wholesaleMonthlyKg} onChange={setWholesaleMonthlyKg} placeholder="kg / units per month" />
            <Field label="Existing distribution channels" value={wholesaleChannels} onChange={setWholesaleChannels} placeholder="Trade counters, sub-dealers, B2B web, etc." multiline />
            <Field label="Trade references (optional)" value={wholesaleReferences} onChange={setWholesaleReferences} placeholder="Brands or suppliers we can contact" multiline />
            <ChoiceField
              label="Promotional stands and displays needed on first qualifying order?"
              value={wholesalePromoNeeds}
              onChange={(v) => setWholesalePromoNeeds(v as "yes" | "no" | "")}
              options={["yes", "no"]}
            />
          </FormSection>
        )}

        <FormSection title="Anything else" subtitle="Add any context that helps us evaluate fairly">
          <Field label="Additional notes" value={notes} onChange={setNotes} placeholder="Volume commitments, exclusivity, expansion plans, etc." multiline />
        </FormSection>

        <div className="mt-6 border-t border-brand-line pt-5">
          <a
            href={messageHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!valid}
            onClick={(e) => {
              if (!valid) { e.preventDefault(); return; }
              setTimeout(() => router.push("/thank-you"), 80);
            }}
            className={`grid h-12 place-items-center rounded-full text-xs font-bold uppercase tracking-wider ${
              valid
                ? "bg-brand-accent text-black hover:opacity-90"
                : "border border-brand-line bg-brand-surface text-brand-muted"
            }`}
          >
            Submit application via WhatsApp
          </a>
          <p className="mt-2 text-center text-xs text-brand-muted">
            Opens WhatsApp prefilled with your application. We respond within two working days.
          </p>
        </div>
      </div>
    </section>
  );
}

function FormSection({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-accent">{title}</h3>
        {subtitle && <span className="text-xs text-brand-muted">{subtitle}</span>}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, multiline, inputMode, required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
  required?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1 ${multiline ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label} {required && <span className="text-brand-accent">*</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="rounded-xl border border-brand-line bg-black px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-full border border-brand-line bg-black px-4 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-accent focus:outline-none"
        />
      )}
    </label>
  );
}

function ChoiceField({
  label, value, onChange, options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-1 sm:col-span-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{label}</span>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`h-10 flex-1 rounded-full border text-xs font-semibold capitalize transition ${
              value === opt
                ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
                : "border-brand-line bg-black/30 text-brand-muted hover:border-brand-accent"
            }`}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}
