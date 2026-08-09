// =============================================================
// Generic (structured-custom) skeleton (L0)
//
// Every letter type in master list v1.0 that has not had phrasing
// authored and reviewed composes its body from its own name and its
// own fields. The result is a correct, plain, formal letter — never
// invented legal phrasing, because a wrong legal sentence in a
// government letter costs the customer more than a plain one does.
//
// Structure: locked opening → "we hereby submit our request for X,
// per the following details:" → one labelled line per field → the
// standard approval request → the standard undertaking. The renderer
// adds the fixed closings and signature block as always.
// =============================================================

import type { FieldDef, MinistryLetterType } from "../types";
import {
  CLOSING_COMMIT_GENERIC,
  CLOSING_COMMIT_GENERIC_EN,
  OPENING,
  OPENING_EN,
  REQUEST_APPROVAL,
  REQUEST_APPROVAL_EN,
} from "./phrases";

export interface GenericTypeInput {
  id: string;
  authorityId: string;
  titleAr: string;
  titleEn: string;
  fields: FieldDef[];
  /** Optional override when the subject should differ from the title */
  subjectAr?: string;
  subjectEn?: string;
}

/** Build a complete letter type from its name and fields. */
export function genericType(input: GenericTypeInput): MinistryLetterType {
  const detailsAr = input.fields.map((f) => `• ${f.labelAr}: {${f.key}}`);
  const detailsEn = input.fields.map((f) => `• ${f.labelEn}: {${f.key}}`);

  return {
    id: input.id,
    authorityId: input.authorityId,
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    descAr: input.titleAr,
    descEn: input.titleEn,
    skeletonStatus: "generic",
    subjectAr: input.subjectAr ?? input.titleAr,
    subjectEn: input.subjectEn ?? input.titleEn,
    bodyAr: [
      OPENING,
      `وعليه نتقدم إليكم بـ${input.titleAr}، وفق البيانات التالية:`,
      ...detailsAr,
      REQUEST_APPROVAL,
      CLOSING_COMMIT_GENERIC,
    ],
    bodyEn: [
      OPENING_EN,
      `Accordingly, we hereby submit our ${lowerFirst(input.titleEn)}, based on the following details:`,
      ...detailsEn,
      REQUEST_APPROVAL_EN,
      CLOSING_COMMIT_GENERIC_EN,
    ],
    fields: input.fields,
  };
}

/** "Work permit renewal" reads better mid-sentence than "Work Permit Renewal". */
function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Field shorthand — every extra field is required text unless stated. */
export function f(
  key: string,
  labelAr: string,
  labelEn: string,
  extra: Partial<FieldDef> = {},
): FieldDef {
  return {
    key,
    group: "Details",
    groupAr: "التفاصيل",
    labelAr,
    labelEn,
    type: "text",
    required: true,
    ...extra,
  };
}
