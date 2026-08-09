// =============================================================
// Bring Your Own Format — storage + persistence
//
// Only the TAGGED docx is uploaded; the raw file the user picked never
// leaves the browser. If tagging fails there is nothing to clean up,
// and a stored format is by construction one we can merge into.
// =============================================================

import { supabase } from "@/integrations/supabase/client";
import { mergeTemplate } from "@/lib/templateEngine";
import { readParagraphs } from "./tagDocx";
import type { FieldSuggestion } from "./detect";

export const MAX_FORMAT_BYTES = 5 * 1024 * 1024;
const BUCKET = "user-formats";

export interface FormatField {
  name: string;
  label: string;
  sample: string;
}

export interface LetterFormat {
  id: string;
  user_id: string;
  name: string;
  language: string;
  fields: FormatField[];
  storage_path: string;
  created_at: string;
}

/** Everything that can go wrong before we even look at the content. */
export type UploadRejection =
  | "not_docx"
  | "too_large"
  | "protected_docx"
  | "no_text"
  | "unreadable_docx";

export interface LoadedUpload {
  buffer: ArrayBuffer;
  paragraphs: ReturnType<typeof readParagraphs>;
}

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * Validate and parse an uploaded file. Every failure mode returns a code
 * the UI turns into bilingual copy — an unreadable upload must never
 * dead-end on a raw exception.
 */
export async function loadUpload(
  file: File,
): Promise<{ ok: true; data: LoadedUpload } | { ok: false; reason: UploadRejection }> {
  const isDocx =
    file.type === DOCX_MIME || file.name.toLowerCase().endsWith(".docx");
  if (!isDocx) return { ok: false, reason: "not_docx" };
  if (file.size > MAX_FORMAT_BYTES) return { ok: false, reason: "too_large" };

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { ok: false, reason: "unreadable_docx" };
  }

  // A password-protected .docx is an OLE compound file, not a zip: it
  // starts with the D0 CF 11 E0 signature instead of "PK".
  const head = new Uint8Array(buffer.slice(0, 4));
  if (head[0] === 0xd0 && head[1] === 0xcf) return { ok: false, reason: "protected_docx" };
  if (head[0] !== 0x50 || head[1] !== 0x4b) return { ok: false, reason: "unreadable_docx" };

  let paragraphs: LoadedUpload["paragraphs"];
  try {
    paragraphs = readParagraphs(buffer);
  } catch {
    return { ok: false, reason: "unreadable_docx" };
  }

  // A scanned letter is a page-sized image with no text nodes at all.
  const totalText = paragraphs.reduce((n, p) => n + p.text.trim().length, 0);
  if (totalText < 20) return { ok: false, reason: "no_text" };

  return { ok: true, data: { buffer, paragraphs } };
}

export function suggestionsToFields(
  suggestions: FieldSuggestion[],
  lang: "ar" | "en",
): FormatField[] {
  return suggestions.map((s) => ({
    name: s.field,
    label: lang === "en" ? s.labelEn : s.labelAr,
    sample: s.sample,
  }));
}

export class FormatLimitError extends Error {
  constructor() {
    super("free_format_limit");
    this.name = "FormatLimitError";
  }
}

/**
 * Persist a tagged format. The row is inserted first: the database
 * trigger owns the free-tier limit, so a rejected insert must happen
 * BEFORE we spend an upload on a file we would then have to delete.
 */
export async function saveFormat(opts: {
  userId: string;
  name: string;
  language: "ar" | "en";
  fields: FormatField[];
  tagged: Blob;
}): Promise<LetterFormat> {
  const id = crypto.randomUUID();
  const storagePath = `${opts.userId}/${id}.docx`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("letter_formats")
    .insert({
      id,
      user_id: opts.userId,
      name: opts.name,
      language: opts.language,
      fields: opts.fields,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (error) {
    if (String(error.message ?? "").includes("free_format_limit")) throw new FormatLimitError();
    throw new Error(error.message ?? "save_failed");
  }

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, opts.tagged, { contentType: DOCX_MIME, upsert: true });

  if (upErr) {
    // Never leave a row pointing at a file that isn't there.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("letter_formats").delete().eq("id", id);
    throw new Error(upErr.message ?? "upload_failed");
  }

  return data as LetterFormat;
}

export async function listFormats(): Promise<LetterFormat[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("letter_formats")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message ?? "list_failed");
  return (data ?? []) as LetterFormat[];
}

export async function deleteFormat(format: LetterFormat): Promise<void> {
  await supabase.storage.from(BUCKET).remove([format.storage_path]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("letter_formats")
    .delete()
    .eq("id", format.id);
  if (error) throw new Error(error.message ?? "delete_failed");
}

/** Fill a saved format and download it, through the existing engine. */
export async function generateFromFormat(
  format: LetterFormat,
  values: Record<string, string>,
): Promise<void> {
  const { data, error } = await supabase.storage.from(BUCKET).download(format.storage_path);
  if (error || !data) throw new Error(error?.message ?? "download_failed");

  const safeName = format.name.replace(/[\\/:*?"<>|]/g, "").trim() || "letter";
  await mergeTemplate(await data.arrayBuffer(), values, {
    filename: `${safeName}.docx`,
  });
}
