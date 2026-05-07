import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateRentalFees, getPlatformFeeRate } from "@/lib/utils";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId, startDate, endDate, protectionPlan, withDelivery } = await req.json();

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { owner: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.ownerId === session.user.id) {
      return NextResponse.json({ error: "Cannot rent your own item" }, { status: 400 });
    }

    if (!item.isActive) {
      return NextResponse.json({ error: "Item is not available" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    const protectionFees: Record<string, number> = { none: 0, basic: 49, premium: 99 };
    const deliveryFee = withDelivery ? 79 : 0;
    const platformFeeRate = getPlatformFeeRate(session.user.subscriptionPlan || "FREE");

    const fees = calculateRentalFees(
      item.dailyRate,
      totalDays,
      item.itemValue,
      session.user.trustScore || 50,
      protectionFees[protectionPlan] || 0,
      deliveryFee,
      platformFeeRate
    );

    const rental = await prisma.rental.create({
      data: {
        itemId: item.id,
        borrowerId: session.user.id,
        lenderId: item.ownerId,
        startDate: start,
        endDate: end,
        totalDays,
        rentalFee: fees.rentalFee,
        platformFee: fees.platformFee,
        depositAmount: fees.depositAmount,
        protectionFee: fees.protectionFee,
        deliveryFee: fees.deliveryFee,
        taxes: fees.taxes,
        totalPaid: fees.totalPaid,
        status: "PENDING",
      },
    });

    return NextResponse.json({ rental, fees });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
