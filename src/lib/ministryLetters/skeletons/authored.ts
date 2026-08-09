// =============================================================
// Authored skeletons (L0)
//
// The seven letter types written and reviewed before the master list
// existed. Their subject lines, body paragraphs and field sets are
// reproduced here BYTE-UNCHANGED from the pre-3.1 definitions — the
// regression guard proves generated letters are identical, so nothing
// in this file may be "tidied".
//
// New types do not belong here: they compose from skeletons/generic.ts
// until someone authors and reviews real phrasing for them.
// =============================================================

import type { FieldDef } from "../types";
import {
  CLOSING_COMMIT_GENERIC,
  CLOSING_COMMIT_GENERIC_EN,
  OPENING,
  OPENING_EN,
} from "./phrases";

export interface AuthoredSkeleton {
  subjectAr: string;
  subjectEn: string;
  bodyAr: string[];
  bodyEn: string[];
  fields: FieldDef[];
}

export const AUTHORED: Record<string, AuthoredSkeleton> = {
  installment: {
    subjectAr: "طلب سداد المستحقات على {installment_count} مع رفع الإيقاف",
    subjectEn: "Request to Settle Outstanding Dues in {installment_count} and Lift the Suspension",
    bodyAr: [
      OPENING,
      "ونفيدكم بأن الشركة تمر بظروف مالية مؤقتة أثّرت على انتظام سداد المستحقات، وحرصًا منّا على الالتزام الكامل بأحكام {authority_law_clause}، نلتمس من عنايتكم الكريمة التفضل بالموافقة على ما يلي:",
      "أولًا: تقسيط إجمالي المبلغ المستحق على الشركة والبالغ ({total_amount} ريال عماني) على {installment_count}، بواقع {installment_breakdown}.",
      "ثانيًا: رفع الإيقاف (الحظر) المفروض على منشأتنا فور سداد القسط الأول، بما يمكّن الشركة من مواصلة أعمالها وإنجاز معاملاتها لدى الجهات الحكومية، والوفاء بالتزاماتها تجاه موظفيها.",
      "ونتعهد بسداد الأقساط في المواعيد المحددة دون تأخير، وبالانتظام في سداد المستحقات الجارية في مواعيدها القانونية.",
    ],
    bodyEn: [
      OPENING_EN,
      "We wish to advise that the company is experiencing temporary financial circumstances which have affected the regular settlement of its dues. In our keenness to comply fully with the provisions of {authority_law_clause}, we respectfully request your kind approval of the following:",
      "First: to settle the total amount due from the company, being (OMR {total_amount}), in {installment_count}, as follows: {installment_breakdown}.",
      "Second: to lift the suspension imposed on our establishment immediately upon settlement of the first installment, thereby enabling the company to continue its operations, complete its transactions with government entities, and meet its obligations towards its employees.",
      "We hereby undertake to pay the installments on their due dates without delay, and to remain current in settling ongoing dues within their statutory deadlines.",
    ],
    fields: [
      { key: "total_amount", group: "Amounts", groupAr: "المبالغ", labelEn: "Total Due (OMR)", labelAr: "إجمالي المبلغ المستحق (ر.ع)", type: "currency-omr", required: true, placeholderEn: "443.191", helperAr: "الرقم فقط — كلمة (ريال عماني) تُضاف تلقائيًا", helperEn: "Number only — the letter adds OMR" },
      { key: "installment_count", group: "Amounts", groupAr: "المبالغ", labelEn: "Installments", labelAr: "عدد الأقساط", type: "select", required: true, defaultValue: "قسطين", options: [
        { value: "قسطين", labelEn: "Two installments", labelAr: "قسطين" },
        { value: "ثلاثة أقساط", labelEn: "Three installments", labelAr: "ثلاثة أقساط" },
        { value: "أربعة أقساط", labelEn: "Four installments", labelAr: "أربعة أقساط" },
      ]},
      { key: "installment_breakdown", group: "Amounts", groupAr: "المبالغ", labelEn: "Breakdown", labelAr: "تفصيل الأقساط", type: "textarea", required: true, placeholderAr: "(222.191 ريال عماني) للقسط الأول، و(221.000 ريال عماني) للقسط الثاني", placeholderEn: "(OMR 222.191) for the first installment and (OMR 221.000) for the second", helperAr: "بدون تواريخ إلا إذا طُلبت", helperEn: "Amounts per installment; no dates unless required" },
    ],
  },

  unblock: {
    subjectAr: "طلب رفع الإيقاف المفروض على المنشأة",
    subjectEn: "Request to Lift the Suspension Imposed on the Establishment",
    bodyAr: [
      OPENING,
      "ونفيدكم بأنه تم إيقاف معاملات منشأتنا لديكم بسبب {block_reason}، وقد قمنا بمعالجة أسباب الإيقاف {resolution_note}.",
      "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على رفع الإيقاف (الحظر) المفروض على منشأتنا، بما يمكّن الشركة من مواصلة أعمالها وإنجاز معاملاتها لدى الجهات الحكومية، والوفاء بالتزاماتها تجاه موظفيها.",
      CLOSING_COMMIT_GENERIC,
    ],
    bodyEn: [
      OPENING_EN,
      "We wish to advise that the transactions of our establishment with your good offices have been suspended due to {block_reason}, and we have since remedied the cause of the suspension {resolution_note}.",
      "We therefore respectfully request your kind approval to lift the suspension imposed on our establishment, thereby enabling the company to continue its operations, complete its transactions with government entities, and meet its obligations towards its employees.",
      CLOSING_COMMIT_GENERIC_EN,
    ],
    fields: [
      { key: "block_reason", group: "Details", groupAr: "التفاصيل", labelEn: "Reason of Suspension", labelAr: "سبب الإيقاف", type: "text", required: true, placeholderAr: "تأخر سداد الاشتراكات", placeholderEn: "late settlement of contributions", helperAr: "السبب فقط — كلمة (بسبب) تُضاف تلقائيًا", helperEn: "Reason only — the letter adds \"due to\"" },
      { key: "resolution_note", group: "Details", groupAr: "التفاصيل", labelEn: "How it was resolved", labelAr: "ما تم اتخاذه للمعالجة", type: "textarea", required: true, placeholderAr: "بسداد كامل المبلغ المستحق بتاريخه", placeholderEn: "by settling the full amount due on its date", helperAr: "أكمل الجملة بعد (وقد قمنا بمعالجة أسباب الإيقاف)", helperEn: "Completes the sentence after \"we have since remedied the cause\"" },
    ],
  },

  clearance: {
    subjectAr: "طلب إصدار شهادة براءة ذمة",
    subjectEn: "Request for the Issuance of a Clearance Certificate",
    bodyAr: [
      OPENING,
      "ونفيدكم بأن الشركة قامت بسداد كافة المستحقات المترتبة عليها لديكم، وذلك لغرض {clearance_purpose}.",
      "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على إصدار شهادة براءة ذمة للمنشأة.",
      CLOSING_COMMIT_GENERIC,
    ],
    bodyEn: [
      OPENING_EN,
      "We wish to advise that the company has settled all dues payable to your good offices, for the purpose of {clearance_purpose}.",
      "We therefore respectfully request your kind approval for the issuance of a clearance certificate in favour of the establishment.",
      CLOSING_COMMIT_GENERIC_EN,
    ],
    fields: [
      { key: "clearance_purpose", group: "Details", groupAr: "التفاصيل", labelEn: "Purpose", labelAr: "الغرض من الشهادة", type: "text", required: true, placeholderAr: "استكمال إجراءات التخارج / تجديد السجل", placeholderEn: "completing exit procedures / renewing the registration", helperAr: "الغرض فقط — كلمة (لغرض) تُضاف تلقائيًا", helperEn: "Purpose only — the letter adds \"for the purpose of\"" },
    ],
  },

  extension: {
    subjectAr: "طلب تمديد مهلة {extension_subject}",
    subjectEn: "Request for an Extension of the Deadline for {extension_subject}",
    bodyAr: [
      OPENING,
      "ونفيدكم بأن الشركة تعمل حاليًا على {current_efforts}، ونلتمس من عنايتكم الكريمة التفضل بالموافقة على تمديد المهلة الممنوحة للشركة بشأن {extension_subject} حتى تاريخ {new_deadline}.",
      "ونتعهد باستكمال كافة المتطلبات خلال المهلة المطلوبة والالتزام الكامل بالأنظمة المقررة.",
    ],
    bodyEn: [
      OPENING_EN,
      "We wish to advise that the company is currently working on {current_efforts}, and we respectfully request your kind approval to extend the deadline granted to the company in respect of {extension_subject} until {new_deadline}.",
      "We hereby undertake to complete all requirements within the requested period and to comply fully with the applicable regulations.",
    ],
    fields: [
      { key: "extension_subject", group: "Details", groupAr: "التفاصيل", labelEn: "Subject of Extension", labelAr: "موضوع التمديد", type: "text", required: true, placeholderAr: "توفيق أوضاع نسبة التعمين", placeholderEn: "rectifying the Omanisation percentage", helperAr: "الموضوع فقط — كلمة (مهلة) تُضاف تلقائيًا", helperEn: "Subject only — the letter adds \"the deadline for\"" },
      { key: "current_efforts", group: "Details", groupAr: "التفاصيل", labelEn: "Current Efforts", labelAr: "الجهود الجارية", type: "textarea", required: true, placeholderAr: "استكمال إجراءات استقطاب كوادر وطنية مؤهلة", placeholderEn: "completing the recruitment of qualified Omani personnel", helperAr: "أكمل الجملة بعد (تعمل الشركة حاليًا على)", helperEn: "Completes the sentence after \"is currently working on\"" },
      { key: "new_deadline", group: "Details", groupAr: "التفاصيل", labelEn: "Requested Deadline", labelAr: "التاريخ المطلوب", type: "text", required: true, placeholderEn: "31 December 2026", helperAr: "التاريخ فقط — عبارة (حتى تاريخ) تُضاف تلقائيًا", helperEn: "Date only — the letter adds \"until\"" },
    ],
  },

  objection: {
    subjectAr: "تظلم من القرار رقم ({decision_ref})",
    subjectEn: "Grievance against Decision No. ({decision_ref})",
    bodyAr: [
      OPENING,
      "ونفيدكم بأنه صدر بحق منشأتنا القرار رقم ({decision_ref}) بتاريخ {decision_date} والمتضمن {decision_summary}.",
      "وحيث إن {objection_grounds}، فإننا نلتمس من عنايتكم الكريمة التفضل بإعادة النظر في القرار المشار إليه، ومرفق لكم المستندات المؤيدة لطلبنا.",
      CLOSING_COMMIT_GENERIC,
    ],
    bodyEn: [
      OPENING_EN,
      "We wish to advise that Decision No. ({decision_ref}) was issued against our establishment on {decision_date}, providing for {decision_summary}.",
      "Whereas {objection_grounds}, we respectfully request your kind reconsideration of the aforementioned decision. The documents supporting our request are attached herewith.",
      CLOSING_COMMIT_GENERIC_EN,
    ],
    fields: [
      { key: "decision_ref", group: "Decision", groupAr: "القرار", labelEn: "Decision Ref. No.", labelAr: "رقم القرار", type: "text", required: true, placeholderEn: "12/2026", helperAr: "الرقم فقط — عبارة (القرار رقم) تُضاف تلقائيًا", helperEn: "Number only — the letter adds \"Decision No.\"" },
      { key: "decision_date", group: "Decision", groupAr: "القرار", labelEn: "Decision Date", labelAr: "تاريخ القرار", type: "text", required: true, placeholderEn: "15 July 2026", helperAr: "التاريخ فقط — كلمة (بتاريخ) تُضاف تلقائيًا", helperEn: "Date only — the letter adds \"on\"" },
      { key: "decision_summary", group: "Decision", groupAr: "القرار", labelEn: "Decision Summary", labelAr: "ملخص القرار", type: "textarea", required: true, placeholderAr: "إيقاف التعاملات لمدة ثلاثة أشهر", placeholderEn: "the suspension of transactions for three months", helperAr: "المضمون فقط — كلمة (والمتضمن) تُضاف تلقائيًا", helperEn: "Content only — the letter adds \"providing for\"" },
      { key: "objection_grounds", group: "Decision", groupAr: "القرار", labelEn: "Grounds of Objection", labelAr: "أسباب التظلم", type: "textarea", required: true, placeholderAr: "الشركة قامت بسداد كامل المستحقات قبل صدور القرار", placeholderEn: "the company had settled all dues in full prior to the issuance of the decision", helperAr: "ابدأ بالسبب مباشرة — عبارة (وحيث إن) تُضاف تلقائيًا", helperEn: "Start with the reason — the letter adds \"Whereas\"" },
    ],
  },

  noc: {
    subjectAr: "طلب إصدار خطاب عدم ممانعة",
    subjectEn: "Request for the Issuance of a No-Objection Letter",
    bodyAr: [
      OPENING,
      "نلتمس من عنايتكم الكريمة التفضل بالموافقة على إصدار خطاب عدم ممانعة بشأن {noc_matter}.",
      CLOSING_COMMIT_GENERIC,
    ],
    bodyEn: [
      OPENING_EN,
      "We respectfully request your kind approval for the issuance of a no-objection letter in respect of {noc_matter}.",
      CLOSING_COMMIT_GENERIC_EN,
    ],
    fields: [
      { key: "noc_matter", group: "Details", groupAr: "التفاصيل", labelEn: "Matter", labelAr: "موضوع عدم الممانعة", type: "textarea", required: true, placeholderAr: "نقل كفالة أحد الموظفين", placeholderEn: "the transfer of sponsorship of one of our employees", helperAr: "الموضوع فقط — كلمة (بشأن) تُضاف تلقائيًا", helperEn: "Matter only — the letter adds \"in respect of\"" },
    ],
  },

  custom: {
    subjectAr: "{custom_subject}",
    subjectEn: "{custom_subject}",
    bodyAr: [
      OPENING,
      "{custom_body}",
      "لذا نلتمس من عنايتكم الكريمة التفضل بالموافقة على طلبنا المشار إليه أعلاه.",
      CLOSING_COMMIT_GENERIC,
    ],
    bodyEn: [
      OPENING_EN,
      "{custom_body}",
      "We therefore respectfully request your kind approval of our request set out above.",
      CLOSING_COMMIT_GENERIC_EN,
    ],
    fields: [
      { key: "custom_subject", group: "Details", groupAr: "التفاصيل", labelEn: "Subject", labelAr: "موضوع الخطاب", type: "text", required: true, placeholderAr: "طلب تصحيح بيانات المنشأة", placeholderEn: "Request to Correct the Establishment's Details", helperAr: "بدون كلمة (الموضوع) — تُضاف تلقائيًا في الخطاب", helperEn: "Omit the word \"Subject\" — the letter adds it" },
      { key: "custom_body", group: "Details", groupAr: "التفاصيل", labelEn: "Request Description", labelAr: "وصف الطلب", type: "textarea", required: true, helperAr: "سطر أو سطران — سيُصاغ ضمن الهيكل الرسمي", helperEn: "1–2 lines — merged into the formal skeleton" },
    ],
  },
};
