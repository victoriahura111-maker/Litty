# Notion import files — Litty improvement checklist

Two ways to get the checklist into Notion. Both are generated from the same source, so pick one (or both).

| File | What it is | How to import |
| --- | --- | --- |
| `Litty-Improvement-Checklist.md` | The full checklist as a Notion page: headings, to-do checkboxes (184), tables, code blocks, “Done when” callouts. | **Settings → Import → Text & Markdown**, or drag the `.md` file onto a page. |
| `Litty-Tasks.csv` | The same 184 tasks flattened into rows, for a Notion task database. Columns: `ID`, `Task`, `Section`, `Priority`, `Parent`, `Done`. | **Settings → Import → CSV**. Notion creates a new database. |

Files must be imported as UTF-8 (they contain `—`, `→`, `·`, curly quotes).

## Markdown page import

1. In Notion: `Settings` → `Import` → `Text & Markdown`, then select
   `Litty-Improvement-Checklist.md`.
2. Notion uses the **file name** as the page title, so rename the page to
   “Litty — Improvement Checklist” after import.
3. All 184 items land as to-do blocks, nested where the original was nested.
   Tick boxes as you go; Notion keeps the checked state.
4. The baseline table imports as a table block. If your workspace shows it as
   raw `|` text instead, see “Fallback” below.

## CSV database import

1. `Settings` → `Import` → `CSV` → choose `Litty-Tasks.csv`.
2. Notion creates a database with text properties. Convert them once:
   - `ID` → Title (or keep `Task` as Title and `ID` as Text)
   - `Priority` → Select
   - `Section` → Select
   - `Parent` → Text
   - `Done` → **Checkbox** (`false` becomes unchecked)
3. Suggested views: Board grouped by `Priority`, then filter `Done = false`;
   or Table grouped by `Section`.

## Fallback if the markdown table does not convert

Replace the `| Metric | Baseline | Target |` block with this list, or paste the
table into a Notion table manually:

- Initial page transfer — 469 KB → < 150 KB
- Font Awesome payload — ~300 KB (CSS + 3 font files) → 0 KB
- CSS — 246 KB measured, ~83% unused on home; 45 local `@import`s → one bundled file, < 50 KB
- LCP (cold, local) — ~2.18 s → < 1 s fast connection; < 2.5 s mobile
- CLS — 0.0005 → < 0.1
- DOM nodes (home) — 295 → < 800
- Accessibility basics — labels, names, `lang`, one `h1` pass → no critical axe issues

## Regenerating

`Litty-Tasks.csv` is generated from the markdown, so edit the `.md` first, then:

```bash
python3 notion/make-tasks-csv.py
```

The script reads `notion/Litty-Improvement-Checklist.md`, numbers tasks per
section (`0.01`, `4.07`, …), derives `Priority` from the section, and writes
`notion/Litty-Tasks.csv`.
