# Placement posters: images only

Placement posters now display only the image, without the title or details below it. Existing poster images, CMS records, scrolling, fades and image enlargement are preserved. The CMS name is optional and is used to identify images and provide accessible image descriptions.

## Update from the previous partner/affiliation release

Copy these two files from this package into the matching folders of your existing website:

- server/services/gallery.js
- admin/content.js

Restart the Node server, then hard-refresh the CMS (Ctrl+F5). If you run the built website, run npm run build before starting it again. No database migration is needed for this change. Keep your existing .env and uploads.

For older versions, use the included safe updater from a separately extracted copy, following AUDIT-UPDATE.md.
