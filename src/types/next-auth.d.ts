import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      trustScore: number;
      kycStatus: string;
      role: string;
      subscriptionPlan: string;
      phone: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    trustScore?: number;
    kycStatus?: string;
    role?: string;
    subscriptionPlan?: string;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    trustScore: number;
    kycStatus: string;
    role: string;
    subscriptionPlan: string;
    phone: string;
  }
}
