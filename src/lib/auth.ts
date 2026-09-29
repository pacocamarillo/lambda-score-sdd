import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { consumeLogin2faToken } from "@/modules/access/login-2fa";
import { verifyLogin } from "@/modules/access/login";
import { consumeMagicToken } from "@/modules/access/magic-link";
import { verifySecondFactorForUser } from "@/modules/access/two-factor";
import { deleteSession, openSession, readSession } from "@/modules/access/session-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        magicToken: {},
        login2faToken: {},
        totpCode: {},
      },
      authorize: async (credentials) => {
        const magicToken = String(credentials?.magicToken ?? "");
        if (magicToken) {
          const magic = await consumeMagicToken(magicToken);
          if (!magic.ok) return null;
          return { id: magic.userId, email: magic.email, name: magic.name };
        }
        const login2faToken = String(credentials?.login2faToken ?? "");
        if (login2faToken) {
          const step = await consumeLogin2faToken(login2faToken);
          if (!step.ok) return null;
          const valid = await verifySecondFactorForUser(step.userId, String(credentials?.totpCode ?? ""));
          if (!valid) return null;
          return { id: step.userId, email: step.email, name: step.name };
        }
        const result = await verifyLogin(String(credentials?.email ?? ""), String(credentials?.password ?? ""));
        if (!result.ok) return null;
        return { id: result.userId, email: result.email, name: result.name };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        const opened = await openSession(user.id);
        token.sessionId = opened.sessionId;
        token.sub = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const sessionId = typeof token.sessionId === "string" ? token.sessionId : "";
      const row = sessionId ? await readSession(sessionId) : null;
      session.sessionId = sessionId;
      session.user = {
        ...session.user,
        id: row?.userId ?? "",
        email: row?.email ?? session.user?.email,
        name: row?.name ?? session.user?.name,
      };
      if (!row) {
        session.membershipId = undefined;
        session.organizationId = undefined;
        session.organizationName = undefined;
        session.role = undefined;
        return session;
      }
      session.membershipId = row.membershipId ?? undefined;
      session.organizationId = row.organizationId ?? undefined;
      session.organizationName = row.organizationName ?? undefined;
      session.role = (row.role as "owner" | "admin" | "staff" | null) ?? undefined;
      return session;
    },
  },
  events: {
    signOut: async (message) => {
      if ("token" in message && typeof message.token?.sessionId === "string") {
        await deleteSession(message.token.sessionId);
      }
    },
  },
});
