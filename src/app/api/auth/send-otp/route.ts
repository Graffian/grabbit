import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOTP, generateOTP } from "@/lib/msg91";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone || phone.length !== 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTP.create({
      data: { phone, code, expiresAt },
    });

    const sent = await sendOTP(phone, code);
    if (!sent) {
      console.warn("MSG91 delivery failed, but OTP stored for dev:", code);
    }

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
