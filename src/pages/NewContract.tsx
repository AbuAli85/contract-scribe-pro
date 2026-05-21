import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft, ArrowRight, Check, ChevronsUpDown, Upload, Wand2,
  Building2, User, Loader2, FileText, CheckCircle2, Download, AlertCircle,
} from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { getTemplateContent, hasTemplateContent } from "@/lib/templateContent";
import {
  scanTemplateWithAi, mergeTemplate, normalizeValuesForMerge,
  type PlaceholderField, type ScanResult,
} from "@/lib/templateEngine";
import type { Party } from "./Parties";

// ── SmartPro Hub API types ─────────────────────────────────────────────
interface SmartProEmployer {
  id: number;
  nameEn: string;
  nameAr: string | null;
  crNumber: string | null;
  phone: string | null;
  email: string | null;
}

interface SmartProCrmClient {
  kind: "crm_client";
  crmClientId: number;
  displayNameEn: string;
  displayNameAr: string | null;
  crNumber: string | null;
  vatNumber: string | null;
  phone: string | null;
  email: string | null;
  clientType: string | null;
  industry: string | null;
}

interface SmartProPlatformClient {
  kind: "platform";
  companyId: number;
  displayNameEn: string;
  displayNameAr: string | null;
  registrationNumber: string | null;
}

interface SmartProSupplier {
  kind: "external_party";
  partyId: string;
  displayNameEn: string;
  displayNameAr: string | null;
  legalNameEn: string | null;
  legalNameAr: string | null;
  registrationNumber: string | null;
  phone: string | null;
  email: string | null;
}

type SmartProClient = SmartProCrmClient | SmartProPlatformClient;

interface SmartProEmployeeDocument {
  type: "passport" | "civil_id" | "visa" | "resident_card" | "labour_card" | "employment_contract" | "photo" | "other" | "mol_work_permit_certificate" | "medical_certificate";
  fileUrl: string;
  fileName: string;
  issuedAt: string | null;
  expiresAt: string | null;
  status: "pending" | "verified" | "rejected" | "expired";
}

interface SmartProEmployee {
  id: number;
  employeeNumber: string | null;
  firstName: string;
  lastName: string;
  firstNameAr: string | null;
  lastNameAr: string | null;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  visaNumber: string | null;
  workPermitNumber: string | null;
  jobTitleEn: string | null;
  jobTitleAr: string | null;
  department: string | null;
  position: string | null;
  contractType: string | null;
  hireDate: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  salary: number | null;
  basicSalary: number | null;
  totalSalary: number | null;
  housingAllowance: number | null;
  transportAllowance: number | null;
  currency: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  ibanNumber: string | null;
  documents: SmartProEmployeeDocument[];
}

interface SmartProParties {
  employer: SmartProEmployer;
  crmClients: SmartProCrmClient[];
  platformClients: SmartProPlatformClient[];
  suppliers: SmartProSupplier[];
  employees: SmartProEmployee[];
}

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

// ── Party combobox (Supabase parties) ──────────────────────────────────
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

// ── SmartPro client combobox ───────────────────────────────────────────
function SmartProClientCombobox({
  clients, value, onChange,
}: {
  clients: SmartProClient[];
  value: string | null;
  onChange: (key: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? clients.find(c => clientKey(c) === value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10 text-left font-normal">
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{selected.displayNameEn}</span>
              {selected.displayNameAr && (
                <span className="text-muted-foreground text-xs" dir="rtl">{selected.displayNameAr}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Select client from SmartPro…</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ms-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search clients…" />
          <CommandList>
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="__none__" onSelect={() => { onChange(null); setOpen(false); }}>
                <span className="text-muted-foreground">— None —</span>
              </CommandItem>
              {clients.map(c => {
                const key = clientKey(c);
                return (
                  <CommandItem key={key} value={c.displayNameEn} onSelect={() => { onChange(key); setOpen(false); }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{c.displayNameEn}</span>
                      {c.displayNameAr && (
                        <span className="text-muted-foreground text-xs shrink-0" dir="rtl">{c.displayNameAr}</span>
                      )}
                    </div>
                    {value === key && <Check className="ms-auto h-3.5 w-3.5 shrink-0" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── SmartPro employee combobox ─────────────────────────────────────────
function SmartProEmployeeCombobox({
  employees, value, onChange,
}: {
  employees: SmartProEmployee[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value != null ? employees.find(e => e.id === value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10 text-left font-normal">
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{selected.firstName} {selected.lastName}</span>
              {(selected.firstNameAr || selected.lastNameAr) && (
                <span className="text-muted-foreground text-xs" dir="rtl">
                  {[selected.firstNameAr, selected.lastNameAr].filter(Boolean).join(" ")}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Select employee from SmartPro…</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ms-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search employees…" />
          <CommandList>
            <CommandEmpty>No employees found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="__none__" onSelect={() => { onChange(null); setOpen(false); }}>
                <span className="text-muted-foreground">— None —</span>
              </CommandItem>
              {employees.map(e => (
                <CommandItem
                  key={e.id}
                  value={`${e.firstName} ${e.lastName}`}
                  onSelect={() => { onChange(e.id); setOpen(false); }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate">{e.firstName} {e.lastName}</span>
                    {(e.firstNameAr || e.lastNameAr) && (
                      <span className="text-muted-foreground text-xs shrink-0" dir="rtl">
                        {[e.firstNameAr, e.lastNameAr].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </div>
                  {value === e.id && <Check className="ms-auto h-3.5 w-3.5 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── SmartPro supplier combobox ─────────────────────────────────────────
function SmartProSupplierCombobox({
  suppliers, value, onChange,
}: {
  suppliers: SmartProSupplier[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? suppliers.find(s => s.partyId === value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10 text-left font-normal">
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">{selected.displayNameEn}</span>
              {selected.displayNameAr && (
                <span className="text-muted-foreground text-xs shrink-0" dir="rtl">{selected.displayNameAr}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Select supplier…</span>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0 ms-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search suppliers…" />
          <CommandList>
            <CommandEmpty>No suppliers found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="__none__" onSelect={() => { onChange(null); setOpen(false); }}>
                <span className="text-muted-foreground">— None —</span>
              </CommandItem>
              {suppliers.map(s => (
                <CommandItem
                  key={s.partyId}
                  value={s.displayNameEn}
                  onSelect={() => { onChange(s.partyId); setOpen(false); }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate">{s.displayNameEn}</span>
                    {s.displayNameAr && (
                      <span className="text-muted-foreground text-xs shrink-0" dir="rtl">{s.displayNameAr}</span>
                    )}
                  </div>
                  {value === s.partyId && <Check className="ms-auto h-3.5 w-3.5 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── FieldInput ─────────────────────────────────────────────────────────
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
function clientKey(c: SmartProClient): string {
  if (c.kind === "platform") return `platform:${c.companyId}`;
  if (c.kind === "crm_client") return `crm:${c.crmClientId}`;
  return `other:${c.displayNameEn}`;
}

const CRITICAL_DOC_TYPES = new Set(["passport", "civil_id", "visa", "resident_card", "labour_card", "mol_work_permit_certificate"]);

function getDocExpiryWarnings(docs: SmartProEmployeeDocument[]): { expired: string[]; expiringSoon: string[] } {
  const today = new Date();
  const in30 = new Date(today); in30.setDate(today.getDate() + 30);
  const expired: string[] = [];
  const expiringSoon: string[] = [];
  for (const doc of docs) {
    if (!CRITICAL_DOC_TYPES.has(doc.type) || !doc.expiresAt) continue;
    const exp = new Date(doc.expiresAt);
    const label = DOC_TYPE_LABEL[doc.type] ?? doc.type;
    if (exp < today) expired.push(label);
    else if (exp <= in30) expiringSoon.push(`${label} (${doc.expiresAt})`);
  }
  return { expired, expiringSoon };
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

function partyToFieldValues(party: Party): Record<string, string> {
  const out: Record<string, string> = { ...party.extra_fields };
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
    if (key in partyVals && partyVals[key]) { next[key] = partyVals[key]; continue; }
    const bare = key.startsWith(prefix + "_") ? key.slice(prefix.length + 1) : null;
    if (bare && bare in partyVals && partyVals[bare]) { next[key] = partyVals[bare]; }
  }
  return next;
}

function smartproClientToFieldValues(c: SmartProClient): Record<string, string> {
  const base: Record<string, string> = {
    name_en: c.displayNameEn,
    name: c.displayNameEn,
    name_ar: c.displayNameAr ?? "",
  };
  if (c.kind === "crm_client") {
    base.cr_number = c.crNumber ?? "";
    base.registration_number = c.crNumber ?? "";
    base.vat_number = c.vatNumber ?? "";
    base.tax_id = c.vatNumber ?? "";
    base.phone = c.phone ?? "";
    base.email = c.email ?? "";
    base.client_type = c.clientType ?? "";
    base.industry = c.industry ?? "";
  } else if (c.kind === "platform") {
    base.registration_number = c.registrationNumber ?? "";
    base.cr_number = c.registrationNumber ?? "";
  }
  return base;
}

function smartproEmployerToFieldValues(e: SmartProEmployer): Record<string, string> {
  return {
    name_en: e.nameEn,
    name: e.nameEn,
    name_ar: e.nameAr ?? "",
    cr_number: e.crNumber ?? "",
    registration_number: e.crNumber ?? "",
    phone: e.phone ?? "",
    email: e.email ?? "",
  };
}

function smartproEmployeeToFieldValues(e: SmartProEmployee): Record<string, string> {
  const fullNameEn = [e.firstName, e.lastName].filter(Boolean).join(" ");
  const fullNameAr = [e.firstNameAr, e.lastNameAr].filter(Boolean).join(" ");
  return {
    name_en: fullNameEn,
    name: fullNameEn,
    name_ar: fullNameAr,
    first_name: e.firstName,
    last_name: e.lastName,
    first_name_ar: e.firstNameAr ?? "",
    last_name_ar: e.lastNameAr ?? "",
    employee_number: e.employeeNumber ?? "",
    email: e.email ?? "",
    phone: e.phone ?? "",
    id_number: e.nationalId ?? "",
    national_id: e.nationalId ?? "",
    civil_id: e.nationalId ?? "",
    passport_number: e.passportNumber ?? "",
    visa_number: e.visaNumber ?? "",
    work_permit_number: e.workPermitNumber ?? "",
    nationality: e.nationality ?? "",
    job_title_en: e.jobTitleEn ?? "",
    job_title: e.jobTitleEn ?? "",
    job_title_ar: e.jobTitleAr ?? "",
    department: e.department ?? "",
    position: e.position ?? "",
    contract_type: e.contractType ?? "",
    hire_date: e.hireDate ?? "",
    date_of_birth: e.dateOfBirth ?? "",
    gender: e.gender ?? "",
    salary: e.salary != null ? String(e.salary) : "",
    basic_salary: e.basicSalary != null ? String(e.basicSalary) : "",
    total_salary: e.totalSalary != null ? String(e.totalSalary) : "",
    housing_allowance: e.housingAllowance != null ? String(e.housingAllowance) : "",
    transport_allowance: e.transportAllowance != null ? String(e.transportAllowance) : "",
    currency: e.currency ?? "",
    bank_name: e.bankName ?? "",
    bank_account_number: e.bankAccountNumber ?? "",
    iban: e.ibanNumber ?? "",
    iban_number: e.ibanNumber ?? "",
  };
}

function smartproSupplierToFieldValues(s: SmartProSupplier): Record<string, string> {
  return {
    name_en: s.legalNameEn ?? s.displayNameEn,
    name: s.legalNameEn ?? s.displayNameEn,
    name_ar: s.legalNameAr ?? s.displayNameAr ?? "",
    display_name_en: s.displayNameEn,
    display_name_ar: s.displayNameAr ?? "",
    registration_number: s.registrationNumber ?? "",
    cr_number: s.registrationNumber ?? "",
    phone: s.phone ?? "",
    email: s.email ?? "",
  };
}

// ── Main page ──────────────────────────────────────────────────────────
export default function NewContract() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const prefillApplied = useRef(false);

  const isSmartpro = searchParams.get("source") === "smartpro";
  const hubUrl = searchParams.get("hub_url") ?? "";
  const companyId = searchParams.get("company_id") ?? "";

  // Step 1 — template
  const [templateSource, setTemplateSource] = useState<"catalog" | "upload">("catalog");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);

  // Scanned fields
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [templateTitle, setTemplateTitle] = useState("");

  // Step 2 — Supabase parties (used when not in smartpro mode)
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [firstPartyId, setFirstPartyId] = useState<string | null>(null);
  const [secondPartyId, setSecondPartyId] = useState<string | null>(null);

  // Step 2 — SmartPro Hub parties (used when source=smartpro)
  const [smartproData, setSmartproData] = useState<SmartProParties | null>(null);
  const [smartproLoading, setSmartproLoading] = useState(false);
  const [smartproError, setSmartproError] = useState<string | null>(null);
  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  // "none" | "employee" | "supplier"
  const [secondPartyRole, setSecondPartyRole] = useState<"none" | "employee" | "supplier">("employee");

  // Step 3 — fields
  const [values, setValues] = useState<Record<string, string>>({});
  const [seededKeys, setSeededKeys] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contractTitle, setContractTitle] = useState("");

  // Step 4 — generating
  const [generating, setGenerating] = useState(false);

  // ── Draft auto-save ────────────────────────────────────────────────
  const DRAFT_KEY = `csp_draft_${companyId || "local"}`;
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [hasDraft, setHasDraft] = useState(() => {
    try { return !!localStorage.getItem(`csp_draft_${companyId || "local"}`); } catch { return false; }
  });

  // Load on mount
  useEffect(() => {
    if (isSmartpro && hubUrl && companyId && !prefillApplied.current) {
      prefillApplied.current = true;
      setSmartproLoading(true);
      const apiKey = (import.meta.env.VITE_SMARTPRO_API_KEY as string | undefined) ?? "";
      fetch(`${hubUrl}/api/contract-scribe/parties?companyId=${companyId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
        .then(async res => {
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`SmartPro API error ${res.status}${text ? `: ${text}` : ""}`);
          }
          return res.json() as Promise<SmartProParties>;
        })
        .then(data => {
          setSmartproData(data);
          setSmartproLoading(false);
        })
        .catch(err => {
          console.error("[contract-scribe] SmartPro fetch failed", err);
          setSmartproError((err as Error).message ?? "Failed to load data from SmartPro");
          setSmartproLoading(false);
        });
    } else if (!isSmartpro) {
      // Load Supabase parties for the normal (non-SmartPro) flow
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (!user) return;
        const { data } = await supabase
          .from("parties")
          .select("*")
          .eq("user_id", user.id)
          .order("name_en");
        setAllParties((data ?? []) as Party[]);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draft: auto-save on state changes ────────────────────────────
  useEffect(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          step, templateSource, selectedTemplateId, templateTitle,
          contractTitle, scan, values, seededKeys: [...seededKeys],
          startDate, endDate, firstPartyId, secondPartyId,
          selectedClientKey, selectedEmployeeId,
        }));
        setDraftSavedAt(Date.now());
      } catch {}
    }, 1500);
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, templateSource, selectedTemplateId, templateTitle, contractTitle,
      scan, values, seededKeys, startDate, endDate,
      firstPartyId, secondPartyId, selectedClientKey, selectedEmployeeId]);

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      setStep(d.step ?? 0);
      setTemplateSource(d.templateSource ?? "catalog");
      setSelectedTemplateId(d.selectedTemplateId ?? null);
      setTemplateTitle(d.templateTitle ?? "");
      setContractTitle(d.contractTitle ?? "");
      setScan(d.scan ?? null);
      setValues(d.values ?? {});
      setSeededKeys(new Set(d.seededKeys ?? []));
      setStartDate(d.startDate ?? "");
      setEndDate(d.endDate ?? "");
      setFirstPartyId(d.firstPartyId ?? null);
      setSecondPartyId(d.secondPartyId ?? null);
      setSelectedClientKey(d.selectedClientKey ?? null);
      setSelectedEmployeeId(d.selectedEmployeeId ?? null);
    } catch {}
    setHasDraft(false);
  }

  function dismissDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setHasDraft(false);
  }

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

    if (isSmartpro && smartproData) {
      // First Party — Client (CRM or platform)
      const allClients: SmartProClient[] = [...(smartproData.crmClients ?? []), ...(smartproData.platformClients ?? [])];
      const client = selectedClientKey
        ? allClients.find(c => clientKey(c) === selectedClientKey) ?? null
        : null;
      if (client) {
        const cVals = smartproClientToFieldValues(client);
        const before = next;
        next = applyPartyToFields(cVals, "first_party", keys, next);
        next = applyPartyToFields(cVals, "client", keys, next);
        next = applyPartyToFields(cVals, "party_1", keys, next);
        next = applyPartyToFields(cVals, "party1", keys, next);
        for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
      }

      // Employer — always present
      {
        const eVals = smartproEmployerToFieldValues(smartproData.employer);
        const before = next;
        next = applyPartyToFields(eVals, "employer", keys, next);
        next = applyPartyToFields(eVals, "second_party", keys, next);
        next = applyPartyToFields(eVals, "party_2", keys, next);
        next = applyPartyToFields(eVals, "party2", keys, next);
        for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
      }

      // Second Party — Employee
      if (secondPartyRole === "employee") {
        const employee = selectedEmployeeId != null
          ? smartproData.employees.find(e => e.id === selectedEmployeeId) ?? null
          : null;
        if (employee) {
          const empVals = smartproEmployeeToFieldValues(employee);
          const before = next;
          next = applyPartyToFields(empVals, "employee", keys, next);
          next = applyPartyToFields(empVals, "promoter", keys, next);
          next = applyPartyToFields(empVals, "worker", keys, next);
          next = applyPartyToFields(empVals, "second_party", keys, next);
          for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
        }
      }

      // Second Party — Supplier
      if (secondPartyRole === "supplier") {
        const supplier = selectedSupplierId != null
          ? smartproData.suppliers.find(s => s.partyId === selectedSupplierId) ?? null
          : null;
        if (supplier) {
          const supVals = smartproSupplierToFieldValues(supplier);
          const before = next;
          next = applyPartyToFields(supVals, "supplier", keys, next);
          next = applyPartyToFields(supVals, "second_party", keys, next);
          next = applyPartyToFields(supVals, "vendor", keys, next);
          next = applyPartyToFields(supVals, "party_2", keys, next);
          for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
        }
      }
    } else {
      // Regular Supabase parties flow
      const fp = allParties.find(p => p.id === firstPartyId);
      const sp = allParties.find(p => p.id === secondPartyId);

      if (fp) {
        const fpVals = partyToFieldValues(fp);
        const before = next;
        next = applyPartyToFields(fpVals, "first_party", keys, next);
        next = applyPartyToFields(fpVals, "party_1", keys, next);
        next = applyPartyToFields(fpVals, "party1", keys, next);
        for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
      }
      if (sp) {
        const spVals = partyToFieldValues(sp);
        const before = next;
        next = applyPartyToFields(spVals, "second_party", keys, next);
        next = applyPartyToFields(spVals, "party_2", keys, next);
        next = applyPartyToFields(spVals, "party2", keys, next);
        if (sp.type === "company") {
          next = applyPartyToFields(spVals, "employer", keys, next);
          next = applyPartyToFields(spVals, "second_party_company", keys, next);
        }
        next = applyPartyToFields(spVals, "employee", keys, next);
        next = applyPartyToFields(spVals, "promoter", keys, next);
        for (const k of keys) { if (next[k] && !before[k]) newSeeded.add(k); }
      }
    }

    setValues(next);
    setSeededKeys(prev => new Set([...prev, ...newSeeded]));
  }, [scan, values, isSmartpro, smartproData, selectedClientKey, selectedEmployeeId, selectedSupplierId, secondPartyRole, allParties, firstPartyId, secondPartyId]);

  // ── Step 4: Generate & Save ──
  const handleGenerate = async () => {
    if (!scan) return;
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("Not authenticated");

      const allValues = {
        ...values,
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
      };
      const normalized = normalizeValuesForMerge(scan.fields, allValues);

      let docxBlob: Blob | null = null;
      let docPath: string | null = null;

      if (uploadedFile) {
        docxBlob = await mergeTemplate(uploadedFile, normalized, { download: false });
      }

      const { data: record, error: recErr } = await supabase
        .from("contract_records")
        .insert({
          user_id: user.id,
          title: contractTitle.trim() || templateTitle || "Untitled Contract",
          template_id: selectedTemplateId,
          template_type: templateSource === "catalog" ? "catalog" : "byo",
          first_party_id: null,
          second_party_id: null,
          status: "draft",
          start_date: startDate || null,
          end_date: endDate || null,
          field_values: allValues,
          document_path: null,
        })
        .select()
        .single();
      if (recErr) throw recErr;

      if (docxBlob && record) {
        const path = `${user.id}/records/${record.id}.docx`;
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

      const events = [
        { contract_id: record.id, user_id: user.id, type: "created", note: `Contract "${record.title}" created` },
        ...(docxBlob ? [{ contract_id: record.id, user_id: user.id, type: "document_generated", note: "Document generated" }] : []),
      ];
      await supabase.from("contract_events").insert(events);

      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      toast({ title: "Contract saved" });
      navigate(`/records/${record.id}`);
    } catch (e: unknown) {
      toast({ title: (e as Error).message ?? "Failed to save", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // ── Derived labels for Review step ────────────────────────────────────
  const firstPartyLabel = useMemo(() => {
    if (isSmartpro && smartproData) {
      const allClients: SmartProClient[] = [...(smartproData.crmClients ?? []), ...(smartproData.platformClients ?? [])];
      const c = selectedClientKey ? allClients.find(c => clientKey(c) === selectedClientKey) : null;
      return c?.displayNameEn ?? "—";
    }
    return allParties.find(p => p.id === firstPartyId)?.name_en ?? "—";
  }, [isSmartpro, smartproData, selectedClientKey, allParties, firstPartyId]);

  const secondPartyLabel = useMemo(() => {
    if (isSmartpro && smartproData) {
      if (secondPartyRole === "supplier" && selectedSupplierId) {
        const s = smartproData.suppliers?.find(x => x.partyId === selectedSupplierId);
        return s?.displayNameEn ?? smartproData.employer.nameEn;
      }
      if (secondPartyRole === "employee" && selectedEmployeeId != null) {
        const e = smartproData.employees.find(x => x.id === selectedEmployeeId);
        return e ? `${e.firstName} ${e.lastName}` : smartproData.employer.nameEn;
      }
      return smartproData.employer.nameEn;
    }
    return allParties.find(p => p.id === secondPartyId)?.name_en ?? "—";
  }, [isSmartpro, smartproData, secondPartyRole, selectedSupplierId, selectedEmployeeId, allParties, secondPartyId]);

  const readyTemplates = useMemo(() =>
    TEMPLATES.filter(t => t.status === "ready" || t.status === "pro"), []);

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
        <Link to="/records"><ArrowLeft className="me-2 h-4 w-4" />Contracts</Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Contract</h1>
        {draftSavedAt && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> Draft saved
          </span>
        )}
      </div>

      {hasDraft && (
        <div className="flex items-center justify-between gap-3 p-3 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <span>You have an unsaved draft. Restore it?</span>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-100" onClick={dismissDraft}>Discard</Button>
            <Button size="sm" className="h-7 text-xs bg-amber-700 hover:bg-amber-800 text-white" onClick={restoreDraft}>Restore</Button>
          </div>
        </div>
      )}

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
              {isSmartpro
                ? "Parties are loaded live from your SmartPro Hub database."
                : "Choose from your registered parties. Their details will auto-fill the form."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* SmartPro mode */}
            {isSmartpro && (
              <>
                {smartproLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading parties from SmartPro Hub…
                  </div>
                )}

                {smartproError && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Failed to load from SmartPro Hub</p>
                      <p className="text-xs mt-0.5 opacity-80">{smartproError}</p>
                    </div>
                  </div>
                )}

                {smartproData && (
                  <>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                      SmartPro: {(smartproData.crmClients?.length ?? 0) + (smartproData.platformClients?.length ?? 0)} clients · {smartproData.suppliers?.length ?? 0} suppliers · {smartproData.employees.length} employees
                    </div>

                    {/* Employer card — always shown */}
                    <div className="space-y-1.5">
                      <Label className="text-xs uppercase tracking-wide text-muted-foreground">Employer (auto)</Label>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/30">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1 grid grid-cols-2 gap-x-3">
                          <div>
                            <p className="text-sm font-medium truncate">{smartproData.employer.nameEn}</p>
                            {smartproData.employer.nameAr && (
                              <p className="text-xs text-muted-foreground" dir="rtl">{smartproData.employer.nameAr}</p>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {smartproData.employer.crNumber && <p>CR: {smartproData.employer.crNumber}</p>}
                            {smartproData.employer.phone && <p>📞 {smartproData.employer.phone}</p>}
                            {smartproData.employer.email && <p>✉ {smartproData.employer.email}</p>}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ms-auto text-[10px] shrink-0">SmartPro</Badge>
                      </div>
                    </div>

                    <Separator />

                    {/* First Party — Client */}
                    <div className="space-y-2">
                      <Label>First Party — Client</Label>
                      <SmartProClientCombobox
                        clients={[...(smartproData.crmClients ?? []), ...(smartproData.platformClients ?? [])]}
                        value={selectedClientKey}
                        onChange={setSelectedClientKey}
                      />
                      {selectedClientKey && (() => {
                        const allClients: SmartProClient[] = [...(smartproData.crmClients ?? []), ...(smartproData.platformClients ?? [])];
                        const c = allClients.find(x => clientKey(x) === selectedClientKey);
                        if (!c || c.kind !== "crm_client") return null;
                        return (
                          <div className="grid grid-cols-2 gap-x-3 px-2 text-xs text-muted-foreground">
                            {c.crNumber && <span>CR: {c.crNumber}</span>}
                            {c.vatNumber && <span>VAT: {c.vatNumber}</span>}
                            {c.phone && <span>📞 {c.phone}</span>}
                            {c.email && <span>✉ {c.email}</span>}
                          </div>
                        );
                      })()}
                      {(smartproData.crmClients?.length ?? 0) === 0 && (smartproData.platformClients?.length ?? 0) === 0 && (
                        <p className="text-xs text-muted-foreground">No clients found for this company in SmartPro.</p>
                      )}
                    </div>

                    <Separator />

                    {/* Second Party — Employee OR Supplier */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Second Party</Label>
                        <div className="flex rounded-md border overflow-hidden text-xs">
                          {(["employee", "supplier", "none"] as const).map(role => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setSecondPartyRole(role)}
                              className={`px-2.5 py-1 capitalize transition-colors ${secondPartyRole === role ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                            >
                              {role === "none" ? "Skip" : role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {secondPartyRole === "employee" && (
                        <div className="space-y-2">
                          <SmartProEmployeeCombobox
                            employees={smartproData.employees}
                            value={selectedEmployeeId}
                            onChange={setSelectedEmployeeId}
                          />
                          {/* Employee detail + documents */}
                          {selectedEmployeeId != null && (() => {
                            const emp = smartproData.employees.find(e => e.id === selectedEmployeeId);
                            if (!emp) return null;
                            const { expired, expiringSoon } = getDocExpiryWarnings(emp.documents);
                            return (
                              <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
                                {/* Document expiry warnings */}
                                {expired.length > 0 && (
                                  <div className="flex items-start gap-2 p-2 rounded bg-red-50 border border-red-200 text-red-800">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-semibold">Expired documents: </span>
                                      {expired.join(", ")}
                                      {hubUrl && (
                                        <a href={`${hubUrl}/hr/expiry-dashboard`} target="_blank" rel="noopener noreferrer" className="ml-1.5 underline hover:no-underline">
                                          Renew in SmartPro →
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {expiringSoon.length > 0 && (
                                  <div className="flex items-start gap-2 p-2 rounded bg-amber-50 border border-amber-200 text-amber-800">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-semibold">Expiring within 30 days: </span>
                                      {expiringSoon.join(", ")}
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                                  {emp.nationalId && <span>Civil ID: <span className="text-foreground font-mono">{emp.nationalId}</span></span>}
                                  {emp.passportNumber && <span>Passport: <span className="text-foreground font-mono">{emp.passportNumber}</span></span>}
                                  {emp.visaNumber && <span>Visa: <span className="text-foreground font-mono">{emp.visaNumber}</span></span>}
                                  {emp.workPermitNumber && <span>Work Permit: <span className="text-foreground font-mono">{emp.workPermitNumber}</span></span>}
                                  {emp.nationality && <span>Nationality: {emp.nationality}</span>}
                                  {emp.dateOfBirth && <span>DOB: {emp.dateOfBirth}</span>}
                                  {emp.salary != null && <span>Salary: {emp.salary} {emp.currency ?? ""}</span>}
                                  {emp.bankName && <span>Bank: {emp.bankName}</span>}
                                  {emp.ibanNumber && <span>IBAN: <span className="font-mono">{emp.ibanNumber}</span></span>}
                                </div>
                                {emp.documents.length > 0 && (
                                  <div className="pt-1 border-t">
                                    <p className="font-medium text-foreground mb-1.5">Attachments</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {emp.documents.map((doc, i) => (
                                        <a
                                          key={i}
                                          href={doc.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[11px] hover:bg-muted transition-colors ${doc.status === "verified" ? "border-green-300 text-green-800 bg-green-50" : doc.status === "expired" ? "border-red-300 text-red-700 bg-red-50" : "border-border text-muted-foreground bg-background"}`}
                                        >
                                          <FileText className="h-3 w-3 flex-shrink-0" />
                                          {DOC_TYPE_LABEL[doc.type] ?? doc.type}
                                          {doc.expiresAt && <span className="opacity-70">· {doc.expiresAt}</span>}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {secondPartyRole === "supplier" && (
                        <div className="space-y-2">
                          <SmartProSupplierCombobox
                            suppliers={smartproData.suppliers ?? []}
                            value={selectedSupplierId}
                            onChange={setSelectedSupplierId}
                          />
                          {selectedSupplierId && (() => {
                            const s = smartproData.suppliers?.find(x => x.partyId === selectedSupplierId);
                            if (!s) return null;
                            return (
                              <div className="grid grid-cols-2 gap-x-3 px-2 text-xs text-muted-foreground">
                                {s.registrationNumber && <span>CR: {s.registrationNumber}</span>}
                                {s.phone && <span>📞 {s.phone}</span>}
                                {s.email && <span>✉ {s.email}</span>}
                              </div>
                            );
                          })()}
                          {(smartproData.suppliers?.length ?? 0) === 0 && (
                            <p className="text-xs text-muted-foreground">No suppliers registered for this company in SmartPro.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Regular Supabase parties mode */}
            {!isSmartpro && (
              <>
                <div className="space-y-2">
                  <Label>First Party — Client</Label>
                  <PartyCombobox
                    label="Select client company…"
                    parties={allParties.filter(p => ["client", "employer", "supplier", "other"].includes(p.role) && p.type === "company")}
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
                  <Label>Second Party — Employer / Employee</Label>
                  <PartyCombobox
                    label="Select second party…"
                    parties={allParties.filter(p => ["employer", "employee", "contractor", "other"].includes(p.role))}
                    value={secondPartyId}
                    onChange={setSecondPartyId}
                  />
                  <p className="text-xs text-muted-foreground">Can be a company (employer) or a person (employee/contractor).</p>
                </div>

                {allParties.length === 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
                    No parties registered yet.{" "}
                    <Link to="/parties" target="_blank" className="font-medium underline">Add parties</Link>
                    {" "}first to enable auto-fill, or skip and fill manually.
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="me-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={() => { applyPartyData(); setStep(2); }}
                disabled={isSmartpro && smartproLoading}
              >
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
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">First Party — Client</p>
                <p className="font-medium">{firstPartyLabel}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {isSmartpro && secondPartyRole === "supplier" ? "Second Party — Supplier" : isSmartpro && secondPartyRole === "employee" ? "Second Party — Employee" : "Second Party — Employer"}
                </p>
                <p className="font-medium">{secondPartyLabel}</p>
              </div>
              {isSmartpro && smartproData && secondPartyRole === "supplier" && selectedSupplierId && (() => {
                const s = smartproData.suppliers?.find(x => x.partyId === selectedSupplierId);
                if (!s) return null;
                return (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Employer (auto)</p>
                    <p className="font-medium">{smartproData.employer.nameEn}</p>
                    {s.registrationNumber && <p className="text-xs text-muted-foreground">CR: {s.registrationNumber}</p>}
                  </div>
                );
              })()}
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
