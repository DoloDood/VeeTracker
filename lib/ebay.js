// eBay API helpers. Unlike the original single-user version, the refresh
// token and business-policy IDs are per app-user (from ebay_connections),
// not global env vars — only the app's own Client ID/Secret (its identity
// with eBay) stay as env vars, since that's shared across every user who
// connects their own seller account through this app.
import { sql } from './db.js';

const SCOPES = [
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
].join(' ');

function hosts(environment) {
  return environment === 'production'
    ? { api: 'https://api.ebay.com', auth: 'https://auth.ebay.com' }
    : { api: 'https://api.sandbox.ebay.com', auth: 'https://auth.sandbox.ebay.com' };
}

async function getConnection(userId) {
  const res = await sql`SELECT * FROM ebay_connections WHERE user_id = ${userId}`;
  return res.rows[0] || null;
}

async function getAccessToken(connection) {
  const { api } = hosts(connection.environment);
  const clientId = connection.environment === 'production' ? process.env.EBAY_CLIENT_ID_PRODUCTION : process.env.EBAY_CLIENT_ID_SANDBOX;
  const clientSecret = connection.environment === 'production' ? process.env.EBAY_CLIENT_SECRET_PRODUCTION : process.env.EBAY_CLIENT_SECRET_SANDBOX;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${api}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token,
      scope: SCOPES,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`eBay token refresh failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function ebayFetch(connection, path, { method = 'GET', body, marketplaceId = 'EBAY_US' } = {}) {
  const { api } = hosts(connection.environment);
  const token = await getAccessToken(connection);

  const res = await fetch(`${api}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      'Accept-Language': 'en-US',
      'Content-Language': 'en-US',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`eBay ${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

export { hosts, getConnection, getAccessToken, ebayFetch, SCOPES };
