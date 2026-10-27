# Recorded classes page

Open `/recorded-classes` (locally: http://127.0.0.1:8080/recorded-classes).
The page uses the website's existing fonts, colours, buttons and shared header/footer.

## Update an existing installation

Back up these files first. Copy only the following from this ZIP's `logicweb` folder:

- `recorded-classes.html` — new page
- `assets/recorded-classes.css` — page-specific styling
- `assets/recorded-classes.js` — course filters
- `assets/images/recorded-classes/` — all three course thumbnails
- `server/services/layout.js` — adds Recorded Classes to the default More menu and footer; retains the WhatsApp icon fix
- `sitemap.xml` — adds the page to the static sitemap (the server also discovers it automatically)

Keep your existing `.env`, database, uploaded media and other edited pages. No new dependency or database migration is needed. Restart `npm start` and refresh with Ctrl+F5.

If you use the built deployment, run `npm run build` in a separate source directory and deploy the new files from `dist`. Do not build over a live CMS directory. Preserve its `.env`, data and uploads.

## Header and footer

The default More menu and default footer include Recorded Classes. If you previously saved custom menu lists, they are preserved. In CMS > Header, add a More link with label `Recorded Classes` and URL `/recorded-classes`. Add the same URL to CMS > Footer > Quick Links if needed.

## Editing courses

CMS > Pages > Recorded Classes opens the normal page editor. Edit the heading, course titles, faculty names, chapter/content counts, image and button URL. Page HTML can also be edited directly in `recorded-classes.html`.

To add another course, duplicate an entire `<article class="recorded-card">` block in the page's HTML. Set `data-recorded-category` to `ca-inter`, `ca-final`, `cma-usa`, `cma-inter` or `cat`. For a newly available course, remove `recorded-upcoming`, replace its placeholder with an image, and use its real product URL. Filters deliberately remain hidden in CMS preview so all cards can be edited. With JavaScript disabled, all courses remain visible and the purchase links still work.

## Purchase flow and content source

The three course cards reuse the product destinations and thumbnails from https://logiceducation.org/recorded-classes/ as checked on 10 October 2026:

- CA Inter Auditing — CA Revathy Raja; 2 chapters, 57 contents.
- CA Inter IDT — CA Appu Gopinath; 15 chapters, 60 contents.
- CA Final Auditing — CA Revathy Raja; 1 chapter, 20 contents.

CMA USA, CMA Inter and CAT are upcoming on the reference page. They have enquiry buttons, not purchase buttons. The recorded-class support number on that page is 9356577077.

Demo / Buy Now opens the corresponding Logic Testpress product URL in the same tab. Student login and the learning-platform link open https://logiceducation.testpress.in/. Those public product URLs currently redirect to the Testpress sign-in page. Confirm the product visibility, current price, syllabus, access period and checkout with a student account before announcing sales. No payment was attempted during validation.

This update provides the catalogue and the existing external purchase flow. Payments, student accounts and video access remain managed by Testpress. It does not add a new payment gateway or collect card details in this website. There are no invented prices or access guarantees.

## Verification

Run `npm run build`, then `node test/recorded-classes-browser.cjs`. The browser check uses an isolated local development database. It checks clean URLs, course filtering, purchase link targets, local thumbnails, mobile layout, CMS page discovery and default navigation. It does not complete a payment.
