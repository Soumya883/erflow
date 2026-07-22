const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_lPaRVs1kyTr6@ep-summer-pond-au60ur0i-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  try {
    const res = await pool.query('SELECT * FROM "User"');
    console.log("Users in DB:", res.rows);
  } catch (err) {
    console.error("Query Error:", err);
  } finally {
    await pool.end();
  }
}
main();
