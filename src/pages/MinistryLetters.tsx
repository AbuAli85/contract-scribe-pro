// =============================================================
// Ministry Letters — /letters
//
// Generate formal Arabic letters to Oman government authorities
// in the locked standard layout. User picks authority + letter
// type, fills the fields, downloads a print-ready .docx
// (printed on the company's own letterhead paper).
//
// Company/applicant fields auto-fill from the user's "employer"
// party when one exists.
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
  AUTHORITIES, LETTER_TYPES, COMMON_FIELDS,
  getAuthority, getLetterType,
} from "@/lib/ministryLetters";
import type { LetterValues } from "@/lib/ministryLetters";
import type { TemplateField } from "@/lib/templateContent/types";
import { downloadMinistryLetter } from "@/utils/docx/generateMinistryLetter";
import LetterGateDialog from "@/components/LetterGateDialog";
import { checkLetterGeneration, readStoredGate } from "@/lib/letterGate";
import { useAuth } from "@/hooks/useAuth";

export default function MinistryLetters() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [authorityId, setAuthorityId] = useState<string>("spf");
  const [letterTypeId, setLetterTypeId] = useState<string>("installment");
  const [values, setValues] = useState<LetterValues>({});
  const [generating, setGenerating] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const isPro = profile?.is_pro === true;

  const letterType = getLetterType(letterTypeId);
  const fields = useMemo<TemplateField[]>(
    () => [...COMMON_FIELDS, ...(letterType?.fields ?? [])],
    [letterType],
  );

  // Auto-fill company from the user's employer party.
  // NOTE: generated Supabase types predate the `parties` table (see
  // Parties.tsx which casts results the same way) — query untyped.
  useEffect(() => {
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
  }, []);

  // Apply field defaults when letter type changes
  useEffect(() => {
    setValues((v) => {
      const next = { ...v };
      for (const f of fields) {
        if (f.defaultValue && !next[f.key]) next[f.key] = f.defaultValue;
      }
      return next;
    });
  }, [fields]);

  const set = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const missing = fields.filter((f) => f.required && !(values[f.key] ?? "").trim());

  /** The download itself — the locked layout, unchanged. */
  const runDownload = async (remaining: number | null) => {
    if (!letterType) return;
    setGenerating(true);
    try {
      await downloadMinistryLetter({
        authority: getAuthority(authorityId),
        letterType,
        values,
      });
      toast({
        title: "تم إنشاء الخطاب",
        description:
          remaining === null
            ? "جاهز للطباعة على الورق الرسمي للشركة"
            : `تم التنزيل — تبقى لك ${remaining} خطاب مجاني`,
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
        title: "حقول ناقصة",
        description: missing.map((f) => f.labelAr).join("، "),
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
        language: "ar",
      }).catch(() => undefined);
      await runDownload(null);
      return;
    }

    // Free tier: the dialog resolves email → code → limit check. It skips
    // straight to the check when this browser already holds a gate token.
    setGateOpen(true);
  };

  // Group fields by groupAr for sectioned form
  const groups = useMemo(() => {
    const map = new Map<string, TemplateField[]>();
    for (const f of fields) {
      const g = f.groupAr || f.group;
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    }
    return [...map.entries()];
  }, [fields]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8" dir="rtl">
      <div className="mb-6 flex items-center gap-3">
        <Landmark className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">الخطابات الحكومية</h1>
          <p className="text-sm text-muted-foreground">
            خطابات رسمية للجهات الحكومية في سلطنة عُمان — تنسيق موحد جاهز للطباعة على الورق الرسمي
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" /> نوع الخطاب والجهة
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>الجهة الحكومية</Label>
            <Select value={authorityId} onValueChange={setAuthorityId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AUTHORITIES.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>نوع الخطاب</Label>
            <Select value={letterTypeId} onValueChange={setLetterTypeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LETTER_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.titleAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {letterType && (
              <p className="text-xs text-muted-foreground">{letterType.descAr}</p>
            )}
          </div>
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
                  {f.labelAr}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>
                {f.type === "textarea" ? (
                  <Textarea
                    dir="rtl"
                    value={values[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholderAr ?? f.placeholderEn}
                    rows={3}
                  />
                ) : f.type === "select" && f.options ? (
                  <Select value={values[f.key] ?? ""} onValueChange={(v) => set(f.key, v)}>
                    <SelectTrigger><SelectValue placeholder={f.labelAr} /></SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.labelAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    dir={f.type === "phone" || f.type === "number" || f.type === "currency-omr" ? "ltr" : "rtl"}
                    value={values[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholderAr ?? f.placeholderEn}
                  />
                )}
                {f.helperAr && <p className="text-xs text-muted-foreground">{f.helperAr}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button size="lg" className="w-full gap-2" onClick={handleGenerate} disabled={generating}>
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        توليد الخطاب وتنزيله (Word)
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        يُطبع الخطاب على الورق الرسمي للشركة — التنسيق قياسي موحد لجميع الجهات الحكومية
      </p>
      {!isPro && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          خطابان مجانيان بعد تأكيد بريدك الإلكتروني
        </p>
      )}

      <LetterGateDialog
        open={gateOpen}
        onOpenChange={setGateOpen}
        authority={authorityId}
        letterType={letterTypeId}
        language="ar"
        onGranted={(remaining) => void runDownload(remaining)}
      />
    </div>
  );
}
