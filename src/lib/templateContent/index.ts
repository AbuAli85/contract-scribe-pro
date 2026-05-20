// Registry of full template content — id → TemplateContent.
// Add new templates here as their clauses are authored.

import type { TemplateContent } from "./types";
import { EMPLOYMENT_CONTENT } from "./employment";

const REGISTRY: Record<string, TemplateContent> = {
  [EMPLOYMENT_CONTENT.id]: EMPLOYMENT_CONTENT,
  // Add other templates here as authored:
  //   [NDA_CONTENT.id]: NDA_CONTENT,
  //   [SERVICE_AGREEMENT_CONTENT.id]: SERVICE_AGREEMENT_CONTENT,
};

export const getTemplateContent = (
  id: string
): TemplateContent | undefined => REGISTRY[id];

export const hasTemplateContent = (id: string): boolean => id in REGISTRY;

export * from "./types";
