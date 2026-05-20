// Registry of full template content — id → TemplateContent.
// Add new templates here as their clauses are authored.

import type { TemplateContent } from "./types";
import { EMPLOYMENT_CONTENT } from "./employment";
import { NDA_CONTENT } from "./nda";
import { SERVICE_AGREEMENT_CONTENT } from "./service-agreement";

const REGISTRY: Record<string, TemplateContent> = {
  [EMPLOYMENT_CONTENT.id]: EMPLOYMENT_CONTENT,
  [NDA_CONTENT.id]: NDA_CONTENT,
  [SERVICE_AGREEMENT_CONTENT.id]: SERVICE_AGREEMENT_CONTENT,
  // Add other templates here as authored:
  //   [TENANCY_CONTENT.id]: TENANCY_CONTENT,
};

export const getTemplateContent = (
  id: string
): TemplateContent | undefined => REGISTRY[id];

export const hasTemplateContent = (id: string): boolean => id in REGISTRY;

export * from "./types";
