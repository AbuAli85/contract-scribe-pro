// =============================================================
// Edge Function: send-template-email
// Triggered from the EmailGateModal after a successful insert
// into template_leads. Sends a bilingual delivery email with
// the template download link via Resend.
//
// Deploy:
//   supabase functions deploy send-template-email --no-verify-jwt
//
// Required secrets (Supabase Vault):
//   RESEND_API_KEY      Your Resend API key
//   SEND_FROM_ADDRESS   e.g. "Contract Scribe Pro <noreply@contractscribepro.com>"
//   APP_URL             Public app URL, e.g. https://contractscribepro.com
// =============================================================

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface RequestBody {
  email: string;
  templateId: string;
  lang: "en" | "ar";
}

const TEMPLATE_NAMES: Record<string, { en: string; ar: string }> = {
  employment: { en: "Employment Contract", ar: "عقد عمل" },
  nda: { en: "NDA / Confidentiality Agreement", ar: "اتفاقية سرية" },
  "service-agreement": { en: "Service Agreement", ar: "عقد خدمات" },
  freelance: { en: "Freelance Contract", ar: "عقد عمل حر" },
  tenancy: { en: "Tenancy Agreement", ar: "عقد إيجار" },
  partnership: { en: "Partnership Agreement", ar: "عقد شراكة" },
  "sales-purchase": { en: "Sales & Purchase Agreement", ar: "عقد بيع وشراء" },
  "hr-bundle": { en: "HR Policy Bundle", ar: "حزمة سياسات الموارد البشرية" },
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function buildEmail(lang: "en" | "ar", templateId: string, appUrl: string) {
  const name = TEMPLATE_NAMES[templateId] ?? { en: templateId, ar: templateId };
  const downloadUrl = `${appUrl}/templates/download/${templateId}`;
  const appLink = `${appUrl}/create-contract`;

  if (lang === "ar") {
    return {
      subject: `إليك نموذج ${name.ar} المجاني 📄`,
      html: `<!DOCTYPE html><html dir="rtl" lang="ar"><body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
<h1 style="font-size:22px;margin:0 0 16px;">نموذجك المجاني جاهز</h1>
<p style="line-height:1.6;">شكراً لتنزيل نموذج <strong>${name.ar}</strong> من Contract Scribe Pro.</p>
<p style="margin:24px 0;"><a href="${downloadUrl}" style="background:#e11d48;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold;">تنزيل النموذج (Word ‏.docx)</a></p>
<p style="line-height:1.6;color:#555;">هل تريد تخصيص هذا النموذج باسم شركتك وتفاصيلها؟ أنشئ حساباً مجانياً وأنشئ 3 عقود مجاناً بدون الحاجة لبطاقة ائتمان.</p>
<p style="margin:24px 0;"><a href="${appLink}" style="color:#e11d48;font-weight:bold;text-decoration:none;">→ ابدأ مجاناً على المنصة</a></p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;"/>
<p style="font-size:12px;color:#888;">Contract Scribe Pro — منشئ العقود ثنائي اللغة</p>
</body></html>`,
    };
  }

  return {
    subject: `Your free ${name.en} template 📄`,
    html: `<!DOCTYPE html><html lang="en"><body style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
<h1 style="font-size:22px;margin:0 0 16px;">Your free template is ready</h1>
<p style="line-height:1.6;">Thanks for downloading the <strong>${name.en}</strong> template from Contract Scribe Pro.</p>
<p style="margin:24px 0;"><a href="${downloadUrl}" style="background:#e11d48;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold;">Download template (Word .docx)</a></p>
<p style="line-height:1.6;color:#555;">Want to customize this template with your company name and details? Create a free account and generate 3 contracts free — no credit card required.</p>
<p style="margin:24px 0;"><a href="${appLink}" style="color:#e11d48;font-weight:bold;text-decoration:none;">→ Start free on the platform</a></p>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0;"/>
<p style="font-size:12px;color:#888;">Contract Scribe Pro — Bilingual contract generator</p>
</body></html>`,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { email, templateId, lang } = (await req.json()) as RequestBody;

    if (!email || !templateId) {
      return new Response(
        JSON.stringify({ error: "email and templateId required" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SEND_FROM = Deno.env.get("SEND_FROM_ADDRESS") ??
      "Contract Scribe Pro <noreply@contractscribepro.com>";
    const APP_URL = Deno.env.get("APP_URL") ?? "https://contractscribepro.com";

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — skipping email send");
      return new Response(
        JSON.stringify({ ok: true, sent: false, reason: "no-api-key" }),
        { headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = buildEmail(lang ?? "en", templateId, APP_URL);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SEND_FROM,
        to: [email],
        subject,
        html,
        // Tag for drip-sequence segmentation in Resend audiences
        tags: [
          { name: "category", value: "template-download" },
          { name: "template", value: templateId },
          { name: "lang", value: lang ?? "en" },
        ],
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return new Response(
        JSON.stringify({ ok: false, error: errText }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const data = await resendRes.json();
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-template-email error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message ?? String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
