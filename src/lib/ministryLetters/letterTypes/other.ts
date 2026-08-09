// Master list v1.0 — §7 جهة أخرى (Other) — 1 type
import type { MinistryLetterType } from "../types";
import { authoredType } from "./_build";

export const OTHER_TYPES: MinistryLetterType[] = [
  authoredType({
    id: "custom",
    authorityId: "other",
    titleAr: "خطاب مخصص",
    titleEn: "Custom letter — free text",
    descAr: "اكتب موضوع الخطاب وسطرًا أو سطرين عن الطلب",
    descEn: "Write the subject and 1–2 lines describing the request",
  }),
];
