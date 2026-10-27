# PostgreSQL website — start here

The original design is preserved. All supplied public HTML, CSS, frontend JavaScript, images, course pages and shared header/footer templates are unchanged. Result subpages now render poster images without visible titles, captions, category introductions or level headings. The existing back link, poster styling, animation and image lightbox remain. Result titles are optional in the CMS; older metadata is retained in the database.

## What to run

Use Node.js 22 or later and a running PostgreSQL server. Run commands inside `logicweb`, where `package.json` is located. The correct build command is **`npm run build`**.

### New PostgreSQL database

In pgAdmin, connect to the existing `postgres` database as an administrator. Run these statements separately, using your own password:

```sql
CREATE USER logic WITH PASSWORD 'YOUR_UNIQUE_DATABASE_PASSWORD';
CREATE DATABASE logic OWNER logic;
```

If this database/user already exists, reuse it instead of recreating it.

On Windows CMD:

```bat
npm ci --omit=dev
copy .env.example .env
```

On Linux use `cp .env.example .env`. Do not overwrite an existing `.env`: edit it instead.

In `.env`, set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` and `PGPASSWORD` to your actual PostgreSQL details. The defaults expect a local database named `logic` on port 5432. Remove any old `DEV_DATABASE=pglite` setting and clear any old `DATABASE_URL` if using the separate PG fields. A nonempty `DATABASE_URL` takes precedence.

Generate values for SESSION_SECRET and TOTP_ENCRYPTION_KEY with:

```bat
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice, and use a different value for each setting. When transferring existing accounts, **retain the existing TOTP_ENCRYPTION_KEY** so enrolled two-step verification still works. Keep your `.env` private.

For a NEW database only:

```bat
npm run db:check
npm run migrate
```

Temporarily set `ADMIN_USERNAME` and a unique `ADMIN_PASSWORD` of 12–72 bytes in `.env`, then:

```bat
npm run admin:create
```

Remove `ADMIN_PASSWORD` from `.env` afterwards. If an admin already exists, skip this step.

```bat
npm run build
npm start
```

Open `http://127.0.0.1:8080/` and `http://127.0.0.1:8080/admin/`.

`npm start` runs the complete website from the source folder. `npm run build` also produces a complete deployable copy in `dist/`. A successful build does not create a database or test your own database credentials. `npm run db:check` does that.

## Preserve current saved CMS data

The supplied ZIP was configured for PGlite, not an external PostgreSQL server. Its `data/dev-db` binary copy could not be opened in verification and contains no WAL segment files. A byte-for-byte archive of that original folder is included at `legacy-backup/dev-db.zip`. It has NOT been silently replaced with a new database. The file-based content seeds, uploads, configuration and historical leads are retained in the source package.

If you have saved CMS changes, export from the **working original installation before switching database settings**. Copy the new `scripts/db-transfer.js` into that installation (same `scripts` folder). Stop website writes while exporting:

```bat
node scripts/db-transfer.js export data/postgres-export.json
```

This reads the database selected by that installation's `.env`, preserves content and account hashes, and refuses to overwrite an existing export file. Keep the export private.

Copy the export to this updated installation and configure the target PostgreSQL connection. The target must be an empty database: **do not run `npm run migrate`, `npm start` or `npm run admin:create` before import**.

```bat
npm run db:import -- data/postgres-export.json
npm run migrate
npm run db:check
npm run build
npm start
```

Import creates the schema and imports records in a single transaction. It refuses to overwrite any existing content. Browser sessions are not copied; admins sign in again. Do not resend imported leads to Odoo. Retain the existing encryption key, uploads and `data/integrations.json`.

If the live site already uses PostgreSQL, point the updated application at that same database and run `npm run migrate`. The repeat migration preserves existing CMS data. Do not import the older development database over the live database.

## AWS / production deployment

Back up the live PostgreSQL database, `.env`, `data`, uploads, edited HTML, assets and partials first. Keep the current installation available for rollback.

The source folder can be deployed directly and started with `npm start`, using the supplied systemd and Nginx examples in `deploy/`. Set:

```dotenv
NODE_ENV=production
PUBLIC_ORIGIN=https://site.logiceducation.org
HOST=127.0.0.1
PORT=8080
TRUST_PROXY=1
```

Use `TRUST_PROXY=1` only when exactly one trusted reverse proxy is in front of Node. Point Nginx at the Node service; this application cannot run as an S3/static-only site. Configure PostgreSQL details for the actual local server or RDS endpoint. For RDS TLS, set `PGSSL=true` and `PGSSLROOTCERT` to the installed RDS CA certificate. Do not add competing SSL parameters to `DATABASE_URL`.

To deploy the build instead, copy the complete `dist/` directory to a **new deployment folder**, run `npm ci --omit=dev` there, and bring over the existing `.env`, `data/integrations.json`, `data/leads.ndjson` if still awaiting import, logs/backups as needed, and current uploads. Preserve newer live HTML/assets/partials edited since this ZIP. Then migrate or import as described above and run `npm start` from that folder. `npm run start:build` is also available from the source folder once `dist/.env` is configured.

The build excludes credentials, database binary files, old logs and backups. Do not rebuild into a live `dist` folder; the builder refuses a configured/used output folder to help prevent overwriting CMS edits. Build in a separate staging directory instead.

Verify `/api/health`, admin login, one result upload, a course page, a lead form and Odoo source mapping on staging before switching traffic. Keep existing upload/proxy limits and writable filesystem permissions. The browser-facing clean URLs and `.html` redirects are retained.

## Database checks in pgAdmin

```sql
SELECT current_database();
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT username, created_at FROM admin_users;
SELECT id, data->>'categoryId' AS category, data->>'image' AS poster FROM results;
```

See `CHANGES-POSTGRESQL.md` and `VERIFICATION-POSTGRESQL.md` for the changed files and completed checks. Existing older setup guides remain for reference; use this guide for this update.

Connection configuration follows the official node-postgres documentation: https://node-postgres.com/features/connecting and https://node-postgres.com/features/ssl.
