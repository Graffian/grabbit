import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BorrowerDashboard } from "./borrower-dashboard";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const [activeRentals, rentalHistory, deposits, subscription] = await Promise.all([
    prisma.rental.findMany({
      where: { borrowerId: userId, status: { in: ["CONFIRMED", "ACTIVE"] } },
      include: { item: true, lender: { select: { name: true, trustScore: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.findMany({
      where: { borrowerId: userId, status: { in: ["RETURNED", "CANCELLED", "DISPUTED"] } },
      include: { item: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.deposit.findMany({
      where: { rental: { borrowerId: userId } },
      include: { rental: { select: { item: { select: { title: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  return {
    activeRentals: activeRentals.map((r) => ({ ...r, item: { ...r.item, images: JSON.parse((r.item as any).images || "[]") } })),
    rentalHistory: rentalHistory.map((r) => ({ ...r, item: { ...r.item, images: JSON.parse((r.item as any).images || "[]") } })),
    deposits,
    subscription,
  };
}

export default async function BorrowerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);
  return <BorrowerDashboard data={data as any} />;
}
