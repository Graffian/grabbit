import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DisputeDetail } from "./dispute-detail";

export const dynamic = "force-dynamic";

async function getDispute(id: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      rental: {
        include: {
          item: true,
          borrower: { select: { name: true, phone: true, trustScore: true } },
          lender: { select: { name: true, phone: true, trustScore: true } },
        },
      },
      raisedBy: { select: { name: true } },
    },
  });
  if (!dispute) return null;
  return {
    ...dispute,
    evidenceUrls: JSON.parse(dispute.evidenceUrls || "[]"),
    rental: {
      ...dispute.rental,
      item: { ...dispute.rental.item, images: JSON.parse((dispute.rental.item as any).images || "[]") },
    },
  };
}

export default async function DisputePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const dispute = await getDispute(params.id);
  if (!dispute) return <div className="p-8 text-center">Dispute not found</div>;

  return <DisputeDetail dispute={dispute as any} role={session.user.role} />;
}
