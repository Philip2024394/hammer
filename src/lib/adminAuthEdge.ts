// Edge-runtime variant of the admin cookie verifier. The /admin/* gate
// runs in middleware which executes on the edge runtime — node's `crypto`
// isn't available there, so we re-implement the HMAC-SHA256 check with
// Web Crypto (subtle.verify). Logic must stay in sync with adminAuth.ts.

const MAX_AGE_SEC = 60 * 60 * 12;
const encoder = new TextEncoder();

function hexToBytes(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) return new ArrayBuffer(0);
  const buf = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buf);
  for (let i = 0; i < view.length; i++) {
    const byte = parseInt(hex.substr(i * 2, 2), 16);
    if (Number.isNaN(byte)) return new ArrayBuffer(0);
    view[i] = byte;
  }
  return buf;
}

export async function verifyAdminCookieEdge(
  value: string | undefined | null,
  secret: string | undefined,
  now = Date.now()
): Promise<boolean> {
  if (!value || !secret || secret.length < 32) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [issuedAtStr, macHex] = parts;
  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;
  const ageSec = Math.floor(now / 1000) - issuedAt;
  if (ageSec < 0 || ageSec > MAX_AGE_SEC) return false;
  const macBytes = hexToBytes(macHex);
  if (macBytes.byteLength === 0) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      macBytes,
      encoder.encode(`${issuedAt}.admin`)
    );
  } catch {
    return false;
  }
}
