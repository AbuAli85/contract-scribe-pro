// =============================================================
// Ministry Letters — /letters
//
// Generate formal letters to Oman government authorities in the
// locked standard layout, in Arabic or English. User picks the
// language, authority and letter type, fills the fields, and
// downloads a print-ready .docx (printed on the company's own
// letterhead paper).
//
// Company/applicant fields auto-fill from the user's "employer"
// party when one exists. The free-tier gate (Sprint 1) applies
// identically in both languages.
// =============================================================

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Landmark, FileText, Download, Loader2 } from "lucide-react";
import {
  AUTHORITIES, BASE_FIELDS, TOKEN_VALUE_EN,
  composeRecipientTitle, freeTextClosingAr, getAuthority, getLetterType, typesForAuthority,
} from "@/lib/ministryLetters";
import type { FieldDef, LetterLanguage, LetterValues } from "@/lib/ministryLetters";
import { downloadMinistryLetter } from "@/utils/docx/generateMinistryLetter";
import LetterGateDialog from "@/components/LetterGateDialog";
import { checkLetterGeneration, readStoredGate } from "@/lib/letterGate";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import MyFormatsSection from "@/components/letterFormats/MyFormatsSection";
import { generateFromFormat, type LetterFormat } from "@/lib/letterFormats";

const LANG_KEY = "letter_language";

/** Page chrome in both languages. Field copy comes from the field defs. */
const UI = {
  ar: {
    title: "الخطابات الحكومية",
    subtitle: "خطابات رسمية للجهات الحكومية في سلطنة عُمان — تنسيق موحد جاهز للطباعة على الورق الرسمي",
    pickerTitle: "نوع الخطاب والجهة",
    authority: "الجهة الحكومية",
    letterType: "نوع الخطاب",
    recipient: "المخاطَب",
    recipientDetail: "اسم الدائرة / الإدارة",
    recipientDetailPh: "التسجيل التجاري",
    recipientFree: "صفة المخاطَب",
    recipientFreePh: "سعادة المدير العام للشؤون الإدارية",
    recipientPreview: "سيظهر في الخطاب",
    generate: "توليد الخطاب وتنزيله (Word)",
    printNote: "يُطبع الخطاب على الورق الرسمي للشركة — التنسيق قياسي موحد لجميع الجهات الحكومية",
    freeNote: "خطابان مجانيان بعد تأكيد بريدك الإلكتروني",
    missingTitle: "حقول ناقصة",
    doneTitle: "تم إنشاء الخطاب",
    doneDesc: "جاهز للطباعة على الورق الرسمي للشركة",
    remaining: (n: number) => `تم التنزيل — تبقى لك ${n} خطاب مجاني`,
  },
  en: {
    title: "Government Letters",
    subtitle:
      "Formal letters to government authorities in the Sultanate of Oman — one standard layout, ready to print on your letterhead",
    pickerTitle: "Letter type and authority",
    authority: "Government authority",
    letterType: "Letter type",
    recipient: "Addressee",
    recipientDetail: "Department name",
    recipientDetailPh: "Commercial Registry",
    recipientFree: "Addressee title",
    recipientFreePh: "The Director General of Administrative Affairs",
    recipientPreview: "Appears in the letter as",
    generate: "Generate and download (Word)",
    printNote:
      "Print on your company letterhead — the layout is standard across all government authorities",
    freeNote: "Two free letters after verifying your email",
    missingTitle: "Missing fields",
    doneTitle: "Letter generated",
    doneDesc: "Ready to print on your company letterhead",
    remaining: (n: number) => `Downloaded — ${n} free letter${n === 1 ? "" : "s"} remaining`,
  },
} as const;

export default function MinistryLetters() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [lang, setLang] = useState<LetterLanguage>(() => {
    try {
      return localStorage.getItem(LANG_KEY) === "en" ? "en" : "ar";
    } catch {
      return "ar";
    }
  });
  const [authorityId, setAuthorityId] = useState<string>("spf");
  const [letterTypeId, setLetterTypeId] = useState<string>("installment");
  const [recipientIndex, setRecipientIndex] = useState(0);
  const [recipientDetail, setRecipientDetail] = useState("");
  const [values, setValues] = useState<LetterValues>({});
  const [generating, setGenerating] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  // Set while a saved format is waiting on the gate; null means the gate
  // is being used for a ready-made letter.
  const [pendingFormat, setPendingFormat] = useState<
    { format: LetterFormat; values: Record<string, string> } | null
  >(null);

  const isPro = profile?.is_pro === true;
  const isEn = lang === "en";
  const t = UI[lang];
  const dir = isEn ? "ltr" : "rtl";

  const authority = getAuthority(authorityId);
  // Master list v1.0 is per-authority: the type dropdown only ever offers
  // what this authority actually accepts, in the list's own order.
  const availableTypes = useMemo(() => typesForAuthority(authorityId), [authorityId]);
  const letterType = getLetterType(letterTypeId);
  const fields = useMemo<FieldDef[]>(
    () => [...BASE_FIELDS, ...(letterType?.fields ?? [])],
    [letterType],
  );

  const recipients = authority.recipients;
  const recipient = recipients[recipientIndex] ?? recipients[0];
  // The free-text option's own label ("أخرى — نص حر") is a menu word, never
  // a letter title: with the box empty, fall back to this authority's
  // default addressee rather than printing the menu word on a letter.
  const usingFreeFallback = !!recipient?.freeText && !recipientDetail.trim();
  const recipientTitle = usingFreeFallback
    ? isEn
      ? authority.recipientTitleEn
      : authority.recipientTitleAr
    : composeRecipientTitle(recipient, lang, recipientDetail);

  // Arabic third-cell closing (Addressing Protocol v1.0). A named or
  // department addressee carries its own closing; free text resolves by the
  // معالي rule; the empty-free-text fallback borrows the default entry's
  // closing so it matches the default title it printed.
  const recipientClosingAr = usingFreeFallback
    ? recipients[0]?.closing ?? "المحترم"
    : recipient?.freeText
      ? freeTextClosingAr(recipientTitle)
      : recipient?.closing ?? "المحترم";

  // Field copy per language. Always fall back to the other language so a
  // missing string shows the Arabic original rather than an empty label.
  const labelOf = (f: FieldDef) => (isEn ? f.labelEn || f.labelAr : f.labelAr || f.labelEn);
  const groupOf = (f: FieldDef) => (isEn ? f.group || f.groupAr : f.groupAr || f.group);
  const placeholderOf = (f: FieldDef) =>
    isEn ? f.placeholderEn ?? f.placeholderAr : f.placeholderAr ?? f.placeholderEn;
  const helperOf = (f: FieldDef) => (isEn ? f.helperEn ?? f.helperAr : f.helperAr ?? f.helperEn);
  const optionLabel = (o: { labelEn: string; labelAr: string }) =>
    isEn ? o.labelEn || o.labelAr : o.labelAr || o.labelEn;

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage blocked — the toggle still works for this session */
    }
  }, [lang]);

  // Auto-fill company from the user's employer party. Anonymous visitors
  // have no parties, so skip the round trip entirely — this page is public
  // and must never look broken without a session.
  // NOTE: generated Supabase types predate the `parties` table (see
  // Parties.tsx which casts results the same way) — query untyped.
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("parties")
        .select("name_ar, cr_number")
        .eq("role", "employer")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      const row = data as { name_ar: string | null; cr_number: string | null } | null;
      if (row) {
        setValues((v) => ({
          ...v,
          company_name: v.company_name || row.name_ar || "",
          cr_number: v.cr_number || row.cr_number || "",
        }));
      }
    })();
  }, [user?.id]);

  // Apply field defaults when the letter type or language changes. Defaults
  // are authored in Arabic, so seed the English equivalent in English mode —
  // but only when the field is still empty, never over the user's own text.
  useEffect(() => {
    setValues((v) => {
      const next = { ...v };
      for (const f of fields) {
        if (!f.defaultValue || next[f.key]) continue;
        next[f.key] = isEn ? TOKEN_VALUE_EN[f.defaultValue] ?? f.defaultValue : f.defaultValue;
      }
      return next;
    });
  }, [fields, isEn]);

  const set = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const missing = fields.filter((f) => f.required && !(values[f.key] ?? "").trim());

  /** The download itself — the locked layout, unchanged. */
  const runDownload = async (remaining: number | null) => {
    if (!letterType) return;
    setGenerating(true);
    try {
      await downloadMinistryLetter({
        // The chosen addressee is passed as the authority's title — one
        // composed string, exactly where the fixed title always went.
        // The renderer is untouched.
        authority: {
          ...authority,
          recipientTitleAr: lang === "ar" ? recipientTitle : authority.recipientTitleAr,
          recipientTitleEn: lang === "en" ? recipientTitle : authority.recipientTitleEn,
        },
        letterType,
        values,
        language: lang,
        closingAr: recipientClosingAr,
      });
      toast({
        title: t.doneTitle,
        description: remaining === null ? t.doneDesc : t.remaining(remaining),
      });
    } catch (e) {
      toast({ title: "Generation failed", description: String(e), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!letterType) return;
    if (missing.length > 0) {
      toast({
        title: t.missingTitle,
        description: missing.map(labelOf).join(isEn ? ", " : "، "),
        variant: "destructive",
      });
      return;
    }

    // Pro subscribers never see the gate. The ledger row is still written
    // (fire-and-forget) so usage reporting covers paid letters too.
    if (isPro) {
      void checkLetterGeneration({
        token: readStoredGate()?.token ?? "",
        authority: authorityId,
        letterType: letterTypeId,
        language: lang,
      }).catch(() => undefined);
      await runDownload(null);
      return;
    }

    // Free tier: the dialog resolves email → code → limit check. It skips
    // straight to the check when this browser already holds a gate token.
    setPendingFormat(null);
    setGateOpen(true);
  };

  /** Fill a saved BYO format — same gate, same free allowance. */
  const runFormatDownload = async (
    format: LetterFormat,
    formatValues: Record<string, string>,
  ) => {
    setGenerating(true);
    try {
      await generateFromFormat(format, formatValues);
      toast({ title: t.doneTitle, description: t.doneDesc });
    } catch (e) {
      toast({ title: "Generation failed", description: String(e), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleFormatGenerate = async (
    format: LetterFormat,
    formatValues: Record<string, string>,
  ) => {
    if (isPro) {
      void checkLetterGeneration({
        token: readStoredGate()?.token ?? "",
        authority: "user_format",
        letterType: `format:${format.id}`,
        language: format.language,
      }).catch(() => undefined);
      await runFormatDownload(format, formatValues);
      return;
    }
    setPendingFormat({ format, values: formatValues });
    setGateOpen(true);
  };

  // Group fields into sections, in the active language
  const groups = useMemo(() => {
    const map = new Map<string, FieldDef[]>();
    for (const f of fields) {
      const g = isEn ? f.group || f.groupAr : f.groupAr || f.group;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    }
    return [...map.entries()];
  }, [fields, isEn]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8" dir={dir}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Landmark className="h-7 w-7 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        {/* Language toggle — always shows both options in their own script */}
        <div className="inline-flex shrink-0 rounded-md border p-0.5" dir="ltr">
          {(["ar", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              aria-pressed={lang === code}
              className={cn(
                "rounded px-3 py-1.5 text-sm transition-colors",
                lang === code
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {code === "ar" ? "العربية" : "English"}
            </button>
          ))}
        </div>
      </div>

      <MyFormatsSection
        lang={lang}
        userId={user?.id ?? null}
        onRequestGenerate={(format, formatValues) =>
          void handleFormatGenerate(format, formatValues)
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" /> {t.pickerTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t.authority}</Label>
            <Select
              value={authorityId}
              onValueChange={(id) => {
                // Types, fields and addressee are all authority-specific —
                // carrying any of them across would produce a letter with
                // another ministry's questions answered.
                setAuthorityId(id);
                setLetterTypeId(typesForAuthority(id)[0]?.id ?? "custom");
                setValues({});
                setRecipientIndex(0);
                setRecipientDetail("");
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AUTHORITIES.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{isEn ? a.nameEn : a.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t.letterType}</Label>
            <Select value={letterTypeId} onValueChange={setLetterTypeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {availableTypes.map((lt) => (
                  <SelectItem key={lt.id} value={lt.id}>{isEn ? lt.titleEn : lt.titleAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {letterType && (
              <p className="text-xs text-muted-foreground">
                {isEn ? letterType.descEn : letterType.descAr}
              </p>
            )}
          </div>

          {/* Addressee — composed into a single title string; the letter's
              layout is identical whichever option is chosen. */}
          <div className="space-y-2">
            <Label>{t.recipient}</Label>
            <Select
              value={String(recipientIndex)}
              onValueChange={(v) => {
                setRecipientIndex(Number(v));
                setRecipientDetail("");
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {recipients.map((r, i) => (
                  <SelectItem key={`${r.ar}-${i}`} value={String(i)}>
                    {isEn ? r.en : r.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(recipient?.needsDepartment || recipient?.freeText) && (
            <div className="space-y-2">
              <Label>{recipient.freeText ? t.recipientFree : t.recipientDetail}</Label>
              <Input
                dir={dir}
                value={recipientDetail}
                onChange={(e) => setRecipientDetail(e.target.value)}
                placeholder={recipient.freeText ? t.recipientFreePh : t.recipientDetailPh}
              />
              <p className="text-xs text-muted-foreground">
                {t.recipientPreview}: {recipientTitle}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {groups.map(([groupName, groupFields]) => (
        <Card key={groupName} className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{groupName}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {groupFields.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <Label>
                  {labelOf(f)}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    dir={dir}
                    value={values[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={placeholderOf(f)}
                    rows={3}
                  />
                ) : f.type === "select" && f.options ? (
                  <Select value={values[f.key] ?? ""} onValueChange={(v) => set(f.key, v)}>
                    <SelectTrigger><SelectValue placeholder={labelOf(f)} /></SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{optionLabel(o)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    dir={
                      f.type === "phone" || f.type === "number" || f.type === "currency-omr"
                        ? "ltr"
                        : dir
                    }
                    value={values[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={placeholderOf(f)}
                  />
                )}
                {helperOf(f) && <p className="text-xs text-muted-foreground">{helperOf(f)}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button size="lg" className="w-full gap-2" onClick={handleGenerate} disabled={generating}>
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {t.generate}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">{t.printNote}</p>
      {!isPro && <p className="mt-1 text-center text-xs text-muted-foreground">{t.freeNote}</p>}

      <LetterGateDialog
        open={gateOpen}
        onOpenChange={setGateOpen}
        authority={pendingFormat ? "user_format" : authorityId}
        letterType={pendingFormat ? `format:${pendingFormat.format.id}` : letterTypeId}
        language={lang}
        onGranted={(remaining) => {
          if (pendingFormat) {
            const { format, values: formatValues } = pendingFormat;
            setPendingFormat(null);
            void runFormatDownload(format, formatValues);
            return;
          }
          void runDownload(remaining);
        }}
      />
    </div>
  );
}
