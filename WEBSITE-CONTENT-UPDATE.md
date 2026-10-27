> This describes the previous content expansion. **AUDIT-UPDATE.md** documents the latest page merges and navigation.

# Website content update — October 2026

This update adds the missing sections while retaining the existing design, PostgreSQL database, accounts and previous recorded-class/poster features.

## Update an existing Windows installation

1. Stop the running server with Ctrl+C. Back up the existing project folder and PostgreSQL database. In the OLD working folder, `npm run db:export -- logic-before-content-update.json` creates an application-data backup; keep it private. Use a new filename if it already exists.
2. Extract this ZIP into a different directory, for example `E:\ABi\Website\sample\logic-content-update\logicweb`. Do not replace your existing folder with the ZIP.
3. From the extracted NEW folder, run the updater against your OLD folder:

   ```bat
   cd /d "E:\ABi\Website\sample\logic-content-update\logicweb"
   node scripts\update-existing.js "E:\ABi\Website\sample\logicweb" --check
   node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
   ```

   The updater verifies every bundled file, checks for conflicting edits before writing, backs up overwritten code, and keeps existing public pages, `.env`, `data`, uploaded media and shared partials. It adds new public pages. If a file has unrecognised edits, it stops without modifying the project; merge that file before proceeding. The dated backup folder under `data/backups` contains a restore list.

4. Return to the existing project:

   ```bat
   cd /d "E:\ABi\Website\sample\logicweb"
   npm ci --include=dev
   npm run migrate
   npm run build
   npm start
   ```

   Keep your working PostgreSQL `.env` and existing admin account. Do not run `admin:create` again. `npm start` runs the source application; `dist` contains the complete deployment build. If a previous `dist` contains `.env` or runtime data, the build deliberately stops: back up and move that folder before building. Do not build over a running deployment.

5. Open `http://127.0.0.1:8080/admin/`, sign in, then choose **Website Content**. Refresh with Ctrl+F5. The direct address is `/admin/site-content.html`.

## Pages and CMS controls

| Public address | Content section in CMS |
| --- | --- |
| `/courses/ca-foundation` | CA Foundation |
| `/courses/ca-inter` | CA Intermediate |
| `/courses/ca-final` | CA Final |
| `/recruit-our-talent` | Recruit Our Talent |
| `/hiring-partners` | Hiring Partners |
| `/affiliations` | Affiliations & Collaborations |
| `/life-at-logic` | Life @ Logic |
| `/skill-development` | Skill Development |
| `/health-wellness` | Health & Wellness |
| `/asap-collaboration` | Logic & ASAP |
| `/logic-updates` | Logic Updates & Awards |
| `/meet-the-team` | Meet the Team |
| `/careers` | Join Our Team |
| `/batches` | Batch Schedule |
| `/testimonials` | Student Testimonials |

**More → Explore Logic** opens `/explore`, a directory of these pages and the existing student resources. **More → Make Payment** links to `https://epay.logiceducation.org/`. These entries are added once to existing custom menus, and can then be edited in Global Header. The existing CA overview links to all three new levels.

Choose a section, click **+ Add item**, fill in its fields and click **Save item**. Draft items remain hidden. Lower sort numbers appear first. Image fields offer upload and Media Library selection. **Page heading, introduction & links** controls the selected page’s text and main button. Descriptions accept plain text and line breaks. No Page Editor changes are required.

For hiring partners, affiliations and testimonials, **Show on homepage = Yes** publishes that item in the corresponding homepage section. Draft overrides that choice. Affiliations also appear on About. Update both the title and logo when changing an organisation. New images are stored in the existing Media Library.

Batches offer course, branch, year and mode filters. The date display field controls what visitors see; the optional start date is additional structured data. Update the year and display date together when changing an intake. Existing local batch rows and student videos are imported once, preserving their content. The added public-speaking row explicitly asks visitors to confirm the next intake; confirm all batch availability before publishing changes.

Employer and careers forms save to **Leads & Forms**, with distinct `Website Employer Recruitment` and `Website Careers` sources. Company, role, message and optional portfolio URL are retained in the database and lead export. Existing CRM settings determine whether they are forwarded; this update does not turn CRM on or send email.

Recorded classes remain at `/admin/recorded-classes.html`, including purchase links, thumbnails, demos and student-login settings. The fee-payment link uses the external existing portal; this update does not add a new checkout, payment gateway, order database or video-access system.

## Content requiring your input

- Add approved staff biographies/photos and actual job openings. The team and vacancy lists start empty because the original pages contained sample/unverified entries. Careers includes a working expression-of-interest form.
- Confirm the imported partner/affiliation roster and historical award images are suitable for your current site. These come from the main Logic website, not a newly verified contractual roster.
- Confirm course availability, batch dates and healthcare brochure terms. CA paper names were checked against ICAI’s current scheme; eligibility and fees remain linked to the official source instead of being copied from older course text.
- Existing PostgreSQL results, placements, users and recorded-class records remain in your installed database. No private live database has been downloaded. New or missing artwork must be added through CMS.
- Configure your real production origin, HTTPS, PostgreSQL credentials and any tracking/CRM IDs in your deployment. No live deployment or purchase was performed.

## Technical notes

Migration `004-website-content.sql` adds `website_content`. The one-time `website-content-import-v1` marker prevents subsequent starts from overwriting edits or restoring deleted items. Database export/import includes the new table and accepts older exports without it.

The mapped legacy WordPress course, contact, about, policy, insights, student-life, skills, recruitment, hiring-partners, careers, batch and ASAP addresses permanently redirect to their new pages, preserving query strings. The sitemap discovers all new public pages. Route redirects take effect on the Node server; retaining a WordPress domain’s traffic also requires routing that domain to this application.

Validation used an isolated PGlite database for automated checks; production continues to require PostgreSQL. See `verification/site-content.json` for the browser/integration results. No production credentials or runtime databases are bundled.
