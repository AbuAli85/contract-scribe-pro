# Template PDFs

Drop the bilingual contract PDFs here. Filenames must match the `id` field in
`src/lib/templates.ts`:

| Template ID       | File                       |
| ----------------- | -------------------------- |
| `employment`      | `employment.pdf`           |
| `nda`             | `nda.pdf`                  |
| `service-agreement` | `service-agreement.pdf`  |
| `freelance`       | `freelance.pdf`            |
| `tenancy`         | `tenancy.pdf`              |
| `partnership`     | `partnership.pdf`          |
| `sales-purchase`  | `sales-purchase.pdf`       |
| `hr-bundle`       | `hr-bundle.pdf` (Pro only) |

Optional: drop low-res preview PDFs (single page) into `previews/` with the same
filename — `TemplateCard` will use these for the Preview button. Falls back to
the full PDF if no preview is found.

All paths are publicly downloadable. Treat these PDFs as marketing assets, not
sensitive content.
