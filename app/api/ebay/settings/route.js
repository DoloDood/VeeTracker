// GET  /api/ebay/settings  -> this user's connection status + policy IDs (never returns the refresh token)
// PATCH /api/ebay/settings  body: { fulfillmentPolicyId?, paymentPolicyId?, returnPolicyId?, merchantLocationKey? }
import { auth } from '../../../../auth.js';
import { sql } from '../../../../lib/db.js';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.appUserId) return null;
  return session.user.appUserId;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const res = await sql`
    SELECT environment, (refresh_token IS NOT NULL) AS connected, connected_at AS "connectedAt",
           fulfillment_policy_id AS "fulfillmentPolicyId", payment_policy_id AS "paymentPolicyId",
           return_policy_id AS "returnPolicyId", merchant_location_key AS "merchantLocationKey"
    FROM ebay_connections WHERE user_id = ${userId}
  `;
  return Response.json({ connection: res.rows[0] || null });
}

export async function PATCH(req) {
  const userId = await requireUser();
  if (!userId) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const body = await req.json();
  const exists = await sql`SELECT user_id FROM ebay_connections WHERE user_id = ${userId}`;
  if (exists.rows.length === 0) {
    return Response.json({ error: 'Connect your eBay account first' }, { status: 400 });
  }

  await sql`
    UPDATE ebay_connections SET
      fulfillment_policy_id = COALESCE(${body.fulfillmentPolicyId ?? null}, fulfillment_policy_id),
      payment_policy_id = COALESCE(${body.paymentPolicyId ?? null}, payment_policy_id),
      return_policy_id = COALESCE(${body.returnPolicyId ?? null}, return_policy_id),
      merchant_location_key = COALESCE(${body.merchantLocationKey ?? null}, merchant_location_key)
    WHERE user_id = ${userId}
  `;
  return Response.json({ ok: true });
}
