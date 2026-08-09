// =============================================================
// Shared skeleton phrasing (L0)
//
// The opening and the undertaking are identical across every letter
// type in both languages — they are the approved register. Changing a
// string here changes every letter, so treat them as locked text.
// =============================================================

// The skeleton must never pre-write a word the user also types. Arabic
// company names carry their own form (شركة / مؤسسة / ش.م.م), so the name
// goes in exactly as registered — no "شركة" prefix here.
export const OPENING =
  "بالإشارة إلى الموضوع أعلاه، نتقدم إليكم نحن {company_name}، المسجلة بالسجل التجاري رقم ({cr_number})، بجزيل الشكر والتقدير لجهودكم في {authority_praise}.";

export const OPENING_EN =
  "With reference to the above subject, we, {company_name}, registered under Commercial Registration No. ({cr_number}), extend our sincere appreciation for your esteemed efforts in {authority_praise}.";

export const CLOSING_COMMIT_GENERIC =
  "ونتعهد بالالتزام الكامل بكافة المتطلبات والإجراءات المقررة لديكم في هذا الشأن.";

export const CLOSING_COMMIT_GENERIC_EN =
  "We hereby undertake to comply fully with all requirements and procedures prescribed by your good offices in this regard.";

export const REQUEST_APPROVAL =
  "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على طلبنا المشار إليه أعلاه.";

export const REQUEST_APPROVAL_EN =
  "We therefore respectfully request your kind approval of our request set out above.";

/**
 * Values that are Arabic by default but must read as English when the
 * letter is generated in English — select options and seeded defaults.
 * Only exact matches translate, so anything the user typed themselves
 * is left alone: their words, their letter.
 */
export const TOKEN_VALUE_EN: Record<string, string> = {
  "قسطين": "two installments",
  "ثلاثة أقساط": "three installments",
  "أربعة أقساط": "four installments",
  "المفوض بالتوقيع": "Authorised Signatory",
};
