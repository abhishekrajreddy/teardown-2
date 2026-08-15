import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Credentials and Google both write into the same User table, so "your
// data" means the same thing regardless of how you signed in. Google is
// listed second here only because Credentials needs no env vars to work
// locally — the login page can show either or both, whichever exist.
export const authOptions: NextAuthOptions = {
  // Staying logged in between visits is standard behavior (same as most
  // apps) — this just makes the duration explicit instead of relying on
  // NextAuth's implicit default. Lower maxAge to force more frequent
  // re-logins if you'd rather have that.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null; // Google-only accounts have no password to check

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.upsert({
          where: { email: token.email },
          update: { name: token.name ?? undefined },
          create: {
            name: token.name ?? token.email.split("@")[0],
            email: token.email,
          },
        });
        token.id = dbUser.id;
        return token;
      }

      if (user) {
        token.id = user.id;
        return token;
      }

      // Every subsequent request (no fresh sign-in happening): confirm the
      // user this token points at still actually exists. If the database
      // was ever reset/reseeded, an old signed-in browser would otherwise
      // keep sending a user id that no longer exists — every query scoped
      // to "your data" would silently come back empty or null instead of
      // failing clearly. Self-heal by re-matching on email where possible.
      if (token.id) {
        const stillExists = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true },
        });
        if (!stillExists) {
          const byEmail = token.email
            ? await prisma.user.findUnique({ where: { email: token.email as string }, select: { id: true } })
            : null;
          token.id = byEmail?.id; // becomes undefined if truly gone — session callback below then omits it
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string | undefined;
      return session;
    },
  },
};
