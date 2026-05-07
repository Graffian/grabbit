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

    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (!rental || rental.lenderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.rental.update({
      where: { id: rentalId },
      data: { status: "RETURNED" },
    });

    await prisma.payout.create({
      data: {
        rentalId,
        lenderId: rental.lenderId,
        amount: rental.rentalFee - rental.platformFee,
        platformCut: rental.platformFee,
        status: "PENDING",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to process return" }, { status: 500 });
  }
}
