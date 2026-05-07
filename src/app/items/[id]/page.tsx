import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ItemDetailClient } from "./item-detail-client";

export const dynamic = "force-dynamic";

async function getItem(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, avatar: true, trustScore: true, city: true } },
      rentals: {
        where: {
          status: { in: ["CONFIRMED", "ACTIVE"] },
        },
        select: { startDate: true, endDate: true },
      },
    },
  });
  if (!item) return null;
  return {
    ...item,
    images: JSON.parse(item.images || "[]"),
  };
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) notFound();

  return <ItemDetailClient item={item as any} />;
}
