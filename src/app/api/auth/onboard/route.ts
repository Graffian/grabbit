import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, city } = await req.json();
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, city },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
