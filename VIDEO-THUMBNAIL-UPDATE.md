# Automatic YouTube thumbnails

Paste a full YouTube video link into any of these CMS fields:

- Website Content → Class Previews → Video / demo link
- Website Content → Student Testimonials → Video link
- Recorded Classes → Separate demo link

The thumbnail URL and image preview fill automatically. Normal watch links, youtu.be share links, Shorts, live-video links and embed links are supported. Save the record as usual to publish it. No API key is required.

Changing the video link updates a previously automatic thumbnail, including after reopening a saved record. A custom uploaded or selected image is preserved. Click **Use video thumbnail** to replace a custom image with the video's thumbnail.

Other platforms, including Instagram, Vimeo and direct video files, still require a custom image. A link must identify an individual YouTube video, not a playlist or channel. Thumbnails are loaded from YouTube rather than copied into Media Library. Private, deleted or unavailable videos may not provide a usable image; choose a custom thumbnail in that case. The application does not fetch arbitrary video URLs on its server.

Existing records are not bulk-replaced. To update an older thumbnail, open its record, click **Use video thumbnail**, then save. For supported YouTube links, saving a record with a blank image also generates the thumbnail on the server.

## Install

Stop the existing Node server. Extract this ZIP to a separate folder and, from the new `logicweb` folder, run:

```bat
node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
cd /d "E:\ABi\Website\sample\logicweb"
npm run build
npm start
```

Substitute your actual existing folder if different. Keep the existing .env, uploads and PostgreSQL database. If you run the built deployment, deploy the rebuilt dist folder normally. No new database migration or credentials are required. Hard-refresh the CMS with Ctrl+F5.

Changed runtime files: assets/video-thumbnail.js, admin/cms-tools.js, admin/site-content.js, admin/site-content.html, admin/recorded-classes.js, admin/recorded-classes.html, server/services/site-content.js and server/services/recorded-classes.js.

Validated URL parsing, custom-image preservation, server saves, CMS paste/change/reset actions, save/reload and public rendering. Build output includes all dependencies for this feature.
