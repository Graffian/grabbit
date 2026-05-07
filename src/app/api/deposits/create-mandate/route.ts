import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";

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

    if (!rental || rental.borrowerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const mandate = await razorpay.orders.create({
      amount: Math.round(rental.depositAmount * 100),
      currency: "INR",
      receipt: `deposit_${rental.id}`,
      notes: { type: "deposit_mandate", rentalId: rental.id },
    });

    return NextResponse.json({ mandate, amount: rental.depositAmount });
  } catch {
    return NextResponse.json({ error: "Failed to create mandate" }, { status: 500 });
  }
}
