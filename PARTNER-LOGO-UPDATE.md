# Compact partner and affiliation logo strips

The placement/hiring-partner logo tiles are now 96 px tall with 14 px padding. Logos use `object-fit: contain` so the entire image remains visible.

- Wide desktop containers: 6 logos per row.
- Smaller desktop containers: 5 logos per row.
- Tablets: 4 logos per row.
- Phones: 2 logos per row.

The layout responds to the space available inside the CMS preview as well as the public website. The existing homepage logo animation is preserved with smaller tiles; the static hiring-partner grid uses the same sizes. Affiliations now use the same compact auto-scrolling strip with fading edges on the homepage and About page. The CMS preview remains a static editable grid. Reduced-motion preferences stop automatic movement. Result/placement posters are unaffected.

## Install just this change

From this package, copy these three files into the same locations in your existing project:

1. `assets/partner-layout.css` (new file).
2. `server/services/render.js` (updated file).
3. `assets/site.js` (updated file).

The renderer includes all preceding fixes delivered in this conversation. If you have independently modified that code file, merge its partner-layout stylesheet changes instead of overwriting your edits. This change does not replace HTML pages, logos, uploads or database records.

Stop and restart the Node server. If you run the built version, run `npm run build` from the source project and restart the built deployment. Refresh the browser with Ctrl+F5.

## Apply the complete cumulative update

Stop the existing server, extract this ZIP into a separate folder, and run from its `logicweb` folder:

```bat
node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
cd /d "E:\ABi\Website\sample\logicweb"
npm run migrate
npm run build
npm start
```

Use your actual project path if different. The updater preserves existing public HTML, uploads, accounts and `.env`, and stops before writing when it detects unfamiliar code changes.

The complete clean npm build is included in `dist/`. Layout checks cover 1440, 1238, 950, 768 and 390 px viewport widths, the CMS preview, full-logo fitting and the homepage animation. Short affiliation lists repeat seamlessly; decorative duplicates are excluded from keyboard navigation and assistive reading.

## Manage affiliation logos

Use **CMS → Website Content → Affiliations & Collaborations** to add or replace logos. Publish the item and choose **Show on homepage: Yes** to include it in the homepage strip. Published affiliations also appear on About. No Page Editor HTML changes are needed.
