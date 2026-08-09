// =============================================================
// Bring Your Own Format — reading and tagging a user's .docx
//
// The whole feature rests on one awkward fact about Word: the text
// you see as one phrase is often split across several <w:r> runs,
// because Word starts a new run at every formatting change, spell-
// check boundary, or edit session. "1234567" can easily be stored
// as "123" + "45" + "67". A naive string replace over the XML finds
// nothing and silently produces an untagged document.
//
// So we work per paragraph: concatenate the <w:t> nodes into plain
// text, match against THAT, then map each match back to the nodes it
// spans — writing the {tag} into the first node and cutting the
// matched characters out of the rest. Everything else in the XML is
// left exactly as it was, so letterhead, styles, tables and images
// survive byte for byte.
//
// Only word/document.xml is scanned and tagged. Headers and footers
// are deliberately untouched: that is where letterhead lives, and a
// customer's letterhead should never sprout placeholders.
// =============================================================

import PizZip from "pizzip";

export interface DocxParagraph {
  /** Index into the document's paragraph list — the tagging key. */
  index: number;
  text: string;
}

/** A span of a paragraph that should become {field}. */
export interface TagSpan {
  paragraphIndex: number;
  start: number;
  end: number;
  field: string;
}

const PARAGRAPH_RE = /<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:p\b[^>]*\/>/g;
const TEXT_NODE_RE = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:t(?:\s[^>]*)?\/>/g;

const unescapeXml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

interface TextNode {
  /** Offsets of the whole <w:t …>…</w:t> element within the paragraph XML */
  xmlStart: number;
  xmlEnd: number;
  selfClosing: boolean;
  /** Offsets of this node's text within the paragraph's plain text */
  textStart: number;
  textEnd: number;
  text: string;
}

interface ParsedParagraph {
  text: string;
  nodes: TextNode[];
}

/** Concatenate a paragraph's text nodes, remembering where each one landed. */
function parseParagraph(xml: string): ParsedParagraph {
  const nodes: TextNode[] = [];
  let text = "";

  TEXT_NODE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TEXT_NODE_RE.exec(xml)) !== null) {
    const raw = m[1];
    const value = raw === undefined ? "" : unescapeXml(raw);
    nodes.push({
      xmlStart: m.index,
      xmlEnd: m.index + m[0].length,
      selfClosing: raw === undefined,
      textStart: text.length,
      textEnd: text.length + value.length,
      text: value,
    });
    text += value;
  }

  return { text, nodes };
}

/** All paragraphs of the body, in document order. */
export function readParagraphs(buffer: ArrayBuffer): DocxParagraph[] {
  const zip = new PizZip(buffer);
  const doc = zip.file("word/document.xml");
  if (!doc) throw new Error("unreadable_docx");

  const xml = doc.asText();
  const out: DocxParagraph[] = [];
  let index = 0;

  PARAGRAPH_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PARAGRAPH_RE.exec(xml)) !== null) {
    out.push({ index, text: parseParagraph(m[0]).text });
    index += 1;
  }
  return out;
}

/**
 * Rewrite one paragraph so each span becomes {field}. Spans must be
 * sorted and non-overlapping; the caller guarantees that.
 */
function tagParagraph(xml: string, spans: TagSpan[]): string {
  const { text, nodes } = parseParagraph(xml);
  if (!spans.length || !nodes.length) return xml;

  const newTexts = nodes.map((node) => {
    let out = "";
    let cursor = node.textStart;

    for (const span of spans) {
      if (span.end <= node.textStart || span.start >= node.textEnd) continue;
      const overlapStart = Math.max(span.start, node.textStart);
      const overlapEnd = Math.min(span.end, node.textEnd);

      out += text.slice(cursor, overlapStart);
      // The tag belongs to whichever node the span STARTS in, so a span
      // split across runs yields exactly one tag, not one per run.
      if (span.start >= node.textStart) out += `{${span.field}}`;
      cursor = overlapEnd;
    }

    out += text.slice(cursor, node.textEnd);
    return out;
  });

  // Rewrite from the end so earlier offsets stay valid.
  let result = xml;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (node.selfClosing || newTexts[i] === node.text) continue;
    const value = newTexts[i];
    // xml:space="preserve" or Word eats leading/trailing spaces, which is
    // how "we, {company_name}, registered" loses the space before "{".
    const replacement = `<w:t xml:space="preserve">${escapeXml(value)}</w:t>`;
    result = result.slice(0, node.xmlStart) + replacement + result.slice(node.xmlEnd);
  }
  return result;
}

/**
 * Tag the document and hand back the loaded zip. Callers pick their own
 * output form — Blob in the browser, nodebuffer in tests — off one
 * implementation, so the tested path is the shipped path.
 */
export function tagDocxZip(buffer: ArrayBuffer, spans: TagSpan[]): PizZip {
  const zip = new PizZip(buffer);
  const doc = zip.file("word/document.xml");
  if (!doc) throw new Error("unreadable_docx");

  const byParagraph = new Map<number, TagSpan[]>();
  for (const span of spans) {
    const list = byParagraph.get(span.paragraphIndex) ?? [];
    list.push(span);
    byParagraph.set(span.paragraphIndex, list);
  }
  for (const list of byParagraph.values()) list.sort((a, b) => a.start - b.start);

  const xml = doc.asText();
  const paragraphs: { start: number; end: number; xml: string; index: number }[] = [];

  PARAGRAPH_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  let index = 0;
  while ((m = PARAGRAPH_RE.exec(xml)) !== null) {
    paragraphs.push({ start: m.index, end: m.index + m[0].length, xml: m[0], index });
    index += 1;
  }

  let result = xml;
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i];
    const spansHere = byParagraph.get(p.index);
    if (!spansHere?.length) continue;
    const tagged = tagParagraph(p.xml, spansHere);
    if (tagged !== p.xml) result = result.slice(0, p.start) + tagged + result.slice(p.end);
  }

  zip.file("word/document.xml", result);
  return zip;
}

/**
 * Produce a tagged copy of the document: the .docx bytes with every
 * confirmed span replaced by its {field} token, ready for mergeTemplate()
 * — the same engine the BYO contract templates use.
 */
export function tagDocx(buffer: ArrayBuffer, spans: TagSpan[]): Blob {
  return tagDocxZip(buffer, spans).generate({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    compression: "DEFLATE",
  });
}
