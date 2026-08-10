// =============================================================
// Ministry Letters — Types (L0)
//
// Formal letters addressed to Oman government authorities. A letter
// is single page and rendered in ONE locked layout (approved sample,
// Aug 2026) in Arabic or English. Only placeholder values change;
// the skeleton is code, not user data.
//
// L0 CONTRACT: pure data, zero imports from other layers. FieldDef is
// declared here rather than borrowed from the contracts feature so
// this layer can be consumed as a standalone package (Phase 2 Hub).
// =============================================================

/**
 * Output language. Arabic is the approved original; English mirrors it
 * with its own skeletons and LTR layout rules. Same {tokens}, same gate.
 */
export type LetterLanguage = "ar" | "en";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency-omr"
  | "date"
  | "select"
  | "email"
  | "phone";

/** One fillable input. `key` is the {token} written into the skeleton. */
export interface FieldDef {
  key: string;
  /** Section headings in the form UI */
  group: string;
  groupAr: string;
  labelEn: string;
  labelAr: string;
  type: FieldType;
  required: boolean;
  helperEn?: string;
  helperAr?: string;
  options?: { value: string; labelEn: string; labelAr: string }[];
  defaultValue?: string;
  placeholderEn?: string;
  placeholderAr?: string;
}

/**
 * A selectable addressee. The honorific (معالي / سعادة / الفاضل) is part
 * of the string: the renderer receives one composed title and drops it
 * where the fixed title used to go, so the layout never changes.
 */
export interface RecipientOption {
  ar: string;
  en: string;
  /** Ask for a department / governorate / wilayat name and append it. */
  needsDepartment?: boolean;
  /** The user types the whole title — the escape hatch on every list. */
  freeText?: boolean;
  /**
   * Closing honorific rendered in the third cell (Arabic only):
   * «المحترم» for most addressees, «الموقر» for ministerial (معالي) rank.
   * Free-text entries omit it — the renderer resolves the closing from the
   * user's own text (text opening with «معالي» → «الموقر», else «المحترم»).
   */
  closing?: "المحترم" | "الموقر";
}

/** A government authority the letter can be addressed to */
export interface MinistryAuthority {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Default addressee — kept in sync with recipients[0] for callers
   *  that don't offer a choice. */
  recipientTitleAr: string;
  recipientTitleEn: string;
  /** Selectable addressees, most senior first. Always ends with free text. */
  recipients: RecipientOption[];
  /** Praise formula inserted in the opening paragraph */
  praiseAr: string;
  praiseEn: string;
  /** Relevant law cited in the situation paragraph (optional) */
  lawAr?: string;
  lawEn?: string;
  /** Letter type ids this authority accepts, in master-list order. */
  allowedLetterTypes: string[];
}

/**
 * `authored` — a hand-written skeleton reviewed for this letter type.
 * `generic` — composed from the type's name and its fields via the
 * structured-custom skeleton. Correct but plainer; no invented legal
 * phrasing. The flag lets future batches upgrade skeletons without a
 * schema change.
 */
export type SkeletonStatus = "authored" | "generic";

/** A letter type = subject + body skeleton with {tokens} */
export interface MinistryLetterType {
  id: string;
  /** Owning authority id — the master list is per-authority. */
  authorityId: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  skeletonStatus: SkeletonStatus;
  /** Subject line — may contain {tokens} */
  subjectAr: string;
  subjectEn: string;
  /**
   * Body paragraphs in order, {token} placeholders resolved from
   * base fields + this type's extra fields + authority fields:
   * {company_name} {cr_number} {authority_praise} {authority_law_clause}
   */
  bodyAr: string[];
  bodyEn: string[];
  /** Extra fields specific to this letter type (beyond BASE_FIELDS) */
  fields: FieldDef[];
}

/** Values map: field key → user-entered value */
export type LetterValues = Record<string, string>;
