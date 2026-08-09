// MASTER_LIST_VERSION: v1.0 — locked 2026-08-09 — approved by Fahad Alamri
// =============================================================
// Letter type aggregator (L0)
//
// The single ordered list of every letter type in the system. Code
// never ships a type that is not in the locked master list version
// named on line 1; scripts/letterTypes.audit.mts prints this data
// for row-by-row comparison against that document.
//
// 68 types across 7 authorities:
//   SPF 7 · MOL 15 · Tax 8 · MOCIPI 13 · ROP 14 · Municipality 10 · Other 1
// =============================================================

import type { MinistryLetterType } from "../types";
import { SPF_TYPES } from "./spf";
import { MOL_TYPES } from "./mol";
import { TAX_TYPES } from "./tax";
import { MOCIPI_TYPES } from "./mocipi";
import { ROP_TYPES } from "./rop";
import { MUNICIPALITY_TYPES } from "./municipality";
import { OTHER_TYPES } from "./other";

export const MASTER_LIST_VERSION = "v1.0";

export const LETTER_TYPES: MinistryLetterType[] = [
  ...SPF_TYPES,
  ...MOL_TYPES,
  ...TAX_TYPES,
  ...MOCIPI_TYPES,
  ...ROP_TYPES,
  ...MUNICIPALITY_TYPES,
  ...OTHER_TYPES,
];

export const getLetterType = (id: string): MinistryLetterType | undefined =>
  LETTER_TYPES.find((t) => t.id === id);

/** Types belonging to an authority, in master-list order. */
export const typesForAuthority = (authorityId: string): MinistryLetterType[] =>
  LETTER_TYPES.filter((t) => t.authorityId === authorityId);

export {
  SPF_TYPES, MOL_TYPES, TAX_TYPES, MOCIPI_TYPES,
  ROP_TYPES, MUNICIPALITY_TYPES, OTHER_TYPES,
};
