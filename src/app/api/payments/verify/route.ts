import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const { rentalId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    const valid = await verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const rental = await prisma.rental.update({
      where: { id: rentalId },
      data: { status: "CONFIRMED", paymentId: razorpayPaymentId },
    });

    await prisma.payment.updateMany({
      where: { rentalId, razorpayOrderId },
      data: { razorpayPaymentId, status: "CAPTURED", capturedAt: new Date() },
    });

    await prisma.deposit.create({
      data: {
        rentalId,
        amount: rental.depositAmount,
        holdType: "AUTH_HOLD",
        status: "HELD",
      },
    });

    return NextResponse.json({ success: true, rental });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
