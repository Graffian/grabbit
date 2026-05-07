import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { resolution } = await req.json();

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: { rental: true },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    const damageAmount = resolution === "PARTIAL_500" ? 500 :
      resolution === "PARTIAL_1000" ? 1000 :
      resolution === "PARTIAL_2500" ? 2500 : 0;

    const isLenderFavor = resolution === "FULL_DEPOSIT_LENDER" || damageAmount > 0;

    await prisma.dispute.update({
      where: { id: params.id },
      data: {
        status: "RESOLVED",
        resolution,
        resolvedAt: new Date(),
      },
    });

    if (resolution === "FULL_DEPOSIT_LENDER") {
      await prisma.deposit.updateMany({
        where: { rentalId: dispute.rentalId, status: "HELD" },
        data: { status: "DEDUCTED", deductionAmount: dispute.rental.depositAmount, deductionReason: "Dispute resolved in lender favor" },
      });
    } else if (resolution === "FULL_REFUND_BORROWER") {
      await prisma.deposit.updateMany({
        where: { rentalId: dispute.rentalId, status: "HELD" },
        data: { status: "RELEASED", refundedAt: new Date() },
      });
    } else if (damageAmount > 0) {
      const actualDeduction = Math.min(damageAmount, dispute.rental.depositAmount);
      const refundAmount = dispute.rental.depositAmount - actualDeduction;
      await prisma.deposit.updateMany({
        where: { rentalId: dispute.rentalId, status: "HELD" },
        data: {
          status: refundAmount > 0 ? "PARTIALLY_DEDUCTED" : "DEDUCTED",
          deductionAmount: actualDeduction,
          deductionReason: "Partial deduction per dispute resolution",
          refundedAt: refundAmount > 0 ? new Date() : undefined,
        },
      });
    }

    const favorableUserId = isLenderFavor ? dispute.rental.lenderId : dispute.rental.borrowerId;
    await prisma.trustEvent.create({
      data: {
        userId: favorableUserId,
        type: "DISPUTE_RESOLVED_FAVOR",
        delta: 2,
        reason: `Dispute resolved in favor: ${resolution}`,
      },
    });
    await prisma.user.update({
      where: { id: favorableUserId },
      data: { trustScore: { increment: 2 } },
    });

    const adverseUserId = isLenderFavor ? dispute.rental.borrowerId : dispute.rental.lenderId;
    if (damageAmount > 0) {
      await prisma.trustEvent.create({
        data: {
          userId: adverseUserId,
          type: "DAMAGE_CLAIM",
          delta: -8,
          reason: `Damage claim upheld: ${resolution}`,
        },
      });
      await prisma.user.update({
        where: { id: adverseUserId },
        data: { trustScore: { decrement: 8 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to resolve dispute" }, { status: 500 });
  }
}
