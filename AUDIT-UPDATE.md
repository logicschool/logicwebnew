# Simplified website structure — October 2026

This update applies the page audit while preserving the existing green/yellow design, logos, typography, course pages, recorded-class sales links, results and poster animations.

## What changed

| Previous page | New location |
| --- | --- |
| Affiliations | About → Affiliations (`/about#affiliations`) |
| Logic Updates | About → Awards & Recognition (`/about#awards`) |
| Logic & ASAP | About → ASAP collaboration (`/about#asap`) |
| Hiring Partners | Placements → Hiring Partners (`/placements#hiring-partners`) |
| Skill Development | Placements → Skill Development (`/placements#skill-development`) |
| Placement Assistance | Placements → Assistance form (`/placements#placement-assistance`) |
| Health & Wellness | Life @ Logic → Health & Wellness (`/life-at-logic#health-wellness`) |

The previous addresses permanently redirect to the relevant section. Existing campaign query parameters are retained before the destination anchor. The merged URLs are excluded from the sitemap. The original HTML files remain in the package for compatibility and to preserve local edits; they are not additional public destinations.

ASAP is included in About because no separate current campaign/admissions brief was supplied. Its CMS content and programme links remain available.

Meet the Team is temporarily hidden while it has no published profiles. Its old URL redirects to the team-contact section on About. Publish an approved profile in CMS to activate the page and its sitemap entry; a Meet our team link then appears on About. Draft profiles do not activate it.

Explore Logic remains an optional directory at `/explore`, with updated section links. It is removed from the primary navigation and sitemap and marked noindex. Careers remains in the footer, retaining its expression-of-interest form. Recruit Our Talent remains linked from Placements and the footer, with its employer form.

## New navigation

Main menu: **Courses · Results · Placements · Recorded Classes · About · Contact**.

- Courses dropdown: All Courses, Batch Schedule, Career Test, Admissions and Make Payment.
- About dropdown: About Logic, Life @ Logic, Blog, Student Testimonials and Branches.
- Apply Now and WhatsApp retain their existing header buttons.
- Footer: About, Contact, Branches, Recruit Our Talent, Join Our Team and Make Payment, alongside the existing course/social/legal links.

Edit these in **CMS → Global Header**, including the new **Courses dropdown links** and **About dropdown links** controls. Extra custom navigation links are retained in the optional More menu. The migration saves the previous navigation in the database and runs once, so future CMS changes are not reset at startup.

## CMS editing

Continue using **CMS → Website Content** for partner logos, affiliations, skills, awards, ASAP and wellness. The manager displays each section’s new public location. Existing records, images, descriptions, draft states, order and heading settings are reused directly rather than copied into competing records.

The original Placement Assistance HTML remains the editable source for its full form and supporting text. The public Placements page includes that source. Its fields, WhatsApp contact and `Website Placement Assistance` lead source remain intact. Signed-in Page Editor previews can still access the source without following the public merge redirect. Edits to the surrounding Placements/About/Life page do not duplicate generated CMS sections.

## CA pages

Foundation, Intermediate and Final remain separate. Each now has introductory eligibility/preparation guidance, current ICAI links, batch links and an enquiry form with the corresponding course/source. Current batch records appear when the course name matches. Fees, dates and available learning modes are confirmed with admissions, not invented.

Use the relevant CA section’s **Page heading, introduction & links → Additional page text** to edit the guidance. Existing non-empty owner-written text is preserved during migration.

Eligibility references checked on 10 October 2026:

- https://icai-call-sahayata.icai.org/wp-content/uploads/2024/10/CA-Courses-.pdf
- https://www.icai.org/post/foundation-nset
- https://www.icai.org/post/intermediate-nset
- https://www.icai.org/post/final-nset

## Install into your existing Windows project

1. Stop the current server with Ctrl+C. Back up the project and PostgreSQL database.
2. Extract this ZIP into a **separate folder**. Do not extract over the working project.
3. Open Command Prompt in the extracted `logicweb` folder and run:

   ```bat
   node scripts\update-existing.js "E:\ABi\Website\sample\logicweb" --check
   node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
   ```

   A preflight conflict means a file has local edits that need merging. The updater stops before changing anything and lists the affected files. It backs up overwritten code, adds new files, and preserves your existing public HTML, shared partials, `.env`, database and uploaded media.

4. Return to the existing project and run:

   ```bat
   cd /d "E:\ABi\Website\sample\logicweb"
   npm ci --include=dev
   npm run migrate
   npm run build
   npm start
   ```

   Keep your current `.env` and admin account. Do not run `admin:create` again. If `dist` contains runtime data or `.env`, back it up and move it before building; the build protects configured deployment folders.

5. Open `http://127.0.0.1:8080/` and `/admin/`. Refresh with Ctrl+F5.

`npm start` runs the source application. `dist` contains the complete Node deployment build. The Node server must handle the public URLs for redirects and database-backed sections to work. No live deployment has been performed.

## Verification

Automated checks use an isolated PGlite test database. Production still uses your PostgreSQL connection. The checks cover CMS data appearing in parent sections, redirects/query strings, team visibility, sitemap, desktop/mobile menus, form submissions and Page Editor round trips. See `verification/audit-update.json` for the results.
