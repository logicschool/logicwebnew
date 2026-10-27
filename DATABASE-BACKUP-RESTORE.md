# Logic CMS database backup and restore

## Install

Replace the matching files in your existing project with this update. Keep your existing `.env`, uploads and other server data. Run `npm ci` if dependencies are not already installed, then restart the CMS with `npm start` (or your existing process manager).

Open **Admin → Database Backup & Restore**, or `/admin/database-backups.html`.
The feature uses the existing PostgreSQL connection in `.env`; no pg_dump installation or database migration is required. PGlite development mode deliberately disables backup/restore in the admin UI.

## Create and download

Enter your current admin password and click **Create database backup**, then **Download**. A private server copy remains in `data/database-backups`. Download another copy to a separate device; server copies alone are not disaster recovery.

Backups are versioned JSON data snapshots, not SQL dumps. All 14 CMS application tables are included: content, settings, admin accounts, results, leads, media metadata and duplicate-submission keys. Rows are read in a consistent PostgreSQL transaction. Session data is excluded, and the installed schema/migration history is preserved rather than replaced.

Not included: uploaded images/PDFs, website source files, local integration configuration, `.env`, database roles or database schema definitions. Back up the website folder and configuration separately. The existing Developer file-backup feature is separate. Maximum JSON backup size is 25 MB; larger databases need server-managed PostgreSQL backups.

## Restore

1. Schedule a maintenance window. For a deployment with multiple CMS instances, stop all but the instance performing the restore, then restart every instance afterward to refresh their caches.
2. Choose a trusted JSON backup created by this page, enter your current admin password and type `RESTORE`.
3. Confirm the replacement. Keep the page open until completion.
4. Sign in again using an admin account from the backup. Retain the original `TOTP_ENCRYPTION_KEY` if those accounts use two-factor authentication.

The service checks the format, tables, columns, required accounts, site settings and 2FA key compatibility before deleting anything. It locks application tables, writes a `before-restore-…json` recovery copy, then replaces records in one transaction. Database errors roll back the replacement. A PostgreSQL advisory lock prevents overlapping backup/restore jobs. Normal database writes can wait during restore; the maintenance window avoids lost intervening edits and interrupted lead submissions.

If a restore succeeds but you need to undo it, sign in and restore the corresponding `before-restore` file. If backup accounts are inaccessible, use the existing server-side `npm run admin:create` procedure. Files remain private and are downloadable only through authenticated admin endpoints. Protect them because they contain personal data and password hashes.

No backup files are deleted automatically. Monitor disk space and have the server administrator remove obsolete copies. Keep enough free space for a recovery copy. Configure your reverse proxy to allow JSON requests of at least 27 MB and long-running requests during a restore. A browser timeout does not prove rollback: check the CMS and server logs before retrying.

## Verification

`npm test` includes backup round-trip, recovery-copy contents, duplicate-key rollback, malformed/mismatched backup rejection, 2FA-key mismatch, password checks and download-path validation. Database tests use PGlite's PostgreSQL engine with the advisory-lock call stubbed; they do not verify a live PostgreSQL server or production deployment. Perform a trial on a staging PostgreSQL database before production use.
