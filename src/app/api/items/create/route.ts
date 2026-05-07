import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, category, dailyRate, weeklyRate, itemValue, condition, location, images } = await req.json();

    const item = await prisma.item.create({
      data: {
        title,
        description: description || "",
        category,
        dailyRate,
        weeklyRate,
        itemValue,
        condition: condition || "Good",
        images: JSON.stringify(images || []),
        location,
        ownerId: session.user.id,
        depositAmount: Math.max(Math.round(itemValue * 0.2), 200),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
