import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rentalId, deductionAmount, reason } = await req.json();

    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental || rental.lenderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isFullDeduction = deductionAmount >= rental.depositAmount;

    await prisma.deposit.updateMany({
      where: { rentalId, status: "HELD" },
      data: {
        status: isFullDeduction ? "DEDUCTED" : "PARTIALLY_DEDUCTED",
        deductionAmount,
        deductionReason: reason,
        refundedAt: isFullDeduction ? undefined : new Date(),
      },
    });

    await prisma.rental.update({
      where: { id: rentalId },
      data: {
        depositStatus: isFullDeduction ? "DEDUCTED" : "PARTIALLY_DEDUCTED",
        depositRefundAmount: Math.max(0, rental.depositAmount - deductionAmount),
        depositDeductionReason: reason,
      },
    });

    if (isFullDeduction) {
      await prisma.trustEvent.create({
        data: {
          userId: rental.borrowerId,
          type: "DAMAGE_CLAIM",
          delta: -8,
          reason: reason,
        },
      });
      await prisma.user.update({
        where: { id: rental.borrowerId },
        data: { trustScore: { decrement: 8 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to deduct deposit" }, { status: 500 });
  }
}
