import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { userId, action } = await req.json();

    if (action === "approve") {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: "VERIFIED", isVerified: true },
      });

      await prisma.trustEvent.create({
        data: { userId, type: "KYC_VERIFIED", delta: 10, reason: "KYC documents verified" },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { trustScore: { increment: 10 } },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: "REJECTED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to process KYC" }, { status: 500 });
  }
}
