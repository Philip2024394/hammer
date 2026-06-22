// Country-centroid fallback for the live-presence map at /admin/world.
// Used when a session's lat/lon is missing (Cloudflare-free, localhost,
// or any host that doesn't ship coordinates) so visitors still appear
// somewhere meaningful on the globe instead of being dropped.
//
// Coordinates are approximate centroids in decimal degrees, ISO 3166-1
// alpha-2 keys. Only the countries Hammerex actually sees traffic from
// are listed; unknown codes get a [0, 0] fallback the map renders as
// "off Africa" — visible enough that you can spot a missing entry.

export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  GB: [54.0, -2.0],
  IE: [53.4, -8.0],
  US: [39.8, -98.6],
  CA: [56.1, -106.3],
  AU: [-25.3, 133.8],
  NZ: [-40.9, 174.9],
  SG: [1.35, 103.82],
  ID: [-2.5, 117.5],
  MY: [4.2, 102.0],
  TH: [15.9, 100.99],
  PH: [12.9, 121.8],
  VN: [14.1, 108.3],
  IN: [20.6, 78.96],
  AE: [23.4, 53.85],
  SA: [23.9, 45.08],
  ZA: [-30.6, 22.94],
  // Europe
  DE: [51.2, 10.5],
  FR: [46.2, 2.2],
  IT: [41.9, 12.6],
  ES: [40.5, -3.7],
  NL: [52.1, 5.3],
  BE: [50.5, 4.5],
  PT: [39.4, -8.2],
  AT: [47.5, 14.6],
  FI: [61.9, 25.7],
  SE: [60.1, 18.6],
  NO: [60.5, 8.5],
  DK: [56.3, 9.5],
  PL: [51.9, 19.1],
  CZ: [49.8, 15.5],
  GR: [39.1, 21.8],
  HU: [47.2, 19.5],
  RO: [45.9, 24.9],
  CH: [46.8, 8.2],
  // South America
  BR: [-14.2, -51.9],
  AR: [-38.4, -63.6],
  CL: [-35.7, -71.5],
  MX: [23.6, -102.5],
  // Other
  TR: [38.9, 35.2],
  JP: [36.2, 138.2],
  KR: [35.9, 127.7],
  CN: [35.9, 104.2],
  HK: [22.3, 114.2],
  TW: [23.7, 121.0]
};

export function centroidFor(country: string | null | undefined): [number, number] | null {
  if (!country) return null;
  return COUNTRY_CENTROIDS[country.toUpperCase()] ?? null;
}
