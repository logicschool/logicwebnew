# Verification

- `npm ci --no-audit --no-fund`: passed, 197 packages installed.
- `npm run build`: passed; production folder includes server services, migrations, runtime scripts, templates, design assets, uploads and content seeds.
- `npm test`: 2 integration suites passed, 0 failures. Covered login/sessions, CSRF, content publishing, sanitization, result categories, uploads, forms/source routing, brochure gating, repeated migrations, shared settings and two-step verification/recovery codes.
- Built-app browser test: passed at 1440px and 390px with no JavaScript errors or horizontal overflow. Verified image-only result markup, title-free result validation/storage, hidden banner captions, and lightbox open/Escape close.
- Built-app smoke checks: homepage, About, CA course, Results, Placements, admin and health endpoint returned HTTP 200. Legacy result URL returned HTTP 301 with its query string preserved.
- Original public HTML, CSS, frontend JavaScript, shared templates and media compared byte-for-byte to the input archive: all unchanged. See `verification/design-preservation.json` for the exact file list.

## Limits

Automated database/runtime tests used isolated PGlite (PostgreSQL engine in WebAssembly) test databases, not your external PostgreSQL server. External PostgreSQL credentials were not supplied; actual server connectivity, the PG session store, TLS and the cross-database import must be checked on your staging installation. The PostgreSQL connection is configured using the official pg client; `npm run db:check` is provided for deployment verification.

The original embedded database in the ZIP could not be opened; no saved CMS records were claimed to have been imported from it. Use a logical export from the working installation, as explained in START-HERE. Existing local binary data is preserved in the backup archive.

The live URL could not be accessed by the inspection tool. Design preservation was checked against the supplied website ZIP. Browser tests blocked outside services and did not submit to live Odoo, analytics or messaging services. Screenshots use temporary QA poster records; those records are not included as live seed content.
