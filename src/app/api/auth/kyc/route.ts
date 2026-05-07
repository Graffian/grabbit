import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { aadhaar } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kycStatus: "PENDING",
        avatar: aadhaar,
      },
    });

    return NextResponse.json({ success: true, message: "KYC documents submitted" });
  } catch {
    return NextResponse.json({ error: "Failed to submit KYC" }, { status: 500 });
  }
}
