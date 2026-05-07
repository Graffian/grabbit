import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  try {
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        const dbPayment = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
          include: { rental: true },
        });

        if (dbPayment) {
          await prisma.payment.update({
            where: { id: dbPayment.id },
            data: { status: "CAPTURED", capturedAt: new Date(), razorpayPaymentId: payment.id },
          });

          if (dbPayment.rental.status === "PENDING") {
            await prisma.rental.update({
              where: { id: dbPayment.rentalId },
              data: { status: "CONFIRMED", paymentId: payment.id },
            });
          }
        }
        break;
      }

      case "payment.failed": {
        const failedPayment = event.payload.payment.entity;
        const failedOrderId = failedPayment.order_id;

        await prisma.payment.updateMany({
          where: { razorpayOrderId: failedOrderId },
          data: { status: "FAILED" },
        });
        break;
      }

      case "subscription.charged": {
        const sub = event.payload.subscription.entity;
        await prisma.subscription.updateMany({
          where: { razorpaySubId: sub.id },
          data: { status: "ACTIVE" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
