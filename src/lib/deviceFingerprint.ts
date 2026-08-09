// =============================================================
// Device fingerprint for the /letters free-tier gate
//
// Deliberately NOT a tracking fingerprint: no canvas/WebGL/font
// probing and no third-party library. It's a stable-enough handle
// to stop the same browser claiming the 2 free letters repeatedly
// just by swapping email addresses.
//
// The persisted UUID does most of the work; the ambient signals
// only keep the hash from being trivially forgeable by clearing
// one localStorage key. Clearing site data DOES reset it — that's
// accepted, because the email and IP dimensions still apply.
// =============================================================

const DEVICE_ID_KEY = "letter_device_id";

/** Random UUID persisted per browser profile. */
function persistentDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    const generated =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  } catch {
    // Private mode with storage blocked — fall back to a per-session
    // value. The gate still holds via email + IP.
    return "no-storage";
  }
}

function ambientSignals(): string {
  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  const scr = typeof screen !== "undefined" ? screen : ({} as Screen);
  let timezone = "";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    timezone = "";
  }

  return [
    nav.userAgent ?? "",
    nav.language ?? "",
    timezone,
    `${scr.width ?? 0}x${scr.height ?? 0}`,
    String(scr.colorDepth ?? 0),
  ].join("|");
}

/** SHA-256 hex — must match the 64-char lowercase hex the function expects. */
export async function getDeviceHash(): Promise<string> {
  const raw = `${persistentDeviceId()}|${ambientSignals()}`;
  const bytes = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
