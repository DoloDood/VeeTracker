// GET /api/ebay/auth-callback?code=...&state=...
// eBay redirects here after the user approves access. Looks up which app
// user (and which environment) this belongs to via the `state` value saved
// in /api/ebay/auth-start, exchanges the code for a refresh token, and
// stores it against that user's ebay_connections row.
import { sql } from '../../../../lib/db.js';

export async function GET(req) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return new Response('Missing code or state from eBay redirect.', { status: 400 });
  }

  const stateRow = await sql`SELECT user_id, environment FROM ebay_oauth_state WHERE state = ${state}`;
  if (stateRow.rows.length === 0) {
    return new Response('Unrecognized or expired authorization attempt — please try connecting again.', { status: 400 });
  }
  const { user_id: userId, environment } = stateRow.rows[0];
  await sql`DELETE FROM ebay_oauth_state WHERE state = ${state}`;

  const apiHost = environment === 'production' ? 'https://api.ebay.com' : 'https://api.sandbox.ebay.com';
  const clientId = environment === 'production' ? process.env.EBAY_CLIENT_ID_PRODUCTION : process.env.EBAY_CLIENT_ID_SANDBOX;
  const clientSecret = environment === 'production' ? process.env.EBAY_CLIENT_SECRET_PRODUCTION : process.env.EBAY_CLIENT_SECRET_SANDBOX;
  const runame = environment === 'production' ? process.env.EBAY_RUNAME_PRODUCTION : process.env.EBAY_RUNAME_SANDBOX;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenRes = await fetch(`${apiHost}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: decodeURIComponent(code),
      redirect_uri: runame,
    }),
  });

  const data = await tokenRes.json();
  if (!tokenRes.ok) {
    return new Response(`Token exchange failed:\n${JSON.stringify(data, null, 2)}`, { status: 500 });
  }

  await sql`
    INSERT INTO ebay_connections (user_id, environment, refresh_token, connected_at)
    VALUES (${userId}, ${environment}, ${data.refresh_token}, now())
    ON CONFLICT (user_id) DO UPDATE SET
      environment = EXCLUDED.environment,
      refresh_token = EXCLUDED.refresh_token,
      connected_at = now()
  `;

  return Response.redirect(new URL('/settings/ebay?connected=1', req.url));
}
