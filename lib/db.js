// Uses the standard `pg` (node-postgres) driver rather than the deprecated
// @vercel/postgres package, so this works reliably against any Postgres
// provider - Supabase included, not just Vercel's old native Postgres/Neon.
//
// `sql` is a small tagged-template shim that mimics @vercel/postgres's API
// (so every `sql\`SELECT ...\`` call site elsewhere in the app didn't need
// to change) but runs on top of a plain pg.Pool underneath.
import pg from 'pg';

// Supabase's connection string embeds its own sslmode directive, which
// conflicts with the explicit ssl option below and was causing a
// "self-signed certificate in certificate chain" error. Stripping it so
// only our explicit ssl config applies.
function connectionStringWithoutSslMode(connStr) {
  if (!connStr) return connStr;
  try {
    const url = new URL(connStr);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return connStr;
  }
}

const pool = new pg.Pool({
  connectionString: connectionStringWithoutSslMode(process.env.POSTGRES_URL),
  ssl: { rejectUnauthorized: false },
  max: 1, // small per-instance pool - POSTGRES_URL is already a pooled (PgBouncer) connection
});

function sql(strings, ...values) {
  let text = strings[0];
  const params = [];
  values.forEach((val, i) => {
    params.push(val);
    text += `$${params.length}` + strings[i + 1];
  });
  return pool.query(text, params);
}

export { sql, pool };
