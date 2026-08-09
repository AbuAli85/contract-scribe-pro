// =============================================================
// Ministry Letters — Types
//
// Formal Arabic letters addressed to Oman government authorities.
// Unlike catalog contracts (bilingual two-column), a ministry
// letter is ARABIC-ONLY, single page, and rendered in ONE locked
// layout (approved sample, Aug 2026). Only placeholder values
// change; the skeleton is code, not data.
//
// Contract between the form (MinistryLetters.tsx) and the
// generator (generateMinistryLetter.ts).
// =============================================================

import type { TemplateField } from "@/lib/templateContent/types";

/**
 * Output language. Arabic is the approved original; English mirrors it
 * with its own skeletons and LTR layout rules. Same {tokens}, same gate.
 */
export type LetterLanguage = "ar" | "en";

/** A government authority the letter can be addressed to */
export interface MinistryAuthority {
  id: string;
  nameAr: string;
  nameEn: string;
  /** e.g. "مدير الاشتراكات" — rendered as الفاضل / {title} ... المحترم */
  recipientTitleAr: string;
  /** e.g. "The Director of Contributions" — rendered as "To: {title}" */
  recipientTitleEn: string;
  /** Praise formula inserted in the opening paragraph */
  praiseAr: string;
  praiseEn: string;
  /** Relevant law cited in the situation paragraph (optional) */
  lawAr?: string;
  lawEn?: string;
}

/** A letter type = subject + Arabic body skeleton with {tokens} */
export interface MinistryLetterType {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  /** Subject line — may contain {tokens} */
  subjectAr: string;
  subjectEn: string;
  /**
   * Body paragraphs in order, {token} placeholders resolved from
   * common fields + this type's extra fields + authority fields:
   * {company_name} {cr_number} {authority_praise} {authority_law_clause}
   */
  bodyAr: string[];
  /** Same paragraphs in formal English. Same tokens, same order. */
  bodyEn: string[];
  /** Extra fields specific to this letter type (beyond COMMON_FIELDS) */
  fields: TemplateField[];
}

/** Values map: field key → user-entered value */
export type LetterValues = Record<string, string>;
