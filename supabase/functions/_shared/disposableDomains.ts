// =============================================================
// Disposable / throwaway email domains
//
// Used by letter-otp-send to refuse burner addresses BEFORE any
// code is generated or mail is sent — a burner defeats the whole
// point of the free-tier gate, since the visitor can mint a new
// one per letter.
//
// To extend: add the bare domain, lowercase, no leading "@".
// Subdomains are matched automatically (mail.yopmail.com hits
// yopmail.com), so list only the registrable domain.
// =============================================================

export const DISPOSABLE_DOMAINS: ReadonlySet<string> = new Set([
  // classics
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "spam4.me",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.net",
  "tempmailo.com",
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "trashmail.de",
  "trashmail.net",
  "getnada.com",
  "nada.email",
  "maildrop.cc",
  "fakeinbox.com",
  "dispostable.com",
  "mintemail.com",
  "mohmal.com",
  "throwawaymail.com",
  "emailondeck.com",
  // widely used burners
  "mailnesia.com",
  "mailcatch.com",
  "mytemp.email",
  "tempinbox.com",
  "throwawaymailbox.com",
  "discard.email",
  "spamgourmet.com",
  "jetable.org",
  "mailexpire.com",
  "meltmail.com",
  "spambog.com",
  "incognitomail.com",
  "anonbox.net",
  "burnermail.io",
  "harakirimail.com",
  "moakt.com",
  "tmail.ws",
  "tmpmail.org",
  "luxusmail.org",
  "inboxkitten.com",
  "mailpoof.com",
  "email-temp.com",
  "linshiyouxiang.net",
  "1secmail.com",
  "1secmail.net",
  "1secmail.org",
  "byom.de",
  "einrot.com",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "vomoto.com",
  "spambox.us",
  "mailde.de",
  "wegwerfmail.de",
  "trbvm.com",
  "tempr.email",
  "mail-temporaire.fr",
  "clrmail.com",
  "deadaddress.com",
  "mailmetrash.com",
  "trashymail.com",
  "tempemail.net",
  "tempemails.io",
]);

/**
 * Only reject on the *registrable* domain, so a burner cannot slip past
 * by handing us a subdomain (`inbox.yopmail.com`). We walk the label
 * suffixes rather than string-matching, so `notyopmail.com` stays allowed.
 */
export function isDisposableDomain(domain: string): boolean {
  const d = domain.toLowerCase().trim().replace(/\.$/, "");
  if (!d) return false;
  if (DISPOSABLE_DOMAINS.has(d)) return true;

  const labels = d.split(".");
  for (let i = 1; i < labels.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(labels.slice(i).join("."))) return true;
  }
  return false;
}
