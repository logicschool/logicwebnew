require('dotenv').config({quiet:true});const {connect}=require('../server/services/db');const {seed}=require('../server/services/seed');
(async()=>{const db=await connect();try{await db.migrate();await seed(db);console.log('Migration and one-time content import complete.');}finally{await db.close();}})().catch(e=>{console.error(e.message);process.exitCode=1});
