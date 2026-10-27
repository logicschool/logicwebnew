> **Latest: automatic YouTube thumbnails for class previews, testimonials and recorded-class demos.** See **VIDEO-THUMBNAIL-UPDATE.md** for setup and usage.

> **Reference-inspired homepage content flow, detailed course cards and CMS-managed learning/faculty/class/resource sections.** See **CONTENT-LAYOUT-UPDATE.md** for safe installation and editing.

> **Placement posters display images only, without visible titles or captions.** See **PLACEMENT-POSTER-UPDATE.md** for installation.

> **Compact partner and affiliation strips, six per desktop row, with auto-scroll and faded edges.** See **PARTNER-LOGO-UPDATE.md** for installation.

> **Back to All Courses button.** See **COURSE-BACK-UPDATE.md** for installation.

> **Batch schedule display fix.** Start with **BATCH-UPDATE.md** for safe update commands and CMS editing.

> **Previous update: simplified navigation and merged pages.** Start with **AUDIT-UPDATE.md** for installation and the new page/CMS locations.

> **New pages and content manager:** Read **WEBSITE-CONTENT-UPDATE.md** for the safe update commands, page addresses and CMS guide.

> **PostgreSQL / build update:** Start with **START-HERE-POSTGRESQL.md**. Build with `npm run build`; the complete output is in `dist/`. Existing design assets are unchanged.

> **CMS 7.1 update:** Read **UPDATE-CMS-7.1.md** before updating an existing installation. The full project is included; the Windows update helper preserves current content and accounts.

# Logic School website — CMS 7

Updated version of the supplied website, preserving the existing HTML/CSS design and visual editor.

Start with **SETUP.md**. Requires Node.js and PostgreSQL for production. It cannot run on static hosting alone.

- `npm ci --omit=dev`
- Configure `.env` from `.env.example`
- `npm run migrate`
- `npm run admin:create`
- `npm start`

Open `/admin/` for the visual CMS and `/admin/content.html` for blog, programmes, results, branches and two-step verification.

See **CHANGELOG.md**, **DATABASE.md**, **SECURITY.md** and **VERIFICATION.md**. Legacy `V6*.md` files are retained as historical notes; the new setup and security documents supersede their deployment/authentication guidance.
