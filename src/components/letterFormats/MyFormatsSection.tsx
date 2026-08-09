// =============================================================
// My Formats — the saved-format list, upload entry, and fill form
//
// Anonymous visitors see the upload card but are sent to sign up:
// a format is worth nothing unless it can be saved to an account.
// Ready-made letters stay open to everyone — only this is gated.
// =============================================================

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FilePlus2, Loader2, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FormatStudioDialog from "./FormatStudioDialog";
import { deleteFormat, listFormats, type LetterFormat } from "@/lib/letterFormats";

const COPY = {
  ar: {
    title: "نماذجي",
    subtitle: "ارفع خطابك بتنسيقك الخاص واستخدمه متى شئت",
    upload: "ارفع نموذجك الخاص",
    loginLine: "احفظ نماذجك وأعد استخدامها — سجّل مجانًا",
    login: "تسجيل الدخول",
    use: "استخدم",
    empty: "لا توجد نماذج محفوظة بعد",
    fill: "املأ الحقول",
    generate: "توليد وتنزيل (Word)",
    deleted: "تم حذف النموذج",
    saved: "تم حفظ النموذج",
  },
  en: {
    title: "My Formats",
    subtitle: "Upload your own letter layout and reuse it whenever you like",
    upload: "Upload your own format",
    loginLine: "Save your formats and reuse them — sign up free",
    login: "Sign in",
    use: "Use",
    empty: "No saved formats yet",
    fill: "Fill in the fields",
    generate: "Generate and download (Word)",
    deleted: "Format deleted",
    saved: "Format saved",
  },
} as const;

export interface MyFormatsSectionProps {
  lang: "ar" | "en";
  userId: string | null;
  /** Routed through the Sprint 1 gate by the page, exactly like ready-made letters. */
  onRequestGenerate: (format: LetterFormat, values: Record<string, string>) => void;
}

export default function MyFormatsSection({
  lang, userId, onRequestGenerate,
}: MyFormatsSectionProps) {
  const t = COPY[lang];
  const dir = lang === "en" ? "ltr" : "rtl";
  const { toast } = useToast();

  const [formats, setFormats] = useState<LetterFormat[]>([]);
  const [loading, setLoading] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [active, setActive] = useState<LetterFormat | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setFormats(await listFormats());
    } catch {
      /* the list simply stays as it was */
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openFormat = (format: LetterFormat) => {
    setActive(format);
    setValues(Object.fromEntries((format.fields ?? []).map((f) => [f.name, ""])));
  };

  const handleDelete = async (format: LetterFormat) => {
    try {
      await deleteFormat(format);
      setFormats((prev) => prev.filter((f) => f.id !== format.id));
      toast({ title: t.deleted });
    } catch (e) {
      toast({ title: String(e instanceof Error ? e.message : e), variant: "destructive" });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FilePlus2 className="h-5 w-5" /> {t.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {userId ? (
          <>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setStudioOpen(true)}
            >
              <Upload className="h-4 w-4" /> {t.upload}
            </Button>

            {loading && <Loader2 className="mx-auto h-4 w-4 animate-spin" />}

            {!loading && formats.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">{t.empty}</p>
            )}

            {formats.map((f) => (
              <div key={f.id} className="flex items-center gap-2 rounded-md border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(f.fields ?? []).length} {lang === "en" ? "fields" : "حقول"}
                  </p>
                </div>
                <Button size="sm" className="shrink-0" onClick={() => openFormat(f)}>
                  {t.use}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-destructive"
                  onClick={() => void handleDelete(f)}
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-sm">{t.loginLine}</p>
            <Button asChild className="w-full">
              {/* Come straight back to the letters page after signing in —
                  the visitor was mid-task, not browsing. */}
              <Link to="/auth?redirect=%2Fletters">{t.login}</Link>
            </Button>
          </div>
        )}
      </CardContent>

      {userId && (
        <FormatStudioDialog
          open={studioOpen}
          onOpenChange={setStudioOpen}
          lang={lang}
          userId={userId}
          onSaved={(saved) => {
            setFormats((prev) => [saved, ...prev]);
            toast({ title: t.saved });
          }}
        />
      )}

      <Dialog open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <DialogContent dir={dir} className="max-w-[min(30rem,calc(100vw-1.5rem))]">
          <DialogHeader className={lang === "en" ? "text-left" : "text-right sm:text-right"}>
            <DialogTitle className="text-lg">{active?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {(active?.fields ?? []).map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={`ff-${f.name}`}>{f.label}</Label>
                <Input
                  id={`ff-${f.name}`}
                  dir={dir}
                  value={values[f.name] ?? ""}
                  placeholder={f.sample}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              </div>
            ))}
            {(active?.fields ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">{t.fill}</p>
            )}
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!active) return;
              const format = active;
              setActive(null);
              onRequestGenerate(format, values);
            }}
          >
            {t.generate}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
