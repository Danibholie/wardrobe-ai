import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

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

      // Block unauthenticated access to protected API endpoints
      if (
        pathname.startsWith("/api/wardrobe") ||
        pathname.startsWith("/api/upload") ||
        pathname.startsWith("/api/identify-clothing")
      ) {
        if (!isLoggedIn) {
          return Response.json(
            { success: false, message: "Unauthorized. Please sign in." },
            { status: 401 }
          );
        }
        return true;
      }

      // Block unauthenticated access to wardrobe pages
      if (pathname.startsWith("/wardrobe")) {
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
          dbUser = await User.create({
            name: user.name ?? undefined,
            email: user.email.toLowerCase(),
            image: user.image ?? undefined,
          });
        }

        token.userId = dbUser._id.toString();
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
});
