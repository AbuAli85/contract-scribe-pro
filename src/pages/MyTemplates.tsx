import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Download,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Wand2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import {
  scanTemplate,
  scanTemplateWithAi,
  mergeTemplate,
  normalizeValuesForMerge,
  type PlaceholderField,
  type ScanResult,
  type AiIngestionResult,
} from "@/lib/templateEngine";

type Stage = "upload" | "review" | "fill" | "done";

const COPY = {
  en: {
    title: "Bring Your Own Template",
    subtitle:
      "Upload any Word document with {placeholder} tokens — we'll detect them and turn it into a fillable form.",
    back: "Back to dashboard",
    uploadTitle: "Upload a .docx template",
    uploadHint:
      "Use {token} syntax in your Word document. Example: 'Dear {employee_name}, your salary will be {salary} OMR.'",
    uploadCta: "Choose a Word file",
    scanning: "Scanning template...",
    reviewTitle: "Detected placeholders",
    reviewSubtitle:
      "We found these fields in your template. Review the labels, then continue to fill them in.",
    foundCount: "fields found",
    noFields: "No placeholders found. Add {tokens} to your document and re-upload.",
    fieldKey: "Token",
    fieldLabel: "Label",
    fieldType: "Type",
    continueToFill: "Continue to fill the form",
    fillTitle: "Fill the contract",
    fillSubtitle: "Enter the values for each placeholder. Date fields will be formatted automatically.",
    generate: "Generate filled document",
    generating: "Generating...",
    doneTitle: "Done! Your filled contract is ready.",
    doneSubtitle:
      "The .docx was downloaded to your computer. You can also save it for digital signature.",
    downloadAgain: "Download again",
    another: "Fill another from same template",
    startOver: "Upload a different template",
    error: "Something went wrong. Please try again.",
    notDocx: "Only .docx files are supported. Convert PDFs to Word first.",
  },
  ar: {
    title: "أحضر النموذج الخاص بك",
    subtitle:
      "حمّل أي مستند Word يحتوي على رموز {placeholder} — سنكتشفها ونحوّلها إلى نموذج قابل للتعبئة.",
    back: "العودة إلى لوحة التحكم",
    uploadTitle: "حمّل ملف .docx",
    uploadHint:
      "استخدم صيغة {token} في مستند Word.",
    uploadCta: "اختر ملف Word",
    scanning: "جارٍ فحص النموذج...",
    reviewTitle: "العناصر النائبة المكتشفة",
    reviewSubtitle:
      "وجدنا هذه الحقول في نموذجك. راجع التسميات، ثم تابع لملئها.",
    foundCount: "حقول",
    noFields: "لم يتم العثور على عناصر نائبة. أضف {tokens} إلى مستندك وحمّله مرة أخرى.",
    fieldKey: "الرمز",
    fieldLabel: "التسمية",
    fieldType: "النوع",
    continueToFill: "متابعة لتعبئة النموذج",
    fillTitle: "املأ العقد",
    fillSubtitle: "أدخل قيم كل عنصر نائب. سيتم تنسيق حقول التاريخ تلقائياً.",
    generate: "إنشاء المستند المعبأ",
    generating: "جارٍ الإنشاء...",
    doneTitle: "تم! العقد المعبأ جاهز.",
    doneSubtitle:
      "تم تنزيل ملف .docx على جهازك. يمكنك أيضاً حفظه للتوقيع الرقمي.",
    downloadAgain: "تنزيل مرة أخرى",
    another: "املأ آخر من نفس النموذج",
    startOver: "حمّل نموذجاً مختلفاً",
    error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    notDocx: "ملفات .docx فقط مدعومة. حوّل PDF إلى Word أولاً.",
  },
} as const;

type ScanMode = "manual" | "ai";

const MyTemplates = () => {
  const [language, setLanguage] = useState<"ar" | "en">("en");
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [aiResult, setAiResult] = useState<AiIngestionResult | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>("ai");
  const [scanning, setScanning] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const { toast } = useToast();
  const t = COPY[language];
  const isAr = language === "ar";

  const handleFile = useCallback(
    async (f: File) => {
      if (!f.name.toLowerCase().endsWith(".docx")) {
        toast({ title: t.notDocx, variant: "destructive" });
        return;
      }
      setFile(f);
      setScanning(true);
      setStage("review");

      try {
        if (scanMode === "ai") {
          const ai = await scanTemplateWithAi(f);
          setAiResult(ai);
          const aiFields = ai.templateContent?.fields ?? [];
          const compatFields: PlaceholderField[] = aiFields.map((af) => ({
            key: af.key,
            label: isAr ? af.labelAr : af.labelEn,
            type:
              af.type === "currency-omr" || af.type === "number"
                ? "number"
                : af.type === "phone"
                ? "text"
                : af.type === "select"
                ? "text"
                : (af.type as PlaceholderField["type"]),
            required: af.required,
          }));
          setScan({
            fields: compatFields,
            rawTokens: aiFields.map((af) => af.key),
            totalTokens: aiFields.length,
          });
          const seed: Record<string, string> = {};
          compatFields.forEach((field) => (seed[field.key] = ""));
          setValues(seed);
        } else {
          const result = await scanTemplate(f);
          setScan(result);
          setAiResult(null);
          const seed: Record<string, string> = {};
          result.fields.forEach((field) => (seed[field.key] = ""));
          setValues(seed);
        }
      } catch (err) {
        console.error("scan failed:", err);
        toast({
          title: scanMode === "ai" ? "AI scan failed" : t.error,
          description:
            scanMode === "ai"
              ? "Falling back to manual mode. Try again or add {placeholder} tokens to your file."
              : undefined,
          variant: "destructive",
        });
        setStage("upload");
      } finally {
        setScanning(false);
      }
    },
    [scanMode, isAr, t, toast]
  );

  const handleGenerate = async () => {
    if (!file || !scan) return;
    setGenerating(true);
    try {
      const normalized = normalizeValuesForMerge(scan.fields, values);
      const filename = file.name.replace(/\.docx$/i, "-filled.docx");
      const blob = await mergeTemplate(file, normalized, {
        filename,
        download: true,
      });
      setLastBlob(blob);
      setStage("done");
    } catch (err) {
      console.error("mergeTemplate failed:", err);
      toast({ title: t.error, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!lastBlob || !file) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.docx$/i, "-filled.docx");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setScan(null);
    setValues({});
    setLastBlob(null);
    setStage("upload");
  };

  const refillSame = () => {
    const cleared: Record<string, string> = {};
    scan?.fields.forEach((f) => (cleared[f.key] = ""));
    setValues(cleared);
    setLastBlob(null);
    setStage("fill");
  };

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className={`h-4 w-4 ${isAr ? "ms-2 rotate-180" : "me-2"}`} />
              {t.back}
            </Link>
          </Button>
          <LanguageToggle language={language} onChange={setLanguage} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className={`mb-8 ${isAr ? "text-right" : ""}`}>
          <Badge variant="outline" className="mb-3 gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            {isAr ? "ميزة جديدة" : "New feature"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {t.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">{t.subtitle}</p>
        </div>

        {stage === "upload" && (
          <Card>
            <CardHeader>
              <CardTitle className={isAr ? "text-right" : ""}>{t.uploadTitle}</CardTitle>
              <CardDescription className={`leading-relaxed ${isAr ? "text-right" : ""}`}>
                {scanMode === "ai"
                  ? isAr
                    ? "حمّل أي مستند Word."
                    : "Upload any Word document — our AI reads the content and identifies the fillable fields automatically."
                  : t.uploadHint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScanMode("ai")}
                  className={`text-start p-3 border rounded-lg transition-colors ${
                    scanMode === "ai" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {isAr ? "فحص ذكي بالذكاء الاصطناعي" : "Smart AI scan"}
                    </span>
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">
                      {isAr ? "موصى" : "Recommended"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr
                      ? "لا حاجة لأي رموز."
                      : "No tokens needed. AI reads the document and detects fields."}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("manual")}
                  className={`text-start p-3 border rounded-lg transition-colors ${
                    scanMode === "manual" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-foreground" />
                    <span className="font-medium text-sm">
                      {isAr ? "صيغة العناصر النائبة" : "Manual {placeholder}"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr
                      ? "إذا كنت قد أدرجت رموز يدوياً."
                      : "For docs where you've already added {token} markers. Free and instant."}
                  </p>
                </button>
              </div>

              <label
                htmlFor="docx-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 cursor-pointer hover:border-primary hover:bg-muted/40 transition-colors"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-10 w-10 text-primary mb-3 animate-spin" />
                    <div className="font-medium">
                      {scanMode === "ai"
                        ? isAr
                          ? "يقرأ الذكاء الاصطناعي مستندك..."
                          : "AI is reading your document..."
                        : t.scanning}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {scanMode === "ai" ? "~5-10 seconds" : "instant"}
                    </div>
                  </>
                ) : (
                  <>
                    {scanMode === "ai" ? (
                      <Wand2 className="h-10 w-10 text-primary mb-3" />
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    )}
                    <div className="font-medium">{t.uploadCta}</div>
                    <div className="text-xs text-muted-foreground mt-1">.docx</div>
                  </>
                )}
                <Input
                  id="docx-upload"
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={scanning}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>

              {scanMode === "ai" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    {isAr
                      ? "يستخدم النظام Claude AI لتحليل المستند."
                      : "Powered by Claude AI. Your document is analyzed in-memory and not stored."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {stage === "review" && scan && (
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isAr ? "flex-row-reverse text-right" : ""}`}>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {t.reviewTitle}
                {aiResult && (
                  <Badge variant="default" className="gap-1 text-[10px]">
                    <Wand2 className="h-3 w-3" />
                    {isAr ? "تحليل ذكي" : "AI analyzed"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className={isAr ? "text-right" : ""}>
                {t.reviewSubtitle}{" "}
                <Badge variant="secondary" className="ms-1">
                  {scan.fields.length} {t.foundCount}
                </Badge>
                {aiResult && (
                  <span className="ms-2 text-xs">
                    · {isAr ? "ثقة" : "Confidence"}:{" "}
                    <strong>{Math.round(aiResult.confidence * 100)}%</strong>
                    {" · "}
                    {isAr ? "اللغة" : "Language"}:{" "}
                    <strong>{aiResult.detectedLanguage}</strong>
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiResult && aiResult.suggestions.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
                  <div className={`flex items-center gap-2 text-amber-900 font-medium text-sm ${isAr ? "flex-row-reverse" : ""}`}>
                    <Wand2 className="h-4 w-4" />
                    {isAr ? "اقتراحات الذكاء الاصطناعي" : "AI suggestions"}
                  </div>
                  <ul className="space-y-1.5">
                    {aiResult.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className={`text-xs flex items-start gap-2 text-amber-900 ${isAr ? "flex-row-reverse text-right" : ""}`}
                      >
                        <Badge
                          variant="outline"
                          className={`text-[9px] mt-0.5 flex-shrink-0 ${
                            s.severity === "high"
                              ? "border-red-500 text-red-600"
                              : s.severity === "medium"
                              ? "border-amber-500 text-amber-700"
                              : "border-amber-300 text-amber-600"
                          }`}
                        >
                          {s.severity}
                        </Badge>
                        <span>{isAr ? s.messageAr : s.messageEn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {scan.fields.length === 0 ? (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">{t.noFields}</div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className={isAr ? "text-right" : "text-left"}>
                          <th className="p-3 font-medium">{t.fieldKey}</th>
                          <th className="p-3 font-medium">{t.fieldLabel}</th>
                          <th className="p-3 font-medium">{t.fieldType}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scan.fields.map((f) => (
                          <tr key={f.key} className="border-t">
                            <td className="p-3 font-mono text-xs text-primary">
                              {"{" + f.key + "}"}
                            </td>
                            <td className="p-3">{f.label}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {f.type}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={resetAll}>
                      {t.startOver}
                    </Button>
                    <Button onClick={() => setStage("fill")} className="flex-1">
                      {t.continueToFill}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {stage === "fill" && scan && (
          <Card>
            <CardHeader>
              <CardTitle className={isAr ? "text-right" : ""}>{t.fillTitle}</CardTitle>
              <CardDescription className={isAr ? "text-right" : ""}>
                {t.fillSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
                className="space-y-5"
              >
                {scan.fields.map((f) => {
                  const fieldId = `field-${f.key}`;
                  const v = values[f.key] ?? "";
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <Label htmlFor={fieldId} className={isAr ? "text-right block" : "block"}>
                        {f.label}
                        {f.required && <span className="text-destructive ms-1">*</span>}
                      </Label>
                      {f.type === "textarea" ? (
                        <Textarea
                          id={fieldId}
                          value={v}
                          required={f.required}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={fieldId}
                          type={
                            f.type === "date"
                              ? "date"
                              : f.type === "number"
                              ? "number"
                              : f.type === "email"
                              ? "email"
                              : "text"
                          }
                          value={v}
                          required={f.required}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [f.key]: e.target.value }))
                          }
                        />
                      )}
                    </div>
                  );
                })}

                <Separator />

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStage("review")}>
                    {isAr ? "السابق" : "Back"}
                  </Button>
                  <Button type="submit" className="flex-1" disabled={generating}>
                    {generating ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        {t.generating}
                      </>
                    ) : (
                      <>
                        <FileText className="me-2 h-4 w-4" />
                        {t.generate}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {stage === "done" && (
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
              <div>
                <h2 className="text-xl font-bold mb-1">{t.doneTitle}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  {t.doneSubtitle}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <Button variant="outline" onClick={handleDownloadAgain} className="flex-1">
                  <Download className="me-2 h-4 w-4" />
                  {t.downloadAgain}
                </Button>
                <Button onClick={refillSame} className="flex-1">
                  {t.another}
                </Button>
              </div>
              <button
                onClick={resetAll}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                {t.startOver}
              </button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MyTemplates;
