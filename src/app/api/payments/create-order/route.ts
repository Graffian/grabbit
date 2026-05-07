import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rentalId } = await req.json();

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { item: true },
    });

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    const order = await createRazorpayOrder(
      rental.totalPaid,
      "INR",
      `rental_${rental.id}`,
      { rentalId: rental.id, borrowerId: session.user.id }
    );

    await prisma.payment.create({
      data: {
        rentalId: rental.id,
        razorpayOrderId: order.id,
        amount: rental.totalPaid,
        type: "RENTAL",
        status: "PENDING",
      },
    });

    return NextResponse.json({ order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
