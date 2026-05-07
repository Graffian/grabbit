import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      id: "phone",
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        const phone = credentials.phone as string;
        const code = credentials.otp as string;

        const otp = await prisma.oTP.findFirst({
          where: { phone, code, used: false, expiresAt: { gte: new Date() } },
          orderBy: { createdAt: "desc" },
        });

        if (!otp) return null;

        await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } });

        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
          user = await prisma.user.create({
            data: { phone, isVerified: true },
          });

          await prisma.trustEvent.create({
            data: {
              userId: user.id,
              type: "PHONE_VERIFIED",
              delta: 5,
              reason: "Phone number verified",
            },
          });

          await prisma.user.update({
            where: { id: user.id },
            data: { trustScore: { increment: 5 } },
          });

          await prisma.subscription.create({
            data: { userId: user.id, plan: "FREE", status: "ACTIVE" },
          });
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { subscription: true },
        });
        if (dbUser) {
          token.trustScore = dbUser.trustScore;
          token.kycStatus = dbUser.kycStatus;
          token.role = dbUser.role;
          token.subscriptionPlan = dbUser.subscription?.plan ?? "FREE";
          token.phone = dbUser.phone;
        }
      }
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.trustScore = token.trustScore as number;
        session.user.kycStatus = token.kycStatus as string;
        session.user.role = token.role as string;
        session.user.subscriptionPlan = token.subscriptionPlan as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
});
