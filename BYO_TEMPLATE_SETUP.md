# BYO-Template Engine — Setup Guide

The "Bring Your Own Template" feature lets users upload any `.docx` file
with `{placeholder}` tokens and turn it into a fillable form. This is
Phase 1 of the universal contract engine.

## What was added

| File | Purpose |
| ---- | ------- |
| `src/lib/templateEngine.ts` | docxtemplater + pizzip wrappers — `scanTemplate()` finds placeholders, `mergeTemplate()` fills them. |
| `src/pages/MyTemplates.tsx` | Full upload → review → fill → download UX, bilingual EN/AR. |
| `supabase/migrations/20260520_create_user_templates.sql` | `user_templates` + `template_fills` tables, Storage buckets, RLS policies. |
| Route `/my-templates` | Wired in `src/App.tsx`. |

## Install dependencies

```bash
npm install docxtemplater@^3.50.0 pizzip@^3.1.7 file-saver@^2.0.5
npm install --save-dev @types/file-saver
```

Or with bun (matches your existing `bun.lockb`):

```bash
bun add docxtemplater pizzip file-saver
bun add -d @types/file-saver
```

## Run the migration

```bash
supabase db push
```

This creates two tables and two Storage buckets (`user-templates`, `template-outputs`).

## How users use it

1. They write a Word document like:

   > Dear {employee_name},
   > Your annual salary will be {salary} OMR starting {start_date}.
   > Your job title is {position}.

2. They visit `/my-templates`, upload the .docx.
3. The system scans it and shows: `employee_name`, `salary`, `start_date`, `position` — with inferred field types (text, number, date, text).
4. They click "Continue → fill the form" and fill in the values.
5. They get a downloaded `.docx` with everything filled in, formatting preserved.

## Placeholder syntax

Default is single-brace: `{token}`. The token must:

- Start with a letter
- Contain only letters, numbers, underscores, hyphens, or spaces
- Be 1–60 characters

If your existing templates use `{{double-brace}}`, change the docxtemplater
delimiters in `templateEngine.ts`:

```ts
new Docxtemplater(zip, {
  delimiters: { start: "{{", end: "}}" },
  // ...
});
```

## Field type inference

`templateEngine.ts` infers input type from the token name:

| Token contains | Renders as |
| -------------- | ---------- |
| `date`, `start`, `end`, `expiry`, `dob`, `joining` | `<input type="date">` |
| `salary`, `amount`, `rate`, `count`, `qty`, `fee` | `<input type="number">` |
| `email` | `<input type="email">` |
| `address`, `description`, `notes`, `terms`, `clause` | `<textarea>` |
| Anything else | `<input type="text">` |

## Phase 2 — AI field detection (next milestone)

Same data model, additive change. Add a Supabase Edge Function
`detect-template-fields` that:

1. Receives an uploaded .docx or PDF
2. Sends the text to Claude with a structured-output prompt
3. Returns a `PlaceholderField[]` schema even for documents with no `{tokens}`
4. User confirms / edits the schema, then the template behaves identically to Phase 1

This is the "magic" upgrade — paste any existing employment letter and the
system figures out what's variable.

## Phase 3 — In-app WYSIWYG editor

Lexical or TipTap, drag-drop field insertion, no Word needed at all. This
is the Enterprise-tier feature.

## Storage paths convention

Raw user templates: `user-templates/{user_id}/{template_id}.docx`
Filled outputs:     `template-outputs/{user_id}/{fill_id}.docx`

RLS policies enforce that users can only read/write their own folder.
