// POST /api/ebay/upload-image
// Body: { "filename": "alert-ape.jpg", "dataBase64": "<base64-encoded image bytes>" }
// Uploads to Vercel Blob (eBay's Inventory API requires public HTTPS image
// URLs, not raw file uploads) and returns the public URL.
import { auth } from '../../../../auth.js';
import { put } from '@vercel/blob';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.appUserId) {
    return Response.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const { filename, dataBase64 } = await req.json();
    if (!filename || !dataBase64) {
      return Response.json({ error: 'Body must be JSON: { filename, dataBase64 }' }, { status: 400 });
    }
    const buffer = Buffer.from(dataBase64, 'base64');
    // Namespace by user so filenames can't collide across accounts.
    const blob = await put(`u${session.user.appUserId}/${filename}`, buffer, {
      access: 'public',
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
