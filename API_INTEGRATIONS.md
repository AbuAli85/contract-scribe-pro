# API Integrations — DeepL + Dropbox Sign + Twilio WhatsApp

Three external APIs that transform Contract Scribe Pro from "document generator" into a true end-to-end contract platform.

## What this unlocks

| Capability | Before | After |
| --- | --- | --- |
| **Bilingual quality** | User types name in EN, both EN and AR columns show Latin script. Unprofessional in Oman. | DeepL auto-fills the Arabic half — clean Arabic script in the Arabic column. |
| **E-signature** | Download .docx → print → sign → scan → email. Multi-day loop. | Send for signature in browser → counterparty signs via emailed link → done. |
| **Distribution** | Email-only delivery. ~30% of MENA recipients miss it. | "Send via WhatsApp" — delivered to the channel businesses actually use. |

## Files added

| File | Purpose |
| --- | --- |
| `supabase/functions/translate-text/index.ts` | DeepL Pro proxy. AR ↔ EN with formal register, sourced for legal use. |
| `supabase/functions/create-signature-request/index.ts` | Dropbox Sign request creation (defaults to test mode for free dev). |
| `supabase/functions/send-whatsapp/index.ts` | Twilio WhatsApp Business message dispatch. |
| `src/lib/translate.ts` | Client-side helper for the translate Edge Function. |
| `src/lib/signAndShare.ts` | Client-side helpers for signature + WhatsApp. |
| `src/pages/FillTemplate.tsx` | New `SuccessActions` component with Send-for-signature + Share-via-WhatsApp panels. Auto-translate buttons on every bilingual input pair. |

## Required Supabase secrets

```bash
# DeepL Pro — https://www.deepl.com/pro-api
supabase secrets set DEEPL_API_KEY=...

# Dropbox Sign — https://app.hellosign.com/home/myAccount#api
supabase secrets set DROPBOX_SIGN_API_KEY=...

# Twilio WhatsApp Business — https://console.twilio.com
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"  # sandbox; replace with verified number in production
```

## Deploy

```bash
supabase functions deploy translate-text         --no-verify-jwt
supabase functions deploy create-signature-request --no-verify-jwt
supabase functions deploy send-whatsapp          --no-verify-jwt
```

Frontend deploys automatically on `git push` via Vercel.

## How users experience it

### 1. Auto-translate on bilingual inputs

Fill the English half of "Employee Full Name" with "Mohammed Ahmed Al-Balushi". The Arabic half shows a small "Auto from English" button with a wand icon. One click → DeepL fills "محمد أحمد البلوشي". Works in both directions (AR → EN too).

### 2. Send for e-signature

After generating the contract, the success card has a secondary row of actions:

- **Send for signature** — opens a small inline form: signer name + email. On submit, the generated .docx is uploaded to Dropbox Sign, a signature request is created, and the signer receives an email with a tracked "Click to sign" button. The success card shows a "Status page" link.

### 3. Share signing link via WhatsApp

Once a signature request exists, the "Share via WhatsApp" button activates. Open it → enter the recipient's phone in E.164 format (e.g. `+96891234567`) → Twilio sends a WhatsApp message containing a bilingual hello + the signing link.

## Cost model (during attraction phase)

| Service | Free tier | Paid |
| --- | --- | --- |
| DeepL Pro | 500K chars / month | ~$5/M chars after |
| Dropbox Sign | 3 requests / month / account, unlimited in test mode | $15/month for unlimited |
| Twilio WhatsApp | $0.005-0.01 per message (sandbox free for dev) | Same |

Total: < $50/month covers comfortably through the audience-building phase.

## Production checklist

Before flipping to real (non-test) mode:

- [ ] Dropbox Sign: upgrade to paid plan, set `testMode: false` in `SuccessActions.handleSignSubmit`
- [ ] Twilio WhatsApp: verify your business number with Meta, replace sandbox `whatsapp:+14155238886` with your verified number
- [ ] DeepL: confirm you're on the Pro plan (free key with `:fx` suffix has lower rate limits)
- [ ] Add a CAPTCHA or rate limit on the three Edge Functions — they're currently no-verify-jwt so abuse is possible
- [ ] Add a privacy notice: "Contract content is processed by DeepL / Dropbox Sign / Twilio"
