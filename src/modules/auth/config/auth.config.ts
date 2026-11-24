import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { Session, Account } from "next-auth";
import { JWT } from "next-auth/jwt";
import {
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  NEXTAUTH_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} from "@/config/env.config";

declare module "next-auth" {
  interface Session {
    provider?: string; //* PROVIDER NAME
    sub?: string; //* UNIQUE ID OF THE PROVIDER
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: string;
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID as string,
      clientSecret: GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: FACEBOOK_CLIENT_ID as string,
      clientSecret: FACEBOOK_CLIENT_SECRET as string,
    }),
  ],
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: JWT; account?: Account | null }) {
      // When the user first signs in, 'account' contains the provider name
      if (account) {
        token.provider = account.provider; // e.g., "google" or "facebook"
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!session.user) {
        session.user = {};
      }

      // Attach the JWT token to the session so client hooks can read provider info if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session as any).token = token;

      // console.log("session.user", session.user);
      // console.log("session", session);
      if (token) {
        session.provider = token.provider;
        session.sub = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
