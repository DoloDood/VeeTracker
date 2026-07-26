// GET /api/ebay/auth-start?env=sandbox|production
// Redirects the signed-in user to eBay's consent screen. A random `state`
// value carries their app user id (and chosen environment) through the
// round-trip so /api/ebay/auth-callback knows whose account to save the
// resulting refresh token against.
import { auth } from '../../../../auth.js';
import { sql } from '../../../../lib/db.js';
import { SCOPES } from '../../../../lib/ebay.js';
import { randomUUID } from 'crypto';

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.appUserId) {
    return Response.redirect(new URL('/login', req.url));
  }

  const env = new URL(req.url).searchParams.get('env') === 'production' ? 'production' : 'sandbox';
  const state = randomUUID();

  await sql`INSERT INTO ebay_oauth_state (state, user_id, environment) VALUES (${state}, ${session.user.appUserId}, ${env})`;

  const authHost = env === 'production' ? 'https://auth.ebay.com' : 'https://auth.sandbox.ebay.com';
  const runame = env === 'production' ? process.env.EBAY_RUNAME_PRODUCTION : process.env.EBAY_RUNAME_SANDBOX;

  const url = `${authHost}/oauth2/authorize?` + new URLSearchParams({
    client_id: env === 'production' ? process.env.EBAY_CLIENT_ID_PRODUCTION : process.env.EBAY_CLIENT_ID_SANDBOX,
    redirect_uri: runame,
    response_type: 'code',
    scope: SCOPES,
    state,
  }).toString();

  return Response.redirect(url);
}
