// =============================================================
// Translation helper — calls the translate-text Supabase Edge
// Function (which proxies DeepL Pro). Used by the bilingual input
// pair on the fill form to auto-fill the opposite-language half.
// =============================================================

import { supabase } from "@/integrations/supabase/client";

export async function translateText(
  text: string,
  from: "en" | "ar",
  to: "en" | "ar"
): Promise<string> {
  if (!text || !text.trim()) return "";
  if (from === to) return text;

  const { data, error } = await supabase.functions.invoke("translate-text", {
    body: { text, from, to },
  });

  if (error) throw new Error(error.message ?? "Translation failed");
  if (!data?.ok) throw new Error(data?.error ?? "Translation service unavailable");
  return String(data.translated ?? "");
}
