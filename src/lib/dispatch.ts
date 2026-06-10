// Dispatch + ETA helpers. Approximations — refined once real carrier APIs land.

export type ShippingZone = {
  country_code: string;
  country_name: string;
  carrier: string;
  base_fee_idr: number;
  per_kg_idr: number;
  eta_min_days: number;
  eta_max_days: number;
  is_default: boolean;
};

function nowInJakarta(): Date {
  // Best-effort: re-parse via Asia/Jakarta locale string.
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
}

export function nextDispatch(cutoffLocal: string): { date: Date; sameDay: boolean; msUntilCutoff: number } {
  const now = nowInJakarta();
  const [hh, mm] = cutoffLocal.split(":").map(Number);
  const cutoffToday = new Date(now);
  cutoffToday.setHours(hh, mm, 0, 0);

  if (now < cutoffToday) {
    return { date: cutoffToday, sameDay: true, msUntilCutoff: cutoffToday.getTime() - now.getTime() };
  }
  const tomorrow = new Date(cutoffToday);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: tomorrow, sameDay: false, msUntilCutoff: 0 };
}

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d;
}

export function deliveryWindow(dispatchDate: Date, zone: ShippingZone): { from: Date; to: Date } {
  return {
    from: addBusinessDays(dispatchDate, zone.eta_min_days),
    to: addBusinessDays(dispatchDate, zone.eta_max_days)
  };
}

export function shippingFeeIdr(zone: ShippingZone, weightKg: number): number {
  return zone.base_fee_idr + Math.ceil(weightKg) * zone.per_kg_idr;
}

export function formatRange(from: Date, to: Date): string {
  const m = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (from.getMonth() === to.getMonth()) {
    return `${from.toLocaleDateString("en-US", { month: "short" })} ${from.getDate()}–${to.getDate()}`;
  }
  return `${m(from)} – ${m(to)}`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
