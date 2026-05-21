import { useState, useEffect, useCallback } from "react";
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
  Building2, User, Calendar, FileText, Clock, Plus, Pencil,
} from "lucide-react";
import { mergeTemplate, normalizeValuesForMerge, type PlaceholderField } from "@/lib/templateEngine";
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
            <p className="text-[10px] text-muted-foreground mt-1">
              {format(parseISO(ev.created_at), "d MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
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

  // Terminate dialog state
  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateReason, setTerminateReason] = useState("");
  const [terminateDate, setTerminateDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Note dialog state
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Downloading
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

      // Load parties
      const r = rec as ContractRecord;
      if (r.first_party_id) {
        const { data: fp } = await supabase.from("parties").select("*").eq("id", r.first_party_id).single();
        setFirstParty(fp as Party ?? null);
      } else setFirstParty(null);
      if (r.second_party_id) {
        const { data: sp } = await supabase.from("parties").select("*").eq("id", r.second_party_id).single();
        setSecondParty(sp as Party ?? null);
      } else setSecondParty(null);

      // Load events
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

  // ── Log event helper ──
  const logEvent = async (type: string, note: string, data?: Record<string, unknown>) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("contract_events").insert({ contract_id: id, user_id: user?.id ?? null, type, note, data: data ?? null });
  };

  // ── Lifecycle actions ──
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
      // Mark old record as renewed
      await supabase.from("contract_records").update({ status: "renewed", updated_at: new Date().toISOString() }).eq("id", id);
      await logEvent("renewed", "Contract renewed — new record created");
      // Create new record inheriting most fields
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
      await supabase.from("contract_events").insert({ contract_id: newRec.id, user_id: user.id, type: "created", note: `Renewed from contract "${record.title}"` });
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
      a.href = url;
      a.download = `${record.title}.docx`;
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!record) return null;

  const effectiveStatus = computeStatus(record);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/records"><ArrowLeft className="me-2 h-4 w-4" />Contracts</Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{record.title}</h1>
            <Badge variant="outline" className={`text-xs ${STATUS_COLOR[effectiveStatus]}`}>
              {STATUS_LABEL[effectiveStatus]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {format(parseISO(record.created_at), "d MMM yyyy")}
            {record.parent_id && (
              <> &nbsp;·&nbsp; <Link to={`/records/${record.parent_id}`} className="underline">View original</Link></>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap justify-end">
          {record.document_path && (
            <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span className="ms-1.5">Download</span>
            </Button>
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

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {firstParty && (
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/parties/${firstParty.id}`)}>
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> First Party
              </p>
              <p className="font-medium truncate">{firstParty.name_en}</p>
              {firstParty.name_ar && <p className="text-xs text-muted-foreground" dir="rtl">{firstParty.name_ar}</p>}
            </CardContent>
          </Card>
        )}
        {secondParty && (
          <Card className="cursor-pointer hover:border-primary/50" onClick={() => navigate(`/parties/${secondParty.id}`)}>
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                <User className="h-3 w-3" /> Second Party
              </p>
              <p className="font-medium truncate">{secondParty.name_en}</p>
              {secondParty.name_ar && <p className="text-xs text-muted-foreground" dir="rtl">{secondParty.name_ar}</p>}
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
          <TabsTrigger value="history">
            History
            <Badge variant="secondary" className="ms-1.5 text-[10px] px-1">{events.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notes">Add note</TabsTrigger>
        </TabsList>

        {/* Details tab */}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Field values</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(record.field_values ?? {}).length === 0 ? (
                <p className="text-sm text-muted-foreground">No field values stored.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(record.field_values ?? {}).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 text-sm py-1.5 border-b last:border-0">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded w-48 flex-shrink-0 truncate">{k}</code>
                      <span className="text-foreground break-words min-w-0">{v || <span className="text-muted-foreground italic">—</span>}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
          <DialogHeader>
            <DialogTitle>Terminate contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Termination date</Label>
              <Input type="date" value={terminateDate} onChange={e => setTerminateDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Reason (optional)</Label>
              <Textarea
                value={terminateReason}
                onChange={e => setTerminateReason(e.target.value)}
                placeholder="Reason for termination…"
                rows={3}
              />
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
    </div>
  );
}
