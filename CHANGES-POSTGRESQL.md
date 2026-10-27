# Changed files

- `.env.example`: PostgreSQL-first local configuration; production/TLS guidance is in START-HERE.
- `.gitignore`: excludes build output and private database exports.
- `package.json`: adds build, built-server start, database check/export/import and focused browser-test commands. Dependencies are unchanged.
- `server/services/db.js`: standard PostgreSQL environment fields, connection timeout, connection validation, optional verified CA, explicit backend flag. PGlite remains a development/test option only.
- `server/app.js`: PostgreSQL-backed sessions also work with PGHOST configuration; result subpages contain posters without headings/descriptions/group titles.
- `server/services/content.js`: result cards render images only; optional existing metadata remains available as image alternative text.
- `server/services/gallery.js`: result-subpage banner captions are not rendered; listing and placement captions remain unchanged.
- `scripts/build.js`: validates JavaScript/JSON and assembles the complete production application in dist without transforming design files.
- `scripts/start-build.js`: starts the built application from its own working directory.
- `scripts/db-check.js`: checks PostgreSQL connectivity, schema and admin account presence.
- `scripts/db-transfer.js`: private logical export and transactional empty-target PostgreSQL import.
- `scripts/migrate.js`, `scripts/admin-create.js`: close database connections on errors; explain duplicate admin usernames.
- `test/integration.test.js`: verifies poster-only result markup.
- `test/posters-browser.cjs`: tests the built app on desktop/mobile, title-free publishing, hidden captions, lightbox and clean URLs.
- `README.md`, `START-HERE-POSTGRESQL.md`, this file and `VERIFICATION-POSTGRESQL.md`: instructions and validation.
- `verification/`: current test report, screenshots and design-preservation comparison.
- `legacy-backup/dev-db.zip`: unchanged original embedded database files, retained as a backup.
- `dist/`: complete generated production build.

No original public HTML, CSS, frontend scripts, header/footer templates or media were changed. Existing clean URL redirects, forms, Odoo integration code, tracking, upload code and the CMS's optional result-title behavior remain.

The delivery excludes machine-specific node_modules, Git internals, the original secret .env, stale test-output images and the unpacked legacy PGlite data. Retain the working installation's .env and encryption key when updating, and follow the PostgreSQL migration guide.
