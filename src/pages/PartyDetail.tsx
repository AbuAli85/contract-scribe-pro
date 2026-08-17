import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Building2, User, Mail, Phone, MapPin,
  Loader2, FileText, Trash2, Pencil, Plus, Save, X,
} from "lucide-react";
import type { Party } from "./Parties";
import {
  asContractStatus,
  computeStatus,
  statusLabel,
  STATUS_COLOR,
} from "@/lib/contractLifecycle";

interface ContractRecord {
  id: string;
  title: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notice_period_days: number | null;
  template_id: string | null;
}

export default function PartyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [party, setParty] = useState<Party | null>(null);
  const [contracts, setContracts] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Extra-fields editor state
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [savingExtra, setSavingExtra] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("parties")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      const p = data as Party;
      setParty(p);
      setExtraFields(p.extra_fields ?? {});

      const { data: records } = await supabase
        .from("contract_records")
        .select("id, title, status, start_date, end_date, notice_period_days, template_id")
        .or(`first_party_id.eq.${id},second_party_id.eq.${id}`)
        .order("created_at", { ascending: false });
      setContracts((records ?? []) as ContractRecord[]);
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Not found", variant: "destructive" });
      navigate("/parties");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!id) return;
    await supabase.from("parties").delete().eq("id", id);
    toast({ title: "Party deleted" });
    navigate("/parties");
  };

  const handleSaveExtra = async () => {
    if (!id) return;
    setSavingExtra(true);
    try {
      const { error } = await supabase
        .from("parties")
        .update({ extra_fields: extraFields, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Template fields saved" });
      setEditMode(false);
    } catch (e: unknown) {
      toast({ title: (e as Error).message, variant: "destructive" });
    } finally {
      setSavingExtra(false);
    }
  };

  const addExtraField = () => {
    const k = newKey.trim().replace(/\s+/g, "_").toLowerCase();
    if (!k) return;
    setExtraFields(prev => ({ ...prev, [k]: newVal.trim() }));
    setNewKey("");
    setNewVal("");
  };

  const removeExtraField = (k: string) =>
    setExtraFields(prev => { const n = { ...prev }; delete n[k]; return n; });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!party) return null;

  const isCompany = party.type === "company";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/parties">
          <ArrowLeft className="me-2 h-4 w-4" />
          Parties
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {isCompany
              ? <Building2 className="h-6 w-6 text-muted-foreground" />
              : <User className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{party.name_en}</h1>
            {party.name_ar && (
              <p className="text-muted-foreground" dir="rtl">{party.name_ar}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/parties/${id}/edit`} onClick={e => { e.preventDefault(); setEditMode(true); }}>
              <Pencil className="me-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="me-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {party.name_en}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the party record. Existing contract records that reference this party will keep their data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {party.email && (
          <Card><CardContent className="p-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{party.email}</span>
          </CardContent></Card>
        )}
        {party.phone && (
          <Card><CardContent className="p-3 flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{party.phone}</span>
          </CardContent></Card>
        )}
        {party.cr_number && (
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CR Number</p>
            <p className="font-medium">{party.cr_number}</p>
          </CardContent></Card>
        )}
        {party.id_number && (
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">ID / Passport</p>
            <p className="font-medium">{party.id_number}</p>
          </CardContent></Card>
        )}
        {party.nationality && (
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Nationality</p>
            <p className="font-medium">{party.nationality}</p>
          </CardContent></Card>
        )}
        {party.job_title_en && (
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Job Title</p>
            <p className="font-medium">{party.job_title_en}</p>
          </CardContent></Card>
        )}
        {(party.address_en || party.address_ar) && (
          <Card className="col-span-2"><CardContent className="p-3 flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              {party.address_en && <p>{party.address_en}</p>}
              {party.address_ar && <p dir="rtl" className="text-muted-foreground">{party.address_ar}</p>}
            </div>
          </CardContent></Card>
        )}
      </div>

      <Tabs defaultValue="fields">
        <TabsList>
          <TabsTrigger value="fields">Template Fields</TabsTrigger>
          <TabsTrigger value="contracts">
            Contracts
            <Badge variant="secondary" className="ms-1.5 text-[10px] px-1">{contracts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Template fields tab ── */}
        <TabsContent value="fields" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Template field values</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    These are auto-filled when this party is selected in a contract wizard.
                    Keys must match the token names in your templates (e.g. <code className="bg-muted px-1 rounded">first_party_name_en</code>).
                  </p>
                </div>
                {!editMode && (
                  <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
                    <Pencil className="me-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(extraFields).length === 0 && !editMode && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No template fields saved yet. Click Edit to add key→value pairs.
                </p>
              )}

              {/* Existing fields */}
              {Object.entries(extraFields).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded w-48 flex-shrink-0 truncate">{k}</code>
                  {editMode ? (
                    <>
                      <Input
                        value={v}
                        onChange={e => setExtraFields(prev => ({ ...prev, [k]: e.target.value }))}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => removeExtraField(k)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-sm">{v || <span className="text-muted-foreground italic">empty</span>}</span>
                  )}
                </div>
              ))}

              {/* Add new field */}
              {editMode && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="token_key"
                      value={newKey}
                      onChange={e => setNewKey(e.target.value)}
                      className="w-48 h-8 text-sm font-mono"
                      onKeyDown={e => e.key === "Enter" && addExtraField()}
                    />
                    <Input
                      placeholder="value"
                      value={newVal}
                      onChange={e => setNewVal(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      onKeyDown={e => e.key === "Enter" && addExtraField()}
                    />
                    <Button size="sm" variant="outline" onClick={addExtraField} disabled={!newKey.trim()}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => { setEditMode(false); setExtraFields(party.extra_fields ?? {}); }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveExtra} disabled={savingExtra}>
                      {savingExtra && <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />}
                      <Save className="me-1.5 h-3.5 w-3.5" />
                      Save fields
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Contracts tab ── */}
        <TabsContent value="contracts" className="mt-4">
          {contracts.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No contracts linked to this party yet.
                <div className="mt-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/records/new">Create contract</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {contracts.map(c => {
                const status = computeStatus({ ...c, status: asContractStatus(c.status) });
                return (
                  <Card key={c.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/records/${c.id}`)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.start_date} {c.end_date ? `→ ${c.end_date}` : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLOR[status]}`}>
                        {statusLabel(status)}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
