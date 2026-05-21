import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft, ArrowRight, Check, ChevronsUpDown, Upload, Wand2,
  Building2, User, Loader2, FileText, CheckCircle2, Download,
} from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { getTemplateContent, hasTemplateContent } from "@/lib/templateContent";
import {
  scanTemplateWithAi, mergeTemplate, normalizeValuesForMerge,
  type PlaceholderField, type ScanResult,
} from "@/lib/templateEngine";
import type { Party } from "./Parties";

// ── Step indicator ─────────────────────────────────────────────────────
const STEPS = ["Choose Template", "Select Parties", "Fill Fields", "Review & Save"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
              i < current ? "bg-primary border-primary text-primary-foreground"
              : i === current ? "border-primary text-primary bg-primary/10"
              : "border-muted text-muted-foreground"
            }`}>
              {i < current ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === current ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 ${i < current ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Party combobox ─────────────────────────────────────────────────────
function PartyCombobox({
  label, parties, value, onChange,
}: {
  label: string;
  parties: Party[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = parties.find(p => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10 text-left font-normal">
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              {selected.type === "company" ? <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" /> : <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
              <span className="truncate">{selected.name_en}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ms-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No parties found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="__none__" onSelect={() => { onChange(null); setOpen(false); }}>
                <span className="text-muted-foreground">— None —</span>
              </CommandItem>
              {parties.map(p => (
                <CommandItem key={p.id} value={p.name_en} onSelect={() => { onChange(p.id); setOpen(false); }}>
                  <div className="flex items-center gap-2">
                    {p.type === "company" ? <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span>{p.name_en}</span>
                    {p.name_ar && <span className="text-muted-foreground text-xs" dir="rtl">{p.name_ar}</span>}
                  </div>
                  {value === p.id && <Check className="ms-auto h-3.5 w-3.5" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── FieldInput (reused from MyTemplates pattern) ───────────────────────
function FieldInput({ f, v, seeded, onChange }: {
  f: PlaceholderField; v: string; seeded: boolean;
  onChange: (val: string) => void;
}) {
  const id = `nf-${f.key}`;
  return (
    <div className={`space-y-1.5 rounded-md p-2 -m-2 ${seeded ? "bg-green-50/60 dark:bg-green-950/20" : ""}`}>
      <Label htmlFor={id} className="text-sm flex items-center gap-1.5">
        {f.label}
        {f.required && <span className="text-destructive">*</span>}
        {seeded && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-green-100 text-green-700 border-green-200">auto-filled</Badge>}
      </Label>
      {f.type === "textarea" ? (
        <Textarea id={id} value={v} rows={3} onChange={e => onChange(e.target.value)} />
      ) : (
        <Input
          id={id}
          type={f.type === "date" ? "date" : f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
          value={v}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────
function partyToFieldValues(party: Party): Record<string, string> {
  const out: Record<string, string> = { ...party.extra_fields };
  // Map well-known fields generically so any prefix works
  if (party.name_en) { out["name_en"] = party.name_en; out["name"] = party.name_en; }
  if (party.name_ar) out["name_ar"] = party.name_ar;
  if (party.email) out["email"] = party.email;
  if (party.phone) out["phone"] = party.phone;
  if (party.cr_number) out["cr_number"] = party.cr_number;
  if (party.tax_id) out["tax_id"] = party.tax_id;
  if (party.address_en) out["address_en"] = party.address_en;
  if (party.address_ar) out["address_ar"] = party.address_ar;
  if (party.id_number) out["id_number"] = party.id_number;
  if (party.nationality) out["nationality"] = party.nationality;
  if (party.job_title_en) out["job_title_en"] = party.job_title_en;
  if (party.job_title_ar) out["job_title_ar"] = party.job_title_ar;
  return out;
}

function applyPartyToFields(
  partyVals: Record<string, string>,
  prefix: string,
  fieldKeys: string[],
  current: Record<string, string>
): Record<string, string> {
  const next = { ...current };
  for (const key of fieldKeys) {
    // Try exact match first
    if (key in partyVals && partyVals[key]) { next[key] = partyVals[key]; continue; }
    // Strip prefix and try bare key
    const bare = key.startsWith(prefix + "_") ? key.slice(prefix.length + 1) : null;
    if (bare && bare in partyVals && partyVals[bare]) { next[key] = partyVals[bare]; }
  }
  return next;
}

// ── Main page ──────────────────────────────────────────────────────────
export default function NewContract() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  // Step 1 — template
  const [templateSource, setTemplateSource] = useState<"catalog" | "upload">("catalog");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);

  // Scanned fields
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");

  // Step 2 — parties
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [firstPartyId, setFirstPartyId] = useState<string | null>(null);
  const [secondPartyId, setSecondPartyId] = useState<string | null>(null);

  // Step 3 — fields
  const [values, setValues] = useState<Record<string, string>>({});
  const [seededKeys, setSeededKeys] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contractTitle, setContractTitle] = useState("");

  // Step 4 — generating
  const [generating, setGenerating] = useState(false);

  // Load parties on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("parties").select("*").eq("user_id", user.id).order("name_en")
        .then(({ data }) => { if (data) setAllParties(data as Party[]); });
    });
  }, []);

  // ── Step 1: scan catalog template ──
  const handleCatalogSelect = useCallback(async (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = TEMPLATES.find(t => t.id === id);
    if (!tmpl) return;
    setTemplateTitle(tmpl.titleEn);
    setContractTitle(tmpl.titleEn);

    if (hasTemplateContent(id)) {
      const content = getTemplateContent(id);
      const fields: PlaceholderField[] = content.fields.map(f => ({
        key: f.key,
        label: f.labelEn,
        type: (f.type === "currency-omr" ? "number" : f.type === "phone" ? "text" : f.type === "select" ? "text" : f.type) as PlaceholderField["type"],
        required: f.required,
      }));
      const seed: Record<string, string> = {};
      fields.forEach(f => { seed[f.key] = ""; });
      setScan({ fields, rawTokens: fields.map(f => f.key), totalTokens: fields.length });
      setValues(seed);
    } else {
      setScan(null);
      setValues({});
    }
  }, []);

  // ── Step 1: upload .docx ──
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".docx")) {
      toast({ title: "Only .docx files are supported", variant: "destructive" });
      return;
    }
    setUploadedFile(file);
    setTemplateTitle(file.name.replace(/\.docx$/i, ""));
    setContractTitle(file.name.replace(/\.docx$/i, ""));
    setScanning(true);
    try {
      const ai = await scanTemplateWithAi(file, { mode: "fields-only" });
      const fields: PlaceholderField[] = (ai.templateContent?.fields ?? []).map(f => ({
        key: f.key,
        label: f.labelEn,
        type: (f.type === "currency-omr" ? "number" : f.type === "phone" ? "text" : f.type === "select" ? "text" : f.type) as PlaceholderField["type"],
        required: f.required,
      }));
      const seed: Record<string, string> = {};
      fields.forEach(f => { seed[f.key] = ""; });
      setScan({ fields, rawTokens: fields.map(f => f.key), totalTokens: fields.length });
      setValues(seed);
    } catch {
      toast({ title: "AI scan failed. Try again.", variant: "destructive" });
    } finally {
      setScanning(false);
    }
  }, [toast]);

  // ── Step 2 → Step 3: apply party data ──
  const applyPartyData = useCallback(() => {
    if (!scan) return;
    const keys = scan.fields.map(f => f.key);
    const newSeeded = new Set<string>();
    let next = { ...values };

    const fp = allParties.find(p => p.id === firstPartyId);
    const sp = allParties.find(p => p.id === secondPartyId);

    if (fp) {
      const fpVals = partyToFieldValues(fp);
      const before = next;
      next = applyPartyToFields(fpVals, "first_party", keys, next);
      // Also try "party_1" prefix
      next = applyPartyToFields(fpVals, "party_1", keys, next);
      next = applyPartyToFields(fpVals, "party1", keys, next);
      // Track which keys got filled
      for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
    }
    if (sp) {
      const spVals = partyToFieldValues(sp);
      const before = next;
      next = applyPartyToFields(spVals, "second_party", keys, next);
      next = applyPartyToFields(spVals, "party_2", keys, next);
      next = applyPartyToFields(spVals, "party2", keys, next);
      next = applyPartyToFields(spVals, "employee", keys, next);
      next = applyPartyToFields(spVals, "promoter", keys, next);
      for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
    }
    setValues(next);
    setSeededKeys(newSeeded);
  }, [scan, values, allParties, firstPartyId, secondPartyId]);

  // ── Step 4: Generate & Save ──
  const handleGenerate = async () => {
    if (!scan) return;
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Build merged values with dates
      const allValues = {
        ...values,
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      };
      const normalized = normalizeValuesForMerge(scan.fields, allValues);

      // Generate .docx
      let docxBlob: Blob | null = null;
      let docPath: string | null = null;

      if (uploadedFile || (selectedTemplateId && hasTemplateContent(selectedTemplateId))) {
        const fileToMerge = uploadedFile;
        if (fileToMerge) {
          docxBlob = await mergeTemplate(fileToMerge, normalized, { download: false });
        }
      }

      // Insert contract_record
      const { data: record, error: recErr } = await supabase
        .from("contract_records")
        .insert({
          user_id: user.id,
          title: contractTitle.trim() || templateTitle || "Untitled Contract",
          template_id: selectedTemplateId,
          template_type: templateSource === "catalog" ? "catalog" : "byo",
          first_party_id: firstPartyId,
          second_party_id: secondPartyId,
          status: "draft",
          start_date: startDate || null,
          end_date: endDate || null,
          field_values: allValues,
          document_path: null,
        })
        .select()
        .single();
      if (recErr) throw recErr;

      // Upload .docx if generated
      if (docxBlob && record) {
        const path = `records/${user.id}/${record.id}.docx`;
        const { error: upErr } = await supabase.storage
          .from("user-templates")
          .upload(path, docxBlob, {
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            upsert: true,
          });
        if (!upErr) {
          docPath = path;
          await supabase
            .from("contract_records")
            .update({ document_path: docPath })
            .eq("id", record.id);
        }
      }

      // Log events
      const events = [
        { contract_id: record.id, user_id: user.id, type: "created", note: `Contract "${record.title}" created` },
        ...(docxBlob ? [{ contract_id: record.id, user_id: user.id, type: "document_generated", note: "Document generated" }] : []),
      ];
      await supabase.from("contract_events").insert(events);

      toast({ title: "Contract saved" });
      navigate(`/records/${record.id}`);
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Failed to save", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // ── Catalog templates (ready only) ────────────────────────────────
  const readyTemplates = useMemo(() =>
    TEMPLATES.filter(t => t.status === "ready" || t.status === "pro"), []);

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link to="/records"><ArrowLeft className="me-2 h-4 w-4" />Contracts</Link>
      </Button>

      <h1 className="text-2xl font-bold mb-6">New Contract</h1>
      <StepBar current={step} />

      {/* ── Step 0: Choose Template ──────────────────────────────────── */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a template</CardTitle>
            <CardDescription>Pick a catalog template or upload your own .docx file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTemplateSource("catalog")}
                className={`text-start p-3 border rounded-lg transition-colors ${templateSource === "catalog" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Catalog template</span>
                </div>
                <p className="text-xs text-muted-foreground">Pre-built bilingual templates for Oman</p>
              </button>
              <button
                type="button"
                onClick={() => setTemplateSource("upload")}
                className={`text-start p-3 border rounded-lg transition-colors ${templateSource === "upload" ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Upload .docx</span>
                </div>
                <p className="text-xs text-muted-foreground">Your own Word document with placeholders</p>
              </button>
            </div>

            {templateSource === "catalog" && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {readyTemplates.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleCatalogSelect(t.id)}
                    className={`w-full text-start px-3 py-2.5 border rounded-lg flex items-center justify-between gap-3 transition-colors hover:border-primary/50 ${selectedTemplateId === t.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{t.titleEn}</p>
                      <p className="text-xs text-muted-foreground">{t.category}</p>
                    </div>
                    {selectedTemplateId === t.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {templateSource === "upload" && (
              <div>
                <label
                  htmlFor="wiz-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary mb-2 animate-spin" />
                      <span className="text-sm font-medium">AI is reading your document…</span>
                      <span className="text-xs text-muted-foreground mt-1">~5-10 seconds</span>
                    </>
                  ) : uploadedFile ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">{scan ? `${scan.fields.length} fields detected` : "Click to replace"}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">Choose a .docx file</span>
                      <span className="text-xs text-muted-foreground mt-1">AI will detect the fields automatically</span>
                    </>
                  )}
                  <Input
                    id="wiz-upload"
                    type="file"
                    accept=".docx"
                    className="hidden"
                    disabled={scanning}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                </label>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(1)}
                disabled={
                  (templateSource === "catalog" && !selectedTemplateId) ||
                  (templateSource === "upload" && !scan) ||
                  scanning
                }
              >
                Next <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 1: Select Parties ───────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select parties</CardTitle>
            <CardDescription>
              Choose from your registered parties. Their details will auto-fill the form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>First Party (Employer / Client)</Label>
              <PartyCombobox
                label="Select first party…"
                parties={allParties.filter(p => ["employer", "client", "supplier"].includes(p.role))}
                value={firstPartyId}
                onChange={setFirstPartyId}
              />
              <p className="text-xs text-muted-foreground">
                Not listed?{" "}
                <Link to="/parties" target="_blank" className="underline">Add a party</Link>
                {" "}then come back.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Second Party (Employee / Contractor)</Label>
              <PartyCombobox
                label="Select second party…"
                parties={allParties.filter(p => ["employee", "contractor", "other"].includes(p.role))}
                value={secondPartyId}
                onChange={setSecondPartyId}
              />
            </div>

            {allParties.length === 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                No parties registered yet.{" "}
                <Link to="/parties" target="_blank" className="font-medium underline">Add parties</Link>
                {" "}first to enable auto-fill, or skip and fill manually.
              </div>
            )}

            <div className="flex gap-2 justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="me-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => { applyPartyData(); setStep(2); }}>
                Next <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Fill Fields ──────────────────────────────────────── */}
      {step === 2 && scan && (
        <Card>
          <CardHeader>
            <CardTitle>Fill the fields</CardTitle>
            <CardDescription>
              {seededKeys.size > 0 && (
                <span className="text-green-700 font-medium">{seededKeys.size} fields auto-filled from party records. </span>
              )}
              Complete any remaining fields.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => { e.preventDefault(); setStep(3); }} className="space-y-5">

              {/* Contract meta */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-3">
                <div className="space-y-1.5">
                  <Label>Contract title</Label>
                  <Input
                    value={contractTitle}
                    onChange={e => setContractTitle(e.target.value)}
                    placeholder="e.g. Employment Contract — Ahmed Al-Rashdi"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Start date</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End date</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {scan.fields.map(f => (
                  <FieldInput
                    key={f.key}
                    f={f}
                    v={values[f.key] ?? ""}
                    seeded={seededKeys.has(f.key)}
                    onChange={val => setValues(prev => ({ ...prev, [f.key]: val }))}
                  />
                ))}
              </div>

              <div className="flex gap-2 justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="me-2 h-4 w-4" /> Back
                </Button>
                <Button type="submit">
                  Review <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Review & Save ────────────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & save</CardTitle>
            <CardDescription>Confirm the details, then generate and save the contract.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Title</p>
                <p className="font-medium">{contractTitle || templateTitle || "Untitled"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Template</p>
                <p className="font-medium">{templateTitle || uploadedFile?.name || "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">First Party</p>
                <p className="font-medium">{allParties.find(p => p.id === firstPartyId)?.name_en ?? "—"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Second Party</p>
                <p className="font-medium">{allParties.find(p => p.id === secondPartyId)?.name_en ?? "—"}</p>
              </div>
              {startDate && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Start</p>
                  <p className="font-medium">{startDate}</p>
                </div>
              )}
              {endDate && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">End</p>
                  <p className="font-medium">{endDate}</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Fields</p>
              <p className="text-sm">
                {scan?.fields.length ?? 0} fields &nbsp;·&nbsp;{" "}
                {Object.values(values).filter(Boolean).length} filled
                {seededKeys.size > 0 && <span className="text-green-700"> &nbsp;·&nbsp; {seededKeys.size} auto-filled</span>}
              </p>
            </div>

            {uploadedFile && (
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 text-sm flex items-center gap-2">
                <Download className="h-4 w-4 flex-shrink-0" />
                The filled .docx will be generated and saved to your contract record.
              </div>
            )}
            {templateSource === "catalog" && !hasTemplateContent(selectedTemplateId ?? "") && (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
                This catalog template doesn't have a .docx file yet — the contract record will be saved with your field values.
              </div>
            )}

            <div className="flex gap-2 justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="me-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                <CheckCircle2 className="me-2 h-4 w-4" />
                {generating ? "Saving…" : "Generate & Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
