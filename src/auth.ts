import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { isUserAdmin } from "@/lib/admin";
import { PRO_TRIAL_DAYS } from "@/lib/subscription";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Block unauthenticated access to protected API endpoints (excluding public webhooks)
      if (
        pathname.startsWith("/api/wardrobe") ||
        pathname.startsWith("/api/upload") ||
        pathname.startsWith("/api/identify-clothing") ||
        pathname.startsWith("/api/recommend-outfits") ||
        pathname.startsWith("/api/outfits") ||
        pathname.startsWith("/api/user/subscription") ||
        pathname.startsWith("/api/admin") ||
        (pathname.startsWith("/api/payments") && !pathname.startsWith("/api/payments/webhook"))
      ) {
        if (!isLoggedIn) {
          return Response.json(
            { success: false, message: "Unauthorized. Please sign in." },
            { status: 401 },
          );
        }
        return true;
      }

      // Block unauthenticated access to consumer dashboard pages
      if (
        pathname.startsWith("/wardrobe") ||
        pathname.startsWith("/home") ||
        pathname.startsWith("/plan")
      ) {
        return isLoggedIn;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        await connectDB();

        let dbUser = await User.findOne({
          email: user.email.toLowerCase(),
        });

        if (!dbUser) {
          const trialExpiresAt = new Date();
          trialExpiresAt.setDate(trialExpiresAt.getDate() + PRO_TRIAL_DAYS);

          dbUser = await User.create({
            name: user.name ?? undefined,
            email: user.email.toLowerCase(),
            image: user.image ?? undefined,
            subscriptionTier: "pro",
            subscriptionStatus: "active",
            subscriptionExpiresAt: trialExpiresAt,
            isTrial: true,
          });
        }

        token.userId = dbUser._id.toString();
      }

      if (token.email) {
        const isAdmin = await isUserAdmin(token.email);
        token.role = isAdmin ? "admin" : "user";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.userId) {
          session.user.id = token.userId as string;
        }
        if (token.role) {
          session.user.role = token.role as string;
        }
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
});
