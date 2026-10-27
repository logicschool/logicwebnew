# Logic content layout update

The homepage follows the content flow of the supplied JK Shah reference, using Logic's existing green/yellow colours, fonts, cards, imagery and course information. This is an adaptation of the content arrangement, not a copy of the other institute's claims, students or faculty.

## What changed

- Compact institute statistics above the hero.
- Detailed three-column course cards on desktop, with overview, audience, duration/course route and optional learning mode. Cards stack on mobile.
- Course and enquiry actions on every course card. A brochure action appears when that course has an enabled, uploaded brochure in CMS.
- Homepage sequence: statistics, hero, courses, learning support, hiring partners, published faculty, Why Logic, student stories, results, career support, class previews/recorded classes, resources, blog, campuses, affiliations, FAQs and callback form.
- Published result posters can appear in a small homepage preview without visible captions. The existing Results index and alternating subpage sliders remain separate.
- Course detail pages now show matching published batches and recorded learning options before the enquiry section. Existing CA-level pages retain their batch sections.
- New content uses the existing PostgreSQL CMS. Existing page text, forms, images and shared navigation are retained.

## Edit from CMS

| Content | CMS location |
| --- | --- |
| Homepage course overview, audience, route, mode, icon and links | Programmes |
| Learning-support cards and heading | Website Content → Learning Support |
| Faculty names, photos and profiles | Website Content → Faculty Profiles |
| Class thumbnails and video links | Website Content → Class Previews |
| Resource cards and heading | Website Content → Student Resources |
| Course batches | Website Content → Batch Schedule |
| Recorded classes, demos and purchase links | Recorded Classes |
| Existing hero, statistics, Why Logic and FAQ copy | Page Editor → Home |
| Partner and affiliation logos | Website Content → Hiring Partners / Affiliations & Collaborations |

Save an item as Published to display it. Faculty stays hidden until approved profiles are published. If no class previews are published, the homepage uses available recorded-class demos, or links to the recorded-class catalogue. Headings and introductions for the four new sections are editable in their Page Settings form. Empty learning, faculty and resource sections are hidden.

The All Courses catalogue retains its existing Page Editor content; the Programmes controls above manage the homepage cards. Fees and seat counts have not been invented: visitors can confirm current information with admissions.

## Update an existing Windows installation

1. Stop the running Node server with Ctrl+C. Extract this ZIP into a separate folder.
2. Open a terminal in the newly extracted `logicweb` folder and run the safe updater, pointing it at your existing project:

```bat
node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
cd /d "E:\ABi\Website\sample\logicweb"
npm run build
npm start
```

Use your actual existing project path if different. If you deploy the built folder, deploy the complete rebuilt `dist` folder through your normal process. Do not replace the existing `.env`, uploads or PostgreSQL database. The updater backs up changed code and stops on unrecognised local changes. No new database credentials or admin account are needed.

On the next start, a one-time update adds the initial learning-support and resource cards and fills missing homepage course overviews from your existing course pages. It preserves custom overview fields and does not restore cards you later delete. Hard-refresh the browser with Ctrl+F5 after restarting.

## Validation

- Existing authentication, CSRF, uploads, forms, global layout, gallery and migration tests passed.
- Browser checks cover desktop/tablet/mobile widths, course filtering, course batch sections, faculty publishing through CMS, editable headings, Page Editor save/reload and preservation of deleted items.
- `npm run build` produces the complete Node/PostgreSQL deployment folder.

Reference reviewed: https://jkshahclasses.com/ on 13 October 2026. The reference browser view remained on its loading screen; its retrieved page content supplied the section sequence. No live Logic site has been deployed by this update.
