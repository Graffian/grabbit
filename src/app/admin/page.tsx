import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

async function getAdminData() {
  const [rentals, users, disputes, kycQueue, revenue] = await Promise.all([
    prisma.rental.findMany({
      include: { item: true, borrower: { select: { name: true, phone: true } }, lender: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.dispute.findMany({
      include: { rental: { include: { item: true } }, raisedBy: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ where: { kycStatus: "PENDING" } }),
    prisma.rental.aggregate({ where: { status: "RETURNED" }, _sum: { platformFee: true, rentalFee: true } }),
  ]);

  return {
    rentals: rentals.map((r) => ({
      ...r,
      item: { ...r.item, images: JSON.parse((r.item as any).images || "[]") },
    })),
    users,
    disputes: disputes.map((d) => ({
      ...d,
      evidenceUrls: JSON.parse(d.evidenceUrls || "[]"),
      rental: { ...d.rental, item: { ...d.rental.item, images: JSON.parse((d.rental.item as any).images || "[]") } },
    })),
    kycQueue,
    revenue,
  };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/browse");
  }

  const data = await getAdminData();
  return <AdminDashboard data={data as any} />;
}
