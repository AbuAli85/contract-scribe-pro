// MASTER_LIST_VERSION: v1.0 — locked 2026-08-09 — approved by Fahad Alamri
// =============================================================
// L0 barrel — the layer's ONLY contract surface.
//
// L1 (renderer) and L4 (page) import from here and never from the
// files inside, so this layer stays free to restructure its internals
// as the master list grows. Keeping these re-exports honest is the
// whole compatibility obligation.
// =============================================================

export * from "./types";
export * from "./baseFields";
export * from "./authorities";
export * from "./letterTypes";
export * from "./skeletons/phrases";
export { genericType } from "./skeletons/generic";
