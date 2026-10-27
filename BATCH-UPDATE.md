# Batch schedule fix — 10 October 2026

## What changed

- Fixed the issue where every batch row became just `2026`. The footer year script was replacing the contents of every element with `data-year`, including the batch rows. Batch filters now use their own attributes, and the year script targets the footer only.
- Matched the main site's schedule structure: Branch, Course and Year filters; Branch, Course, Starting Date / Batch and Time & Mode columns.
- Kept the existing website colours, typography, header, footer and CMS. The table scrolls horizontally on smaller screens.
- Refreshed the 12 untouched bundled batch records using https://logiceducation.org/batch-scheduled/ as checked on 10 October 2026. This is a one-time content refresh, not an automatic connection to the main site.
- CMS-edited records, drafts, added records and deleted records are preserved. Only records that still exactly match the previous bundled defaults are refreshed. Later CMS edits remain authoritative.
- The source website lists `SUNDAY CLASSES 10 AM -1PM` in the public-speaking Branch field; it is retained as published. Change this in the CMS if a different branch should be shown.

## Update your existing installation

Stop the running server. Extract this ZIP into a separate folder. From the extracted `logicweb` folder, run:

```bat
node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
cd /d "E:\ABi\Website\sample\logicweb"
npm run migrate
npm run build
npm start
```

Use your actual existing folder path if different. The updater preserves `.env`, PostgreSQL data, uploads, accounts and existing public-page files. It stops before writing if a code file contains unrecognised custom changes. Do not overwrite your existing folder with the entire ZIP.

The table fix is applied by the server renderer, so an older `batches.html` in your existing installation is supported. The `dist/` folder in this ZIP contains a clean, complete npm build. If your own `dist/` contains runtime data or `.env`, the build command will refuse to overwrite it; preserve that configured deployment before rebuilding.

Open http://127.0.0.1:8080/batches (or your configured address). Refresh with Ctrl+F5 after restarting.

## Edit the schedule

Go to **CMS → Website Content → Batch Schedule**, or `/admin/site-content.html#batches`.

Add or edit Course / batch name, Branch, Start date, Batch / date display text, Year, Class timing, Learning mode, Visibility and Sort order. **Batch / date display text** is what the public table shows; Start date is optional metadata. The table combines Class timing and Learning mode. Publish the item to display it; drafts stay hidden. The filters are generated from published records.

## Verification

- `npm run build` and all four `npm test` suites passed.
- `node test/batch-browser.cjs` passed against the built app: full row content after scripts execute, three combined filters, empty state, CMS draft/publish/edit, future-year records, footer year, Page Editor round-trip and desktop/mobile layouts.
- Migration tests verify that user changes, drafts, additions and deletions survive the one-time refresh.
- Automated database checks used isolated PGlite test databases. Your live PostgreSQL database and website were not accessed or changed.
