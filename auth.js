import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { sql } from './lib/db.js';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    // Runs on every sign-in and every subsequent request that touches the JWT.
    // `account`/`profile` are only present on the initial sign-in.
    async jwt({ token, account, profile }) {
      if (account && profile) {
        console.log('[auth] sign-in attempt, env check:', {
          hasGoogleId: !!process.env.AUTH_GOOGLE_ID,
          hasGoogleSecret: !!process.env.AUTH_GOOGLE_SECRET,
          hasAuthSecret: !!process.env.AUTH_SECRET,
          hasPostgresUrl: !!process.env.POSTGRES_URL,
        });
        try {
          // First sign-in: find-or-create our own app_users row for this Google account.
          const googleSub = profile.sub;
          const email = profile.email;

          const existing = await sql`SELECT id FROM app_users WHERE google_sub = ${googleSub}`;
          let userId;
          if (existing.rows.length > 0) {
            userId = existing.rows[0].id;
          } else {
            const inserted = await sql`
              INSERT INTO app_users (google_sub, email)
              VALUES (${googleSub}, ${email})
              ON CONFLICT (email) DO UPDATE SET google_sub = EXCLUDED.google_sub
              RETURNING id
            `;
            userId = inserted.rows[0].id;
          }
          token.appUserId = userId;
          console.log('[auth] db lookup/create succeeded, appUserId:', userId);
        } catch (err) {
          console.error('[auth] DATABASE ERROR during sign-in:', err.message, err.stack);
          throw err;
        }
      }
      return token;
    },
    // Runs whenever the client asks for the current session. We look username
    // up fresh each time (cheap, single indexed row) rather than trusting a
    // cached value in the JWT, so it's always correct right after onboarding.
    async session({ session, token }) {
      session.user.appUserId = token.appUserId;
      if (token.appUserId) {
        const res = await sql`SELECT username FROM app_users WHERE id = ${token.appUserId}`;
        session.user.username = res.rows[0]?.username || null;
      }
      return session;
    },
  },
});
