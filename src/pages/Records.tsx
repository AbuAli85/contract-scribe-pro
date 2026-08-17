import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  computeStatus,
  daysUntilExpiry,
  statusLabel,
  STATUS_COLOR,
  type ContractRecord,
  type ContractStatus,
} from "@/lib/contractLifecycle";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Plus, Search, Loader2, AlertTriangle, Clock,
  Building2, User, Calendar, ChevronRight,
} from "lucide-react";

type StatusFilter = ContractStatus | "all";

// Tab labels are deliberately shorter than the badge labels in
// contractLifecycle ("Expiring" vs "Expiring soon") — a tab strip has less
// room than a badge. The values are the contract with the ?status= param.
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
  { value: "renewed", label: "Renewed" },
];

/** Narrows a ?status= param; anything unrecognised falls back to "all". */
function asStatusFilter(value: string | null): StatusFilter {
  return STATUS_TABS.some(t => t.value === value)
    ? (value as StatusFilter)
    : "all";
}

// ── Record card ────────────────────────────────────────────────────────
function RecordCard({ record, onClick }: { record: ContractRecord; onClick: () => void }) {
  const effectiveStatus = computeStatus(record);
  const daysLeft = daysUntilExpiry(record);

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="font-semibold text-sm leading-tight">{record.title}</p>
          <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${STATUS_COLOR[effectiveStatus]}`}>
            {statusLabel(effectiveStatus)}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {record.first_party && (
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{record.first_party.name_en}</span>
            </div>
          )}
          {record.second_party && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{record.second_party.name_en}</span>
            </div>
          )}
          {(record.start_date || record.end_date) && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>
                {record.start_date ? format(parseISO(record.start_date), "d MMM yyyy") : "—"}
                {" → "}
                {record.end_date ? format(parseISO(record.end_date), "d MMM yyyy") : "open-ended"}
              </span>
            </div>
          )}
        </div>

        {effectiveStatus === "expiring_soon" && daysLeft !== null && daysLeft >= 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
            <Clock className="h-3 w-3" />
            Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
          </div>
        )}

        <div className="mt-3 pt-2 border-t flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {format(parseISO(record.created_at), "d MMM yyyy")}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Records page ───────────────────────────────────────────────────────
export default function Records() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [records, setRecords] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Rule B2 — the Home cards deep-link here as /records?status=expiring_soon,
  // so the filter has to arrive already applied. Kept in the URL so the
  // filtered view stays shareable and survives a back/forward.
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = asStatusFilter(searchParams.get("status"));
  const setStatusFilter = (next: StatusFilter) => {
    setSearchParams(next === "all" ? {} : { status: next }, { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("contract_records")
        .select(`
          *,
          first_party:parties!contract_records_first_party_id_fkey(name_en, type),
          second_party:parties!contract_records_second_party_id_fkey(name_en, type)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRecords((data ?? []) as ContractRecord[]);
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Enrich with computed status
  const enriched = records.map(r => ({ ...r, status: computeStatus(r) }));

  const expiring = enriched.filter(r => r.status === "expiring_soon");
  const expired = enriched.filter(r => r.status === "expired");

  const filtered = enriched.filter(r => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.title.toLowerCase().includes(q) ||
      (r.first_party?.name_en ?? "").toLowerCase().includes(q) ||
      (r.second_party?.name_en ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Contracts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All your contract records in one place
          </p>
        </div>
        <Button asChild>
          <Link to="/records/new">
            <Plus className="me-2 h-4 w-4" />
            New contract
          </Link>
        </Button>
      </div>

      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>{expiring.length}</strong> contract{expiring.length > 1 ? "s" : ""} expiring within 30 days.{" "}
            <button className="underline underline-offset-2 font-medium" onClick={() => setStatusFilter("expiring_soon")}>
              View them
            </button>
          </span>
        </div>
      )}
      {expired.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>{expired.length}</strong> contract{expired.length > 1 ? "s" : ""} have expired.{" "}
            <button className="underline underline-offset-2 font-medium" onClick={() => setStatusFilter("expired")}>
              Review them
            </button>
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or party name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status tabs */}
      <Tabs value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_TABS.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
              {t.value !== "all" && (
                <Badge variant="secondary" className="ms-1.5 text-[10px] px-1">
                  {enriched.filter(r => r.status === t.value).length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <FileText className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              {search || statusFilter !== "all" ? "No contracts match your filters" : "No contracts yet"}
            </p>
            {!search && statusFilter === "all" && (
              <p className="text-sm text-muted-foreground mt-1">
                Create your first contract using any template.
              </p>
            )}
          </div>
          {!search && statusFilter === "all" && (
            <Button variant="outline" asChild>
              <Link to="/records/new">
                <Plus className="me-2 h-4 w-4" />
                New contract
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => (
            <RecordCard
              key={r.id}
              record={r}
              onClick={() => navigate(`/records/${r.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
