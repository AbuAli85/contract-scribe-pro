// =============================================================
// Template Content Types
//
// A "ready" template is more than a title + a placeholder body.
// It's: a schema of fillable fields + bilingual clause text with
// {token} placeholders. The same shape works for every template
// — Employment, NDA, Service Agreement, etc.
//
// This file defines the contract between the form generator
// (FillTemplate.tsx) and the doc generator (generateTemplateDocx.ts).
// =============================================================

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency-omr"
  | "date"
  | "select"
  | "email"
  | "phone";

export interface TemplateField {
  /** Token name as it appears inside clause text: {employee_name} → key = "employee_name" */
  key: string;
  /** Group fields under sections in the form UI */
  group: string;
  groupAr: string;
  /** Human label shown on the form */
  labelEn: string;
  labelAr: string;
  type: FieldType;
  /** Required to submit the form */
  required: boolean;
  /** Optional helper text under the input */
  helperEn?: string;
  helperAr?: string;
  /** For type="select" — option list */
  options?: { value: string; labelEn: string; labelAr: string }[];
  /** Default value (used as form initial state) */
  defaultValue?: string;
  /** Optional placeholder text inside the input */
  placeholderEn?: string;
  placeholderAr?: string;
}

/**
 * A clause = one or more bilingual paragraphs that may contain {placeholder}
 * tokens matching field keys. The doc generator renders the clause's heading
 * + body in two columns (English left, Arabic right) and substitutes any
 * {tokens} with the user's filled values.
 */
export interface TemplateClause {
  headingEn: string;
  headingAr: string;
  /** Each entry = one paragraph. Use {token} to reference field keys. */
  paragraphsEn: string[];
  paragraphsAr: string[];
}

export interface TemplateContent {
  /** Must match ContractTemplate.id */
  id: string;
  /** Optional sub-title shown under the main title on the cover */
  subtitleEn?: string;
  subtitleAr?: string;
  fields: TemplateField[];
  clauses: TemplateClause[];
}
