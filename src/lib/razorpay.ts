import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(
  amount: number,
  currency: string = "INR",
  receipt: string,
  notes?: Record<string, string>
) {
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes,
  });
  return order;
}

export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const crypto = await import("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expectedSignature === signature;
}

export async function capturePayment(paymentId: string, amount: number) {
  return razorpay.payments.capture(paymentId, Math.round(amount * 100), "INR");
}

export async function refundPayment(paymentId: string, amount?: number) {
  return razorpay.payments.refund(paymentId, amount ? { amount: Math.round(amount * 100) } : {});
}

export async function createRazorpaySubscription(
  planId: string,
  totalCount: number = 12
) {
  return razorpay.subscriptions.create({
    plan_id: planId,
    total_count: totalCount,
    expire_by: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
  });
}

export async function createRazorpayPayout(
  accountNumber: string,
  ifsc: string,
  amount: number,
  name: string
) {
  return (razorpay as any).payouts.create({
    account_number: accountNumber,
    fund_account: {
      account_type: "bank_account",
      bank_account: {
        name,
        ifsc,
        account_number: accountNumber,
      },
    },
    amount: Math.round(amount * 100),
    currency: "INR",
    mode: "NEFT",
    purpose: "payout",
  });
}
