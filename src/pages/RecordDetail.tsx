import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Download, Loader2, CheckCircle2, XCircle, RefreshCw,
  Building2, User, Calendar, FileText, Clock, Plus, Pencil, Send,
  ExternalLink, Copy, PenLine, Paperclip,
} from "lucide-react";
import { computeStatus, STATUS_LABEL, STATUS_COLOR, type ContractRecord } from "./Records";
import type { Party } from "./Parties";

// ── Event types ────────────────────────────────────────────────────────
interface ContractEvent {
  id: string;
  contract_id: string;
  user_id: string | null;
  type: string;
  note: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  created: <FileText className="h-3.5 w-3.5 text-blue-600" />,
  activated: <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  document_generated: <Download className="h-3.5 w-3.5 text-primary" />,
  expiring_soon: <Clock className="h-3.5 w-3.5 text-amber-600" />,
  expired: <XCircle className="h-3.5 w-3.5 text-red-600" />,
  terminated: <XCircle className="h-3.5 w-3.5 text-red-600" />,
  renewed: <RefreshCw className="h-3.5 w-3.5 text-blue-600" />,
  extended: <Calendar className="h-3.5 w-3.5 text-teal-600" />,
  note_added: <Pencil className="h-3.5 w-3.5 text-muted-foreground" />,
  sent_for_signing: <Send className="h-3.5 w-3.5 text-violet-600" />,
  signed: <PenLine className="h-3.5 w-3.5 text-green-700" />,
};

function EventTimeline({ events }: { events: ContractEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No events yet.</p>;
  }
  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div key={ev.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="h-7 w-7 rounded-full border bg-background flex items-center justify-center flex-shrink-0">
              {EVENT_ICONS[ev.type] ?? <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            {i < events.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-3 min-w-0">
            <p className="text-sm font-medium capitalize">{ev.type.replace(/_/g, " ")}</p>
            {ev.note && <p className="text-xs text-muted-foreground mt-0.5">{ev.note}</p>}
            {ev.data && typeof ev.data === "object" && "recipient_email" in ev.data && (
              <p className="text-xs text-violet-700 mt-0.5">→ {ev.data.recipient_name as string} ({ev.data.recipient_email as string})</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {format(parseISO(ev.created_at), "d MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Field grouping helpers ─────────────────────────────────────────────
const FIELD_GROUP_DEFS: [string, string[], string[]][] = [
  ["Employer", ["employer_"], []],
  ["First Party", ["first_party_", "client_"], []],
  ["Second Party / Employee", ["second_party_", "promoter_", "employee_", "worker_"], [
    "name_en", "name_ar", "name",
  ]],
  ["Supplier", ["supplier_", "vendor_"], []],
  ["Contract Dates", ["contract_"], ["start_date", "end_date"]],
  ["Employee Details", [], [
    "id_card_number", "civil_id", "national_id", "id_number",
    "passport_number", "visa_number", "work_permit_number",
    "labour_card_number", "resident_card_number",
    "salary", "basic_salary", "total_salary",
    "housing_allowance", "transport_allowance",
    "iban", "iban_number", "bank_name", "bank_account_number", "currency",
    "hire_date", "date_of_birth", "gender", "nationality",
    "job_title", "job_title_en", "job_title_ar",
    "department", "position", "employee_number", "contract_type",
    "email", "phone", "first_name", "last_name", "first_name_ar", "last_name_ar",
  ]],
];

function groupFieldValues(fv: Record<string, unknown>): { group: string; entries: [string, unknown][]; hasUrls: boolean }[] {
  const assigned = new Set<string>();
  const result: { group: string; entries: [string, unknown][]; hasUrls: boolean }[] = [];

  for (const [group, prefixes, standalones] of FIELD_GROUP_DEFS) {
    const entries: [string, unknown][] = [];
    for (const [k, v] of Object.entries(fv)) {
      if (assigned.has(k)) continue;
      if (prefixes.some(p => k.startsWith(p)) || standalones.includes(k)) {
        if (!isDocUrl(k)) { entries.push([k, v]); }
        assigned.add(k);
      }
    }
    if (entries.length > 0) {
      result.push({ group, entries, hasUrls: false });
    }
  }

  const remaining = Object.entries(fv).filter(([k]) => !assigned.has(k) && !isDocUrl(k));
  if (remaining.length > 0) result.push({ group: "Other", entries: remaining, hasUrls: false });

  return result;
}

function isDocUrl(key: string): boolean {
  return key.startsWith("doc_") && (key.endsWith("_url") || key.endsWith("_expires") || key.endsWith("_status"));
}

function isUrl(v: unknown): v is string {
  return typeof v === "string" && (v.startsWith("http://") || v.startsWith("https://"));
}

function humanizeKey(k: string): string {
  return k
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

const DOC_TYPE_LABEL: Record<string, string> = {
  passport: "Passport",
  civil_id: "Civil ID",
  visa: "Visa",
  resident_card: "Resident Card",
  labour_card: "Labour Card",
  employment_contract: "Employment Contract",
  mol_work_permit_certificate: "Work Permit",
  medical_certificate: "Medical Certificate",
  photo: "Photo",
  other: "Other",
};

// Extract employee attachments stored as doc_*_url in field_values
function extractAttachments(fv: Record<string, unknown>): { type: string; label: string; url: string; expires: string | null; status: string | null }[] {
  const out: { type: string; label: string; url: string; expires: string | null; status: string | null }[] = [];
  const docTypes = new Set<string>();
  for (const k of Object.keys(fv)) {
    const m = k.match(/^doc_(.+)_url$/);
    if (m) docTypes.add(m[1]);
  }
  for (const t of docTypes) {
    const url = fv[`doc_${t}_url`];
    if (typeof url !== "string" || !url) continue;
    out.push({
      type: t,
      label: DOC_TYPE_LABEL[t] ?? humanizeKey(t),
      url,
      expires: (fv[`doc_${t}_expires`] as string) || null,
      status: (fv[`doc_${t}_status`] as string) || null,
    });
  }
  return out;
}

// Extract party names from field_values for display when no Supabase party_id is set
function extractPartyNames(fv: Record<string, unknown>) {
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    employer: str(fv.employer_name_en) ?? str(fv.employer_name),
    employerAr: str(fv.employer_name_ar),
    firstParty: str(fv.first_party_name_en) ?? str(fv.client_name_en),
    firstPartyAr: str(fv.first_party_name_ar) ?? str(fv.client_name_ar),
    secondParty: str(fv.second_party_name_en) ?? str(fv.promoter_name_en) ?? str(fv.employee_name_en),
    secondPartyAr: str(fv.second_party_name_ar) ?? str(fv.promoter_name_ar) ?? str(fv.employee_name_ar),
    recipientEmail: str(fv.email) ?? str(fv.promoter_email) ?? str(fv.employee_email) ?? str(fv.second_party_email),
    recipientName: str(fv.promoter_name_en) ?? str(fv.second_party_name_en) ?? str(fv.employee_name_en),
  };
}

// ── Main page ──────────────────────────────────────────────────────────
export default function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [record, setRecord] = useState<ContractRecord | null>(null);
  const [firstParty, setFirstParty] = useState<Party | null>(null);
  const [secondParty, setSecondParty] = useState<Party | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [terminateDate, setTerminateDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [sendOpen, setSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sendName, setSendName] = useState("");
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [loggingSend, setLoggingSend] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: rec, error } = await supabase
        .from("contract_records")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setRecord(rec as ContractRecord);

      const r = rec as ContractRecord;
      if (r.first_party_id) {
        const { data: fp } = await supabase.from("parties").select("*").eq("id", r.first_party_id).single();
        setFirstParty(fp as Party ?? null);
      } else setFirstParty(null);
      if (r.second_party_id) {
        const { data: sp } = await supabase.from("parties").select("*").eq("id", r.second_party_id).single();
        setSecondParty(sp as Party ?? null);
      } else setSecondParty(null);

      const { data: evts } = await supabase
        .from("contract_events")
        .select("*")
        .eq("contract_id", id)
        .order("created_at", { ascending: false });
      setEvents((evts ?? []) as ContractEvent[]);
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Not found", variant: "destructive" });
      navigate("/records");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => { load(); }, [load]);

  const logEvent = async (type: string, note: string, data?: Record<string, unknown>) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("contract_events").insert({
      contract_id: id, user_id: user?.id ?? null, type, note, data: data ?? null,
    });
  };

  // ── Derived data ──────────────────────────────────────────────────────
  const fv = useMemo(() => (record?.field_values ?? {}) as Record<string, unknown>, [record]);
  const partyNames = useMemo(() => extractPartyNames(fv), [fv]);
  const fieldGroups = useMemo(() => groupFieldValues(fv), [fv]);
  const attachments = useMemo(() => extractAttachments(fv), [fv]);
  const hasSentForSigning = useMemo(() => events.some(e => e.type === "sent_for_signing"), [events]);
  const isSigned = useMemo(() => events.some(e => e.type === "signed"), [events]);

  // Pre-fill send dialog when record loads
  useEffect(() => {
    if (record && partyNames.recipientEmail) setSendEmail(partyNames.recipientEmail);
    if (record && partyNames.recipientName) setSendName(partyNames.recipientName);
  }, [record, partyNames.recipientEmail, partyNames.recipientName]);

  // ── Actions ───────────────────────────────────────────────────────────
  const handleActivate = async () => {
    setActioning(true);
    try {
      await supabase.from("contract_records").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", id);
      await logEvent("activated", "Contract marked as active");
      toast({ title: "Contract activated" });
      await load();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setActioning(false); }
  };

  const handleTerminate = async () => {
    setActioning(true);
    try {
      await supabase.from("contract_records").update({ status: "terminated", updated_at: new Date().toISOString() }).eq("id", id);
      await logEvent("terminated", terminateReason || `Terminated on ${terminateDate}`, { date: terminateDate, reason: terminateReason });
      toast({ title: "Contract terminated" });
      setTerminateOpen(false);
      await load();
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setActioning(false); }
  };

  const handleRenew = async () => {
    if (!record) return;
    setActioning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("contract_records").update({ status: "renewed", updated_at: new Date().toISOString() }).eq("id", id);
      await logEvent("renewed", "Contract renewed — new record created");
      const { data: newRec, error } = await supabase.from("contract_records").insert({
        user_id: user.id,
        title: `${record.title} (Renewed)`,
        template_id: record.template_id,
        template_type: record.template_type,
        first_party_id: record.first_party_id,
        second_party_id: record.second_party_id,
        status: "draft",
        field_values: record.field_values,
        parent_id: id,
      }).select().single();
      if (error) throw error;
      await supabase.from("contract_events").insert({ contract_id: newRec.id, user_id: user.id, type: "created", note: `Renewed from "${record.title}"` });
      toast({ title: "Renewal created" });
      navigate(`/records/${newRec.id}`);
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setActioning(false); }
  };

  const handleDownload = async () => {
    if (!record?.document_path) { toast({ title: "No document saved for this record", variant: "destructive" }); return; }
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage.from("user-templates").download(record.document_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = `${record.title}.docx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { toast({ title: "Download failed", variant: "destructive" }); }
    finally { setDownloading(false); }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await logEvent("note_added", noteText.trim());
      setNoteText(""); setNoteOpen(false);
      toast({ title: "Note added" });
      const { data: evts } = await supabase.from("contract_events").select("*").eq("contract_id", id).order("created_at", { ascending: false });
      setEvents((evts ?? []) as ContractEvent[]);
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setSavingNote(false); }
  };

  const handleGenerateLink = async () => {
    if (!record?.document_path) return;
    setGeneratingLink(true);
    try {
      const { data, error } = await supabase.storage
        .from("user-templates")
        .createSignedUrl(record.document_path, 60 * 60 * 24 * 7); // 7 days
      if (error) throw error;
      setSignedUrl(data.signedUrl);
    } catch { toast({ title: "Could not generate link", variant: "destructive" }); }
    finally { setGeneratingLink(false); }
  };

  const handleCopyLink = () => {
    if (!signedUrl) return;
    navigator.clipboard.writeText(signedUrl).then(() => toast({ title: "Link copied to clipboard" }));
  };

  const handleLogSent = async () => {
    if (!sendEmail.trim()) return;
    setLoggingSend(true);
    try {
      await logEvent("sent_for_signing", `Sent to ${sendName || sendEmail} for signing`, {
        recipient_email: sendEmail.trim(),
        recipient_name: sendName.trim(),
      });
      toast({ title: "Logged as sent for signing" });
      setSendOpen(false);
      const { data: evts } = await supabase.from("contract_events").select("*").eq("contract_id", id).order("created_at", { ascending: false });
      setEvents((evts ?? []) as ContractEvent[]);
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setLoggingSend(false); }
  };

  const handleMarkSigned = async () => {
    setActioning(true);
    try {
      await logEvent("signed", "Contract marked as signed by recipient");
      toast({ title: "Contract marked as signed" });
      const { data: evts } = await supabase.from("contract_events").select("*").eq("contract_id", id).order("created_at", { ascending: false });
      setEvents((evts ?? []) as ContractEvent[]);
    } catch { toast({ title: "Failed", variant: "destructive" }); }
    finally { setActioning(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!record) return null;

  const effectiveStatus = computeStatus(record);

  // Determine display names for party cards
  const fp1Name = firstParty?.name_en ?? partyNames.firstParty;
  const fp1Ar = firstParty?.name_ar ?? partyNames.firstPartyAr;
  const fp2Name = secondParty?.name_en ?? partyNames.secondParty;
  const fp2Ar = secondParty?.name_ar ?? partyNames.secondPartyAr;
  const empName = partyNames.employer;
  const empAr = partyNames.employerAr;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/records"><ArrowLeft className="me-2 h-4 w-4" />Contracts</Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold">{record.title}</h1>
            <Badge variant="outline" className={`text-xs ${STATUS_COLOR[effectiveStatus]}`}>
              {STATUS_LABEL[effectiveStatus]}
            </Badge>
            {isSigned && (
              <Badge className="text-xs bg-green-100 text-green-800 border border-green-300">
                <PenLine className="h-3 w-3 me-1" /> Signed
              </Badge>
            )}
            {hasSentForSigning && !isSigned && (
              <Badge className="text-xs bg-violet-100 text-violet-800 border border-violet-300">
                <Send className="h-3 w-3 me-1" /> Sent for signing
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Created {format(parseISO(record.created_at), "d MMM yyyy")}
            {record.parent_id && (
              <> &nbsp;·&nbsp; <Link to={`/records/${record.parent_id}`} className="underline">View original</Link></>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-end">
          {record.document_path && (
            <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="ms-1.5">Download</span>
            </Button>
          )}

          {/* Send to Sign */}
          {record.document_path && !isSigned && (
            <Button size="sm" variant="outline" onClick={() => setSendOpen(true)} className="text-violet-700 border-violet-300 hover:bg-violet-50">
              <Send className="me-1.5 h-3.5 w-3.5" />
              {hasSentForSigning ? "Resend" : "Send to Sign"}
            </Button>
          )}

          {/* Mark Signed */}
          {hasSentForSigning && !isSigned && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" disabled={actioning}>
                  <PenLine className="me-1.5 h-3.5 w-3.5" /> Mark Signed
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark as signed?</AlertDialogTitle>
                  <AlertDialogDescription>This confirms the recipient has signed the contract and logs the event.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkSigned}>Mark Signed</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {effectiveStatus === "draft" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" disabled={actioning}>
                  <CheckCircle2 className="me-1.5 h-3.5 w-3.5" /> Activate
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Activate contract?</AlertDialogTitle>
                  <AlertDialogDescription>This marks the contract as active and logs the event.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleActivate}>Activate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {["active", "expiring_soon"].includes(effectiveStatus) && (
            <Button size="sm" variant="outline" onClick={() => setTerminateOpen(true)} disabled={actioning}
              className="text-destructive hover:text-destructive">
              <XCircle className="me-1.5 h-3.5 w-3.5" /> Terminate
            </Button>
          )}
          {["active", "expiring_soon", "expired"].includes(effectiveStatus) && (
            <Button size="sm" variant="outline" onClick={handleRenew} disabled={actioning}>
              <RefreshCw className="me-1.5 h-3.5 w-3.5" /> Renew
            </Button>
          )}
        </div>
      </div>

      {/* Party + date cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {(fp1Name || firstParty) && (
          <Card className={firstParty ? "cursor-pointer hover:border-primary/50" : ""} onClick={firstParty ? () => navigate(`/parties/${firstParty.id}`) : undefined}>
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> First Party
              </p>
              <p className="font-medium truncate">{fp1Name}</p>
              {fp1Ar && <p className="text-xs text-muted-foreground" dir="rtl">{fp1Ar}</p>}
            </CardContent>
          </Card>
        )}
        {(fp2Name || secondParty) && (
          <Card className={secondParty ? "cursor-pointer hover:border-primary/50" : ""} onClick={secondParty ? () => navigate(`/parties/${secondParty.id}`) : undefined}>
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <User className="h-3 w-3" /> Second Party
              </p>
              <p className="font-medium truncate">{fp2Name}</p>
              {fp2Ar && <p className="text-xs text-muted-foreground" dir="rtl">{fp2Ar}</p>}
            </CardContent>
          </Card>
        )}
        {empName && (
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Employer
              </p>
              <p className="font-medium truncate">{empName}</p>
              {empAr && <p className="text-xs text-muted-foreground" dir="rtl">{empAr}</p>}
            </CardContent>
          </Card>
        )}
        {record.start_date && (
          <Card><CardContent className="p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Start date</p>
            <p className="font-medium">{format(parseISO(record.start_date), "d MMM yyyy")}</p>
          </CardContent></Card>
        )}
        {record.end_date && (
          <Card><CardContent className="p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">End date</p>
            <p className="font-medium">{format(parseISO(record.end_date), "d MMM yyyy")}</p>
          </CardContent></Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {attachments.length > 0 && (
            <TabsTrigger value="attachments">
              Attachments
              <Badge variant="secondary" className="ms-1.5 text-[10px] px-1">{attachments.length}</Badge>
            </TabsTrigger>
          )}
          <TabsTrigger value="history">
            History
            <Badge variant="secondary" className="ms-1.5 text-[10px] px-1">{events.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Details tab — grouped field values */}
        <TabsContent value="details" className="mt-4 space-y-4">
          {fieldGroups.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No field values stored.</CardContent></Card>
          ) : fieldGroups.map(({ group, entries }) => (
            <Card key={group}>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{group}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                  {entries.map(([k, v]) => (
                    <div key={k} className="flex items-start gap-2 py-2 border-b last:border-0 sm:even:border-l sm:even:pl-6">
                      <span className="text-xs text-muted-foreground w-40 flex-shrink-0 pt-0.5 leading-tight">{humanizeKey(k)}</span>
                      <span className="text-sm font-medium break-words min-w-0 flex-1">
                        {isUrl(v) ? (
                          <a href={v} target="_blank" rel="noopener noreferrer"
                            className="text-primary underline hover:no-underline flex items-center gap-1">
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            Open link
                          </a>
                        ) : v ? String(v) : <span className="text-muted-foreground italic text-xs">—</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Attachments tab — employee documents */}
        {attachments.length > 0 && (
          <TabsContent value="attachments" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Employee Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((att) => (
                    <a
                      key={att.type}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
                        att.status === "verified" ? "border-green-300 bg-green-50/50" :
                        att.status === "expired" ? "border-red-300 bg-red-50/50" :
                        att.status === "rejected" ? "border-red-200 bg-red-50/30" :
                        "border-border"
                      }`}
                    >
                      <FileText className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        att.status === "verified" ? "text-green-600" :
                        att.status === "expired" ? "text-red-600" : "text-muted-foreground"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{att.label}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {att.status && (
                            <Badge variant="outline" className={`text-[10px] px-1 py-0 ${
                              att.status === "verified" ? "border-green-300 text-green-700" :
                              att.status === "expired" ? "border-red-300 text-red-700" :
                              att.status === "rejected" ? "border-red-200 text-red-600" :
                              "text-muted-foreground"
                            }`}>
                              {att.status}
                            </Badge>
                          )}
                          {att.expires && (
                            <span className="text-[10px] text-muted-foreground">Expires {att.expires}</span>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* History tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-5">
              <EventTimeline events={events} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes tab */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <Label>Add a note to this contract</Label>
              <Textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="e.g. Discussed renewal terms on call with client…"
                rows={4}
              />
              <Button onClick={handleSaveNote} disabled={savingNote || !noteText.trim()}>
                {savingNote && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                <Plus className="me-2 h-4 w-4" />
                Add note
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Terminate dialog */}
      <Dialog open={terminateOpen} onOpenChange={setTerminateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Terminate contract</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Termination date</Label>
              <Input type="date" value={terminateDate} onChange={e => setTerminateDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Reason (optional)</Label>
              <Textarea value={terminateReason} onChange={e => setTerminateReason(e.target.value)} placeholder="Reason for termination…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTerminateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={actioning}>
              {actioning && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Terminate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send to Sign dialog */}
      <Dialog open={sendOpen} onOpenChange={open => { setSendOpen(open); if (!open) setSignedUrl(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Send className="h-4 w-4 text-violet-600" /> Send for Signing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Recipient name</Label>
                <Input value={sendName} onChange={e => setSendName(e.target.value)} placeholder="Employee / client name" />
              </div>
              <div className="space-y-1.5">
                <Label>Recipient email</Label>
                <Input type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} placeholder="email@example.com" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Contract document link (7-day secure link)</Label>
              {!signedUrl ? (
                <Button variant="outline" className="w-full" onClick={handleGenerateLink} disabled={generatingLink || !record?.document_path}>
                  {generatingLink ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ExternalLink className="me-2 h-4 w-4" />}
                  {record?.document_path ? "Generate shareable link" : "No document attached"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Input value={signedUrl} readOnly className="text-xs font-mono" />
                  <Button size="sm" variant="outline" onClick={handleCopyLink}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Copy this link and share it via email, WhatsApp, or any channel. Then click "Log as sent" to record it.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSendOpen(false); setSignedUrl(null); }}>Cancel</Button>
            <Button onClick={handleLogSent} disabled={loggingSend || !sendEmail.trim()} className="bg-violet-700 hover:bg-violet-800 text-white">
              {loggingSend && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              Log as sent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
