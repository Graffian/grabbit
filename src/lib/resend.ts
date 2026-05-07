import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: "Grabbit <noreply@grabbit.in>",
      to,
      subject,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendBookingConfirmation(
  email: string,
  userName: string,
  itemTitle: string,
  rentalId: string,
  totalPaid: number
): Promise<boolean> {
  return sendEmail(
    email,
    "Booking Confirmed - Grabbit",
    `<h1>Booking Confirmed!</h1><p>Hi ${userName},</p><p>Your rental for <strong>${itemTitle}</strong> is confirmed.</p><p>Rental ID: ${rentalId}</p><p>Total Paid: ₹${totalPaid}</p>`
  );
}

export async function sendPayoutNotification(
  email: string,
  userName: string,
  amount: number,
  rentalId: string
): Promise<boolean> {
  return sendEmail(
    email,
    "Payout Processed - Grabbit",
    `<h1>Payout Processed!</h1><p>Hi ${userName},</p><p>Your payout of ₹${amount} for rental ${rentalId} has been processed.</p>`
  );
}

export async function sendDisputeUpdate(
  email: string,
  userName: string,
  disputeId: string,
  status: string
): Promise<boolean> {
  return sendEmail(
    email,
    "Dispute Update - Grabbit",
    `<h1>Dispute Update</h1><p>Hi ${userName},</p><p>Dispute ${disputeId} status has been updated to: ${status}</p>`
  );
}
