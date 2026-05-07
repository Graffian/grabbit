import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { rentalId, type, description, evidenceUrls } = await req.json();

    const rental = await prisma.rental.findUnique({ where: { id: rentalId } });

    if (!rental || (rental.borrowerId !== session.user.id && rental.lenderId !== session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (rental.status !== "RETURNED") {
      return NextResponse.json({ error: "Can only dispute after return" }, { status: 400 });
    }

    await prisma.rental.update({
      where: { id: rentalId },
      data: { status: "DISPUTED" },
    });

    const dispute = await prisma.dispute.create({
      data: {
        rentalId,
        raisedById: session.user.id,
        type,
        description,
        evidenceUrls: JSON.stringify(evidenceUrls || []),
        status: "OPEN",
      },
    });

    await prisma.trustEvent.create({
      data: {
        userId: session.user.id,
        type: "DISPUTE_RAISED",
        delta: -10,
        reason: `Dispute raised: ${type}`,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { trustScore: { decrement: 10 } },
    });

    return NextResponse.json({ dispute });
  } catch {
    return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 });
  }
}
