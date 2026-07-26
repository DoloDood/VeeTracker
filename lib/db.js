// Thin re-export of @vercel/postgres's `sql` tagged template. Import it
// directly wherever you need a query — it parameterizes automatically
// (safe against SQL injection as long as you always use the tag, never
// string-concatenate values into the query yourself).
import { sql } from '@vercel/postgres';

export { sql };
