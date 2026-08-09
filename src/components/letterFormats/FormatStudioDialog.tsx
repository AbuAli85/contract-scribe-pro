// =============================================================
// Format Studio — upload, confirm placeholders, save
//
// Mobile-first: the document is a scrollable pane with the proposed
// placeholders highlighted, and every edit happens in a stacked card
// list underneath it. No hover, no drag, no popovers — all of that
// dies on a phone, which is where these letters actually get made.
//
// Nothing becomes a placeholder without a tap. Detection only proposes.
// =============================================================

import { useMemo, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Plus, FileText } from "lucide-react";
import {
  detectPlaceholders, loadUpload, manualSuggestion, normalizeFieldName,
  saveFormat, suggestionsToFields, tagDocx, FormatLimitError,
  type FieldSuggestion, type LetterFormat, type UploadRejection,
} from "@/lib/letterFormats";
import type { DocxParagraph } from "@/lib/letterFormats";

const COPY = {
  ar: {
    title: "ارفع نموذجك الخاص",
    desc: "ارفع خطابك بصيغة Word — سنقترح الحقول المتغيرة، وتؤكدها أنت.",
    pick: "اختر ملف Word (.docx)",
    max: "الحد الأقصى ٥ ميجابايت",
    reviewTitle: "أكّد الحقول",
    reviewDesc: "المظلّل سيصبح حقلًا قابلًا للتعبئة. احذف ما لا تريده.",
    fieldsTitle: "الحقول المقترحة",
    none: "لم نتعرف على حقول تلقائيًا — أضف حقلًا يدويًا بالأسفل.",
    label: "اسم الحقل",
    sample: "القيمة الحالية",
    manualTitle: "أضف حقلًا يدويًا",
    manualText: "النص المراد استبداله (انسخه من المستند أعلاه)",
    manualLabel: "اسم الحقل",
    add: "أضف",
    notFound: "لم نجد هذا النص في المستند",
    nameTitle: "اسم النموذج",
    namePlaceholder: "خطاب صندوق الحماية",
    save: "احفظ النموذج",
    next: "التالي",
    back: "رجوع",
    limit: "النماذج المتعددة ميزة مدفوعة — قم بالترقية",
    upgrade: "عرض الباقات",
    errors: {
      not_docx: "الملف يجب أن يكون بصيغة Word ‏(.docx)",
      too_large: "حجم الملف أكبر من ٥ ميجابايت",
      protected_docx: "الملف محمي بكلمة مرور — أزل الحماية ثم أعد الرفع",
      no_text: "لا يوجد نص قابل للقراءة — يبدو أن الملف صورة ممسوحة ضوئيًا",
      unreadable_docx: "تعذر قراءة الملف",
    } as Record<UploadRejection, string>,
  },
  en: {
    title: "Upload your own format",
    desc: "Upload your letter as Word — we propose the variable parts, you confirm them.",
    pick: "Choose a Word file (.docx)",
    max: "5 MB maximum",
    reviewTitle: "Confirm the fields",
    reviewDesc: "Highlighted text becomes a fillable field. Remove anything you don't want.",
    fieldsTitle: "Proposed fields",
    none: "Nothing detected automatically — add a field manually below.",
    label: "Field name",
    sample: "Current value",
    manualTitle: "Add a field manually",
    manualText: "Text to replace (copy it from the document above)",
    manualLabel: "Field name",
    add: "Add",
    notFound: "That text isn't in the document",
    nameTitle: "Format name",
    namePlaceholder: "SPF letter",
    save: "Save format",
    next: "Next",
    back: "Back",
    limit: "Multiple formats are a paid feature — upgrade",
    upgrade: "View plans",
    errors: {
      not_docx: "The file must be a Word .docx",
      too_large: "The file is larger than 5 MB",
      protected_docx: "The file is password-protected — remove the protection and re-upload",
      no_text: "No readable text — this looks like a scanned image",
      unreadable_docx: "The file could not be read",
    } as Record<UploadRejection, string>,
  },
} as const;

type Step = "upload" | "review" | "name";

export interface FormatStudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: "ar" | "en";
  userId: string;
  onSaved: (format: LetterFormat) => void;
}

export default function FormatStudioDialog({
  open, onOpenChange, lang, userId, onSaved,
}: FormatStudioDialogProps) {
  const t = COPY[lang];
  const dir = lang === "en" ? "ltr" : "rtl";
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);

  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [paragraphs, setParagraphs] = useState<DocxParagraph[]>([]);
  const [suggestions, setSuggestions] = useState<FieldSuggestion[]>([]);
  const [formatName, setFormatName] = useState("");

  const [manualText, setManualText] = useState("");
  const [manualLabel, setManualLabel] = useState("");

  const reset = () => {
    setStep("upload"); setBusy(false); setError(null); setLimitHit(false);
    setBuffer(null); setParagraphs([]); setSuggestions([]); setFormatName("");
    setManualText(""); setManualLabel("");
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    const result = await loadUpload(file);
    setBusy(false);

    if (!result.ok || !result.data) {
      setError(t.errors[result.reason ?? "unreadable_docx"]);
      return;
    }
    setBuffer(result.data.buffer);
    setParagraphs(result.data.paragraphs);
    setSuggestions(detectPlaceholders(result.data.paragraphs));
    setFormatName(file.name.replace(/\.docx$/i, ""));
    setStep("review");
  };

  const addManual = () => {
    const text = manualText.trim();
    if (!text) return;
    const taken = new Set(suggestions.map((s) => s.field));
    const name = normalizeFieldName(manualLabel || text, taken);
    const added = manualSuggestion(paragraphs, text, name, manualLabel || name, manualLabel || name);
    if (!added) {
      setError(t.notFound);
      return;
    }
    setError(null);
    setSuggestions((prev) => [...prev, added]);
    setManualText("");
    setManualLabel("");
  };

  const renameField = (index: number, label: string) =>
    setSuggestions((prev) =>
      prev.map((s, i) => (i === index ? { ...s, labelAr: label, labelEn: label } : s)),
    );

  const removeField = (index: number) =>
    setSuggestions((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!buffer || !formatName.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const spans = suggestions.flatMap((s) =>
        s.spans.map((sp) => ({ ...sp, field: s.field })),
      );
      const tagged = tagDocx(buffer, spans);
      const saved = await saveFormat({
        userId,
        name: formatName.trim(),
        language: lang,
        fields: suggestionsToFields(suggestions, lang),
        tagged,
      });
      onSaved(saved);
      onOpenChange(false);
      reset();
    } catch (e) {
      if (e instanceof FormatLimitError) setLimitHit(true);
      else setError(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(false);
    }
  };

  /** Paragraph text with the confirmed spans highlighted. */
  const highlighted = useMemo(() => {
    const byPara = new Map<number, { start: number; end: number; field: string }[]>();
    suggestions.forEach((s) =>
      s.spans.forEach((sp) => {
        const list = byPara.get(sp.paragraphIndex) ?? [];
        list.push({ ...sp, field: s.field });
        byPara.set(sp.paragraphIndex, list);
      }),
    );
    for (const list of byPara.values()) list.sort((a, b) => a.start - b.start);

    return paragraphs.map((para) => {
      const spans = byPara.get(para.index) ?? [];
      const parts: { text: string; field?: string }[] = [];
      let cursor = 0;
      for (const sp of spans) {
        if (sp.start < cursor) continue;
        if (sp.start > cursor) parts.push({ text: para.text.slice(cursor, sp.start) });
        parts.push({ text: para.text.slice(sp.start, sp.end), field: sp.field });
        cursor = sp.end;
      }
      if (cursor < para.text.length) parts.push({ text: para.text.slice(cursor) });
      return { index: para.index, parts };
    });
  }, [paragraphs, suggestions]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent
        dir={dir}
        className="max-h-[92vh] max-w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto"
      >
        <DialogHeader className={lang === "en" ? "text-left" : "text-right sm:text-right"}>
          <DialogTitle className="text-lg">
            {step === "upload" ? t.title : step === "review" ? t.reviewTitle : t.nameTitle}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" ? t.desc : step === "review" ? t.reviewDesc : ""}
          </DialogDescription>
        </DialogHeader>

        {limitHit ? (
          <div className="space-y-4 py-2">
            <p className="text-sm">{t.limit}</p>
            <Button asChild className="w-full">
              <a href="/upgrade">{t.upgrade}</a>
            </Button>
          </div>
        ) : step === "upload" ? (
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
                e.target.value = "";
              }}
            />
            <Button
              size="lg"
              variant="outline"
              className="h-24 w-full flex-col gap-2"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
              <span>{t.pick}</span>
              <span className="text-xs text-muted-foreground">{t.max}</span>
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : step === "review" ? (
          <div className="space-y-4">
            <div className="max-h-[38vh] overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm leading-relaxed">
              {highlighted.map((para) => (
                <p key={para.index} className="mb-2 last:mb-0">
                  {para.parts.map((part, i) =>
                    part.field ? (
                      <mark
                        key={i}
                        className="rounded bg-primary/20 px-1 font-medium text-foreground"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    ),
                  )}
                </p>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t.fieldsTitle}</p>
              {suggestions.length === 0 && (
                <p className="text-sm text-muted-foreground">{t.none}</p>
              )}
              {suggestions.map((s, i) => (
                <div key={`${s.field}-${i}`} className="rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      dir={dir}
                      value={lang === "en" ? s.labelEn : s.labelAr}
                      onChange={(e) => renameField(i, e.target.value)}
                      aria-label={t.label}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive"
                      onClick={() => removeField(i)}
                      aria-label="remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {t.sample}: {s.sample}
                    {s.spans.length > 1 ? ` ×${s.spans.length}` : ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-md border border-dashed p-3">
              <p className="text-sm font-medium">{t.manualTitle}</p>
              <Input
                dir={dir}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={t.manualText}
              />
              <div className="flex gap-2">
                <Input
                  dir={dir}
                  value={manualLabel}
                  onChange={(e) => setManualLabel(e.target.value)}
                  placeholder={t.manualLabel}
                />
                <Button variant="secondary" className="shrink-0 gap-1" onClick={addManual}>
                  <Plus className="h-4 w-4" /> {t.add}
                </Button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep("upload")}>
                {t.back}
              </Button>
              <Button className="flex-1" onClick={() => setStep("name")}>
                {t.next}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format-name">{t.nameTitle}</Label>
              <Input
                id="format-name"
                dir={dir}
                value={formatName}
                onChange={(e) => setFormatName(e.target.value)}
                placeholder={t.namePlaceholder}
              />
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              {suggestions.length} {lang === "en" ? "fields" : "حقول"}
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep("review")}>
                {t.back}
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={busy || !formatName.trim()}
                onClick={() => void handleSave()}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.save}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
