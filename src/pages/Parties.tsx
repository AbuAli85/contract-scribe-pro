import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Users, Plus, Search, Building2, User, Mail, Phone,
  Loader2, FileText, ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────
export interface Party {
  id: string;
  user_id: string;
  type: "company" | "person";
  role: "employer" | "client" | "employee" | "contractor" | "supplier" | "other";
  name_en: string;
  name_ar: string;
  email: string | null;
  phone: string | null;
  address_en: string | null;
  address_ar: string | null;
  cr_number: string | null;
  tax_id: string | null;
  id_number: string | null;
  nationality: string | null;
  job_title_en: string | null;
  job_title_ar: string | null;
  extra_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
}

type PartyRole = Party["role"] | "all";

const ROLE_LABELS: Record<Party["role"], string> = {
  employer: "Employer",
  client: "Client",
  employee: "Employee",
  contractor: "Contractor",
  supplier: "Supplier",
  other: "Other",
};

const ROLE_COLORS: Record<Party["role"], string> = {
  employer: "bg-blue-100 text-blue-800 border-blue-200",
  client: "bg-purple-100 text-purple-800 border-purple-200",
  employee: "bg-green-100 text-green-800 border-green-200",
  contractor: "bg-amber-100 text-amber-800 border-amber-200",
  supplier: "bg-orange-100 text-orange-800 border-orange-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

// ── PartyFormDialog ────────────────────────────────────────────────────
interface FormState {
  type: "company" | "person";
  role: Party["role"];
  name_en: string;
  name_ar: string;
  email: string;
  phone: string;
  address_en: string;
  address_ar: string;
  cr_number: string;
  tax_id: string;
  id_number: string;
  nationality: string;
  job_title_en: string;
  job_title_ar: string;
}

const EMPTY_FORM: FormState = {
  type: "company", role: "employer",
  name_en: "", name_ar: "", email: "", phone: "",
  address_en: "", address_ar: "", cr_number: "", tax_id: "",
  id_number: "", nationality: "", job_title_en: "", job_title_ar: "",
};

function PartyFormDialog({
  open, onClose, onSaved, editing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (p: Party) => void;
  editing?: Party;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        type: editing.type,
        role: editing.role,
        name_en: editing.name_en,
        name_ar: editing.name_ar,
        email: editing.email ?? "",
        phone: editing.phone ?? "",
        address_en: editing.address_en ?? "",
        address_ar: editing.address_ar ?? "",
        cr_number: editing.cr_number ?? "",
        tax_id: editing.tax_id ?? "",
        id_number: editing.id_number ?? "",
        nationality: editing.nationality ?? "",
        job_title_en: editing.job_title_en ?? "",
        job_title_ar: editing.job_title_ar ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, open]);

  const set = (k: keyof FormState, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.name_en.trim()) {
      toast({ title: "Name (English) is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        type: form.type,
        role: form.role,
        name_en: form.name_en.trim(),
        name_ar: form.name_ar.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address_en: form.address_en.trim() || null,
        address_ar: form.address_ar.trim() || null,
        cr_number: form.cr_number.trim() || null,
        tax_id: form.tax_id.trim() || null,
        id_number: form.id_number.trim() || null,
        nationality: form.nationality.trim() || null,
        job_title_en: form.job_title_en.trim() || null,
        job_title_ar: form.job_title_ar.trim() || null,
      };

      let row: Party;
      if (editing) {
        const { data, error } = await supabase
          .from("parties")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editing.id)
          .select()
          .single();
        if (error) throw error;
        row = data as Party;
      } else {
        const { data, error } = await supabase
          .from("parties")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        row = data as Party;
      }
      toast({ title: editing ? "Party updated" : "Party added" });
      onSaved(row);
      onClose();
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isCompany = form.type === "company";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit party" : "Add party"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="person">Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Name (English) *</Label>
              <Input value={form.name_en} onChange={e => set("name_en", e.target.value)} placeholder="e.g. Falcon Eye Group" />
            </div>
            <div className="space-y-1.5">
              <Label>Name (Arabic)</Label>
              <Input dir="rtl" value={form.name_ar} onChange={e => set("name_ar", e.target.value)} placeholder="مثال: مجموعة عين الصقر" />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>

          {/* Company fields */}
          {isCompany && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>CR Number</Label>
                <Input value={form.cr_number} onChange={e => set("cr_number", e.target.value)} placeholder="1234567" />
              </div>
              <div className="space-y-1.5">
                <Label>Tax ID / VAT</Label>
                <Input value={form.tax_id} onChange={e => set("tax_id", e.target.value)} />
              </div>
            </div>
          )}

          {/* Person fields */}
          {!isCompany && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>ID / Passport No.</Label>
                  <Input value={form.id_number} onChange={e => set("id_number", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nationality</Label>
                  <Input value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="Omani" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Job Title (EN)</Label>
                  <Input value={form.job_title_en} onChange={e => set("job_title_en", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Job Title (AR)</Label>
                  <Input dir="rtl" value={form.job_title_ar} onChange={e => set("job_title_ar", e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Address */}
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Address (EN)</Label>
              <Input value={form.address_en} onChange={e => set("address_en", e.target.value)} placeholder="Muscat, Oman" />
            </div>
            <div className="space-y-1.5">
              <Label>Address (AR)</Label>
              <Input dir="rtl" value={form.address_ar} onChange={e => set("address_ar", e.target.value)} placeholder="مسقط، عُمان" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {editing ? "Save changes" : "Add party"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── PartyCard ──────────────────────────────────────────────────────────
function PartyCard({ party, contractCount, onClick }: {
  party: Party;
  contractCount: number;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {party.type === "company"
              ? <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              : <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
            <span className="font-semibold text-sm truncate">{party.name_en}</span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] flex-shrink-0 ${ROLE_COLORS[party.role]}`}
          >
            {ROLE_LABELS[party.role]}
          </Badge>
        </div>
        {party.name_ar && (
          <p className="text-xs text-muted-foreground text-right mb-2 truncate" dir="rtl">
            {party.name_ar}
          </p>
        )}
        <div className="space-y-1 mt-2">
          {party.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{party.email}</span>
            </div>
          )}
          {party.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span>{party.phone}</span>
            </div>
          )}
          {party.cr_number && (
            <div className="text-xs text-muted-foreground">CR: {party.cr_number}</div>
          )}
          {party.id_number && (
            <div className="text-xs text-muted-foreground">ID: {party.id_number}</div>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{contractCount} contract{contractCount !== 1 ? "s" : ""}</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Parties page ───────────────────────────────────────────────────────
export default function Parties() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parties, setParties] = useState<Party[]>([]);
  const [contractCounts, setContractCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<PartyRole>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadParties = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("parties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParties((data ?? []) as Party[]);

      // Contract counts: count rows in contract_records where first_party_id or second_party_id matches
      if (data && data.length > 0) {
        const ids = data.map((p: Party) => p.id);
        const { data: records } = await supabase
          .from("contract_records")
          .select("first_party_id, second_party_id")
          .eq("user_id", user.id);

        const counts: Record<string, number> = {};
        for (const id of ids) counts[id] = 0;
        for (const r of (records ?? []) as { first_party_id: string | null; second_party_id: string | null }[]) {
          if (r.first_party_id && r.first_party_id in counts) counts[r.first_party_id]++;
          if (r.second_party_id && r.second_party_id in counts) counts[r.second_party_id]++;
        }
        setContractCounts(counts);
      }
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadParties(); }, [loadParties]);

  const filtered = parties.filter(p => {
    const matchRole = roleFilter === "all" || p.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name_en.toLowerCase().includes(q) ||
      p.name_ar.includes(q) ||
      (p.email ?? "").toLowerCase().includes(q) ||
      (p.cr_number ?? "").toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const TABS: { value: PartyRole; label: string }[] = [
    { value: "all", label: "All" },
    { value: "employer", label: "Employers" },
    { value: "client", label: "Clients" },
    { value: "employee", label: "Employees" },
    { value: "contractor", label: "Contractors" },
    { value: "supplier", label: "Suppliers" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Parties
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Companies and individuals that appear in your contracts
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="me-2 h-4 w-4" />
          Add party
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, CR number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={roleFilter} onValueChange={v => setRoleFilter(v as PartyRole)}>
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
              {t.value !== "all" && (
                <Badge variant="secondary" className="ms-1.5 text-[10px] px-1">
                  {parties.filter(p => p.role === t.value).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              {search || roleFilter !== "all" ? "No parties match your filters" : "No parties yet"}
            </p>
            {!search && roleFilter === "all" && (
              <p className="text-sm text-muted-foreground mt-1">
                Add companies and people to reuse their details in contracts.
              </p>
            )}
          </div>
          {!search && roleFilter === "all" && (
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="me-2 h-4 w-4" />
              Add your first party
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PartyCard
              key={p.id}
              party={p}
              contractCount={contractCounts[p.id] ?? 0}
              onClick={() => navigate(`/parties/${p.id}`)}
            />
          ))}
        </div>
      )}

      <PartyFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={newParty => setParties(prev => [newParty, ...prev])}
      />
    </div>
  );
}
