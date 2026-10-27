# Back to All Courses button

Added a `← Back to All Courses` button above the heading on every individual course page, including CA Foundation, Intermediate and Final. It always opens `/courses`, including when a visitor opens a course directly. The button matches the existing green hero styling and works on mobile and with keyboard navigation.

The server adds the button, so existing CMS-edited course files are preserved. Page Editor saves do not duplicate the button. All previous updates, including the batch schedule fix, are included.

## Update on Windows

Stop your running server and extract this ZIP into a separate folder. Open CMD inside the extracted `logicweb` folder and run:

```bat
node scripts\update-existing.js "E:\ABi\Website\sample\logicweb"
cd /d "E:\ABi\Website\sample\logicweb"
npm run migrate
npm run build
npm start
```

Substitute your existing project path if different. The updater preserves your `.env`, database, accounts, uploads and existing public-page files. Refresh the browser after restarting.

For a manual update from the immediately preceding batch-fix package, the feature itself changes only `server/services/render.js` and adds `assets/course-navigation.css`. Restart the Node server after replacing these files. If using `dist`, rebuild from the updated source before restarting that deployment.
