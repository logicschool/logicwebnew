'use strict';
// Refresh only untouched bundled rows. Never restore a deleted row or replace CMS edits.
async function seed(db){
 const {updates}=require('./batch-schedule-update.json');
 await db.query(`WITH claim AS (
   INSERT INTO global_settings(id,data) VALUES('batch-schedule-october-2026-v1','{"done":true}'::jsonb)
   ON CONFLICT DO NOTHING RETURNING id
 ), changes AS (
   SELECT item->>'id' AS id,item->'before' AS before,item->'after' AS after
   FROM jsonb_array_elements($1::jsonb) item CROSS JOIN claim
 ) UPDATE website_content AS existing SET data=changes.after,updated_at=now()
 FROM changes WHERE existing.id=changes.id AND existing.data=changes.before`,[JSON.stringify(updates)]);
}
module.exports={seed};
