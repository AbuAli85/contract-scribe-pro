// =============================================================
// Master-list audit (L6)
//
// Prints the live L0 data as authority → numbered type list so it can
// be compared row-by-row against the locked master list document named
// in the version header. The list is the verification anchor: checks
// reference it BY NUMBER, never by description.
//
// Run:  npx vite-node scripts/letterTypes.audit.mts
// Exits non-zero if the data contradicts itself.
// =============================================================

import {
  AUTHORITIES,
  BASE_FIELDS,
  LETTER_TYPES,
  MASTER_LIST_VERSION,
  getLetterType,
  typesForAuthority,
} from "../src/lib/ministryLetters";

const EXPECTED: Record<string, number> = {
  spf: 7,
  mol: 15,
  tax: 8,
  mocipi: 13,
  "rop-passports": 14,
  "muscat-municipality": 10,
  other: 1,
};

let problems = 0;
const fail = (msg: string) => {
  console.log(`  ✗ ${msg}`);
  problems++;
};

console.log(`MASTER LIST ${MASTER_LIST_VERSION}`);
console.log(`authorities: ${AUTHORITIES.length}   types: ${LETTER_TYPES.length}`);
console.log(`base fields (every letter): ${BASE_FIELDS.map((f) => f.labelAr).join(" · ")}\n`);

for (const authority of AUTHORITIES) {
  const listed = authority.allowedLetterTypes;
  const owned = typesForAuthority(authority.id);
  console.log(`${authority.nameAr}  —  ${authority.nameEn}  [${owned.length}]`);
  console.log(`  addressees: ${authority.recipients.map((r) => r.ar).join(" | ")}`);

  listed.forEach((id, i) => {
    const t = getLetterType(id);
    if (!t) {
      fail(`${authority.id}: allowedLetterTypes references unknown id "${id}"`);
      return;
    }
    const extras = t.fields.map((f) => f.labelAr).join(" | ") || "—";
    console.log(`  ${String(i + 1).padStart(2)}. ${t.titleAr}  —  ${t.titleEn}  [${t.skeletonStatus}]`);
    console.log(`      extra fields: ${extras}`);
    if (t.authorityId !== authority.id) {
      fail(`"${id}" is listed under ${authority.id} but its authorityId is ${t.authorityId}`);
    }
  });

  if (listed.length !== owned.length) {
    fail(`${authority.id}: allowedLetterTypes has ${listed.length} but ${owned.length} types claim this authority`);
  }
  if (owned.length !== EXPECTED[authority.id]) {
    fail(`${authority.id}: expected ${EXPECTED[authority.id]} types, found ${owned.length}`);
  }
  console.log();
}

// ---- integrity checks -----------------------------------------
const ids = LETTER_TYPES.map((t) => t.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) fail(`duplicate type ids: ${[...new Set(dupes)].join(", ")}`);

const totalExpected = Object.values(EXPECTED).reduce((a, b) => a + b, 0);
if (LETTER_TYPES.length !== totalExpected) {
  fail(`expected ${totalExpected} types in total, found ${LETTER_TYPES.length}`);
}

const baseKeys = new Set(BASE_FIELDS.map((f) => f.key));
for (const t of LETTER_TYPES) {
  const keys = t.fields.map((f) => f.key);
  const dupeKeys = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupeKeys.length) fail(`${t.id}: duplicate field keys ${dupeKeys.join(", ")}`);
  for (const k of keys) {
    if (baseKeys.has(k)) fail(`${t.id}: field "${k}" collides with a base field`);
  }
  // Every {token} in the skeleton must be fillable from base + own fields.
  const known = new Set([...baseKeys, ...keys, "authority_praise", "authority_law_clause"]);
  for (const text of [t.subjectAr, t.subjectEn, ...t.bodyAr, ...t.bodyEn]) {
    for (const m of text.matchAll(/\{([a-zA-Z0-9_]+)\}/g)) {
      if (!known.has(m[1])) fail(`${t.id}: skeleton references unknown token {${m[1]}}`);
    }
  }
}

const authored = LETTER_TYPES.filter((t) => t.skeletonStatus === "authored").length;
console.log(`skeletons: ${authored} authored · ${LETTER_TYPES.length - authored} generic`);
console.log(problems === 0 ? "\nAUDIT CLEAN" : `\n${problems} PROBLEM(S)`);
process.exit(problems === 0 ? 0 : 1);
