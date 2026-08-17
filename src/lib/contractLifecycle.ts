// =============================================================
// Contract Lifecycle — the single home for contract status
//
// Company OS Constitution, Rule B1 ("Single home per fact"):
// a contract's effective status was derived in four places with
// three different implementations —
//
//   Records.tsx      computeStatus() + STATUS_LABEL + STATUS_COLOR
//   RecordDetail.tsx imported those from a *page* module
//   Dashboard.tsx    re-implemented the 30-day rule inline
//   PartyDetail.tsx  copied the colour map and rendered the raw
//                    enum ("expiring_soon") straight to the user
//
// They now all read from here.
//
// Constitution §I3 adds `noticePeriodDays`, which "drives the
// alert threshold, not just expiry". A lease with 90 days' notice
// has to warn at 90 days — warning at a flat 30 means the notice
// window has already closed by the time the badge turns amber.
// `warningWindowDays()` is that rule.
//
// §C/§D3 fix the alert ladder at 90/60/30/7 days. `crossedThreshold()`
// reports which rung a contract is on so a sweep job can notify
// once per rung (§D6 dedup) without re-deriving the ladder.
// =============================================================

import { differenceInCalendarDays, parseISO } from "date-fns";

// ── Status ────────────────────────────────────────────────────────────
export type ContractStatus =
  | "draft"
  | "active"
  | "expiring_soon"
  | "expired"
  | "terminated"
  | "renewed";

/** Statuses that are a human decision, never overridden by the calendar. */
const TERMINAL_STATUSES: readonly ContractStatus[] = ["terminated", "renewed"];

/**
 * Alert ladder from Constitution §C. Ordered widest → tightest so
 * `crossedThreshold` can return the tightest rung reached.
 */
export const ALERT_THRESHOLDS = [90, 60, 30, 7] as const;
export type AlertThreshold = (typeof ALERT_THRESHOLDS)[number];

/** Warning window when a contract carries no explicit notice period. */
export const DEFAULT_NOTICE_PERIOD_DAYS = 30;

/**
 * The minimum a lifecycle helper needs to know. Structural, so both
 * `ContractRecord` and the trimmed row Dashboard selects satisfy it.
 */
export interface LifecycleFields {
  status: ContractStatus;
  end_date: string | null;
  /** §I3 — days of notice required before expiry. Null = use the default. */
  notice_period_days?: number | null;
}

// ── Record shape ──────────────────────────────────────────────────────
export interface ContractRecord extends LifecycleFields {
  id: string;
  user_id: string;
  title: string;
  template_id: string | null;
  template_type: "catalog" | "byo" | "custom" | null;
  first_party_id: string | null;
  second_party_id: string | null;
  start_date: string | null;
  field_values: Record<string, string>;
  document_path: string | null;
  notes: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // joined
  first_party?: { name_en: string; type: string } | null;
  second_party?: { name_en: string; type: string } | null;
}

// ── Derivation ────────────────────────────────────────────────────────

/**
 * Whole days from `now` until expiry. Negative once expired, null for
 * open-ended contracts.
 *
 * Calendar days, not elapsed days: a contract ending today reads as 0
 * whether it is checked at 09:00 or 23:00. Elapsed-day arithmetic makes
 * the same contract read 0 in the morning and -1 in the evening.
 */
export function daysUntilExpiry(
  record: Pick<LifecycleFields, "end_date">,
  now: Date = new Date()
): number | null {
  if (!record.end_date) return null;
  return differenceInCalendarDays(parseISO(record.end_date), now);
}

/**
 * How far ahead of expiry this contract starts warning. §I3: the notice
 * period drives the threshold, because a contract you must give 90 days'
 * notice on is urgent 90 days out, not 30.
 */
export function warningWindowDays(record: LifecycleFields): number {
  const notice = record.notice_period_days;
  if (notice == null || notice <= 0) return DEFAULT_NOTICE_PERIOD_DAYS;
  return Math.max(notice, DEFAULT_NOTICE_PERIOD_DAYS);
}

/**
 * The status to show, given the stored status and the calendar.
 *
 * Stored status stays authoritative for decisions a human made (draft,
 * terminated, renewed); the calendar only ever moves an in-force
 * contract into `expiring_soon` / `expired`.
 */
export function computeStatus(
  record: LifecycleFields,
  now: Date = new Date()
): ContractStatus {
  if (TERMINAL_STATUSES.includes(record.status)) return record.status;
  if (record.status === "draft") return record.status;

  const days = daysUntilExpiry(record, now);
  if (days === null) return record.status;

  if (days < 0) return "expired";
  if (days <= warningWindowDays(record)) return "expiring_soon";
  return record.status;
}

/**
 * The tightest alert rung this contract has reached (§C ladder), or null
 * if it is not yet within 90 days, is open-ended, or has already expired.
 *
 * A sweep job pairs this with a per-(contract, threshold) ledger row so
 * each rung notifies exactly once (§D6).
 */
export function crossedThreshold(
  record: LifecycleFields,
  now: Date = new Date()
): AlertThreshold | null {
  if (TERMINAL_STATUSES.includes(record.status) || record.status === "draft") {
    return null;
  }
  const days = daysUntilExpiry(record, now);
  if (days === null || days < 0) return null;

  let reached: AlertThreshold | null = null;
  for (const threshold of ALERT_THRESHOLDS) {
    if (days <= threshold) reached = threshold;
  }
  return reached;
}

// ── Display ───────────────────────────────────────────────────────────

/**
 * Bilingual per Constitution §J2 — "no English-only fields ever".
 *
 * The Contracts screens have no language context yet (the app-wide
 * `LanguageToggle` is passed as a prop inside the contract builder, it is
 * not global state), so callers pass "en" today. When that context lands,
 * only the argument changes — the Arabic is already here.
 */
export const STATUS_LABELS: Record<ContractStatus, { en: string; ar: string }> = {
  draft: { en: "Draft", ar: "مسودة" },
  active: { en: "Active", ar: "ساري" },
  expiring_soon: { en: "Expiring soon", ar: "قارب على الانتهاء" },
  expired: { en: "Expired", ar: "منتهي" },
  terminated: { en: "Terminated", ar: "منهى" },
  renewed: { en: "Renewed", ar: "مجدد" },
};

export function statusLabel(
  status: ContractStatus,
  lang: "en" | "ar" = "en"
): string {
  return STATUS_LABELS[status][lang];
}

export const STATUS_COLOR: Record<ContractStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  active: "bg-green-100 text-green-800 border-green-200",
  expiring_soon: "bg-amber-100 text-amber-800 border-amber-200",
  expired: "bg-red-100 text-red-700 border-red-200",
  terminated: "bg-red-100 text-red-700 border-red-200",
  renewed: "bg-blue-100 text-blue-800 border-blue-200",
};

/** Narrows an untrusted string (a raw DB column) to a known status. */
export function asContractStatus(value: string): ContractStatus {
  return value in STATUS_LABELS ? (value as ContractStatus) : "draft";
}
