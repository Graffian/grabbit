import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LenderDashboard } from "./lender-dashboard";

export const dynamic = "force-dynamic";

function parseImages(items: any[]) {
  return items.map((item) => ({
    ...item,
    images: JSON.parse(item.images || "[]"),
  }));
}

async function getDashboardData(userId: string) {
  const [activeRentals, pendingRequests, earnings, payouts, items] = await Promise.all([
    prisma.rental.findMany({
      where: { lenderId: userId, status: { in: ["CONFIRMED", "ACTIVE"] } },
      include: { item: true, borrower: { select: { name: true, phone: true, trustScore: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.findMany({
      where: { lenderId: userId, status: "PENDING" },
      include: { item: true, borrower: { select: { name: true, phone: true, trustScore: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rental.aggregate({
      where: { lenderId: userId, status: "RETURNED" },
      _sum: { rentalFee: true },
    }),
    prisma.payout.findMany({
      where: { lenderId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.item.findMany({ where: { ownerId: userId }, orderBy: { createdAt: "desc" } }),
  ]);

  return {
    activeRentals: activeRentals.map((r) => ({ ...r, item: { ...r.item, images: JSON.parse((r.item as any).images || "[]") } })),
    pendingRequests: pendingRequests.map((r) => ({ ...r, item: { ...r.item, images: JSON.parse((r.item as any).images || "[]") } })),
    earnings: earnings._sum.rentalFee || 0,
    payouts,
    items: parseImages(items),
  };
}

export default async function LenderDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);
  return <LenderDashboard data={data as any} />;
}
