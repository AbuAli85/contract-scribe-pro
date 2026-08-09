// Builder for the pre-3.1 hand-authored types (L0 internal).
import type { MinistryLetterType } from "../types";
import { AUTHORED } from "../skeletons/authored";

/**
 * Wrap an authored skeleton as a full letter type. Title and description
 * come from master list v1.0; the skeleton itself is untouched, which is
 * what keeps generated letters byte-identical to pre-3.1 output.
 */
export function authoredType(opts: {
  id: string;
  authorityId: string;
  titleAr: string;
  titleEn: string;
  descAr?: string;
  descEn?: string;
}): MinistryLetterType {
  const skeleton = AUTHORED[opts.id];
  if (!skeleton) throw new Error(`no authored skeleton for "${opts.id}"`);

  return {
    id: opts.id,
    authorityId: opts.authorityId,
    titleAr: opts.titleAr,
    titleEn: opts.titleEn,
    descAr: opts.descAr ?? opts.titleAr,
    descEn: opts.descEn ?? opts.titleEn,
    skeletonStatus: "authored",
    subjectAr: skeleton.subjectAr,
    subjectEn: skeleton.subjectEn,
    bodyAr: skeleton.bodyAr,
    bodyEn: skeleton.bodyEn,
    fields: skeleton.fields,
  };
}
