// GET /api/debug/db-test
// Visit this directly in your browser - no sign-in needed. Tests the
// database connection in isolation, so we can tell immediately whether the
// SSL fix actually worked, without going through the whole Google sign-in
// flow just to find out.
//
// Delete this route once things are working - it's a diagnostic tool, not
// meant to stay in a real app (it doesn't leak secrets, but no reason to
// keep an unauthenticated DB-touching endpoint around longer than needed).
import { sql } from '../../../../lib/db.js';

export async function GET() {
  const result = { step: 'starting' };

  try {
    result.step = 'checking env vars';
    result.hasPostgresUrl = !!process.env.POSTGRES_URL;
    result.postgresUrlPrefix = process.env.POSTGRES_URL
      ? process.env.POSTGRES_URL.slice(0, 30) + '...'
      : null;

    result.step = 'running SELECT 1';
    const test = await sql`SELECT 1 AS ok`;
    result.selectOk = test.rows[0]?.ok === 1;

    result.step = 'checking tables exist';
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `;
    result.tables = tables.rows.map(r => r.table_name);

    result.step = 'done';
    result.success = true;
  } catch (err) {
    result.success = false;
    result.error = err.message;
    result.errorCode = err.code;
  }

  return Response.json(result);
}
