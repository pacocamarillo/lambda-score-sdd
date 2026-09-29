import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    sessionId: string;
    membershipId?: string;
    organizationId?: string;
    organizationName?: string;
    role?: "owner" | "admin" | "staff";
    user: DefaultSession["user"] & { id: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionId?: string;
  }
}
