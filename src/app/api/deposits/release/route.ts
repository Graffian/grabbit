import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rentalId } = await req.json();

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { deposits: true },
    });

    if (!rental || (rental.lenderId !== session.user.id && rental.borrowerId !== session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.deposit.updateMany({
      where: { rentalId, status: "HELD" },
      data: { status: "RELEASED", refundedAt: new Date() },
    });

    await prisma.rental.update({
      where: { id: rentalId },
      data: { depositStatus: "RELEASED", depositRefundAmount: rental.depositAmount },
    });

    await prisma.trustEvent.create({
      data: {
        userId: rental.borrowerId,
        type: "COMPLETED_RENTAL",
        delta: 5,
        reason: "Completed rental without issues",
      },
    });

    await prisma.user.update({
      where: { id: rental.borrowerId },
      data: { trustScore: { increment: 5 } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to release deposit" }, { status: 500 });
  }
}
