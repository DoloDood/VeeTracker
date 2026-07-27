// POST /api/ebay/list-item
// Body: { sku, title, description, imageUrls, price, quantity, categoryId, conditionId }
// Publishes a live eBay listing using the signed-in user's own connected
// eBay account (their stored refresh token + business policies), via the
// three-call Sell API flow: createOrReplaceInventoryItem -> createOffer -> publishOffer.
import { getCurrentUser } from '../../../../lib/supabase/server.js';
import { getConnection, ebayFetch } from '../../../../lib/ebay.js';

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  const connection = await getConnection(user.id);
  if (!connection || !connection.refresh_token) {
    return Response.json({ error: 'Connect your eBay account first at /settings/ebay' }, { status: 400 });
  }
  const missingPolicies = ['fulfillment_policy_id', 'payment_policy_id', 'return_policy_id', 'merchant_location_key']
    .filter(k => !connection[k]);
  if (missingPolicies.length) {
    return Response.json({
      error: `Missing eBay setup: ${missingPolicies.join(', ')} — set these at /settings/ebay`,
    }, { status: 400 });
  }

  const item = await req.json();
  const required = ['sku', 'title', 'imageUrls', 'price', 'categoryId'];
  const missing = required.filter(k => !item[k] || (Array.isArray(item[k]) && item[k].length === 0));
  if (missing.length) {
    return Response.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
  }

  try {
    await ebayFetch(connection, `/sell/inventory/v1/inventory_item/${encodeURIComponent(item.sku)}`, {
      method: 'PUT',
      body: {
        availability: { shipToLocationAvailability: { quantity: item.quantity || 1 } },
        condition: item.conditionId || 'USED_EXCELLENT',
        product: {
          title: String(item.title).slice(0, 80),
          description: item.description || item.title,
          imageUrls: item.imageUrls,
        },
      },
    });

    const offer = await ebayFetch(connection, `/sell/inventory/v1/offer`, {
      method: 'POST',
      body: {
        sku: item.sku,
        marketplaceId: 'EBAY_US',
        format: 'FIXED_PRICE',
        availableQuantity: item.quantity || 1,
        categoryId: item.categoryId,
        listingDescription: item.description || item.title,
        listingPolicies: {
          fulfillmentPolicyId: connection.fulfillment_policy_id,
          paymentPolicyId: connection.payment_policy_id,
          returnPolicyId: connection.return_policy_id,
        },
        pricingSummary: { price: { value: String(item.price), currency: 'USD' } },
        merchantLocationKey: connection.merchant_location_key,
      },
    });

    const publish = await ebayFetch(connection, `/sell/inventory/v1/offer/${offer.offerId}/publish`, {
      method: 'POST',
    });

    return Response.json({
      ok: true,
      offerId: offer.offerId,
      listingId: publish.listingId,
      viewUrl: connection.environment === 'production'
        ? `https://www.ebay.com/itm/${publish.listingId}`
        : `https://www.sandbox.ebay.com/itm/${publish.listingId}`,
      environment: connection.environment,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
