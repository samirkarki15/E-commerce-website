// app/_lib/auth.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createOrGetUser } from "@/app/_lib/actions/auth-actions";
import { supabaseAdmin } from "@/app/_lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 SignIn callback started for:", user?.email);

      try {
        // IMPORTANT: Pass NextAuth user ID to createOrGetUser
        const dbUser = await createOrGetUser(
          user.email,
          user.name,
          user.image,
          user.id, // ← PASS THE NEXT AUTH USER ID HERE
        );
        console.log("✅ User in database:", dbUser);

        return true;
      } catch (error) {
        console.error("❌ Error in signIn callback:", error);
        return false;
      }
    },

    async session({ session, token }) {
      if (session?.user) {
        // Get user role and database ID from database
        try {
          const { data: dbUser } = await supabaseAdmin
            .from("users")
            .select("role, id")
            .eq("email", session.user.email)
            .single();

          if (dbUser) {
            // ✅ FIXED: Use database UUID as the main ID
            session.user.id = dbUser.id; // ← Database UUID (for reviews, etc)
            session.user.role = dbUser.role;
            // Keep token.sub for reference if needed
            session.user.googleId = token.sub;
          }
        } catch (error) {
          console.error("Error getting user role:", error);
          // Fallback: at least set the google ID if database lookup fails
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Add these configurations for better security
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutes
      },
    },
  },
});
