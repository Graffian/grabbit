import { prisma } from "@/lib/prisma";
import { BrowseContent } from "./browse-content";

export const dynamic = "force-dynamic";

async function getItems() {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    include: {
      owner: { select: { id: true, name: true, avatar: true, trustScore: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return items.map((item) => ({
    ...item,
    images: JSON.parse(item.images || "[]"),
    owner: { ...item.owner },
  }));
}

async function getCategories() {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ["category"],
  });
  return items.map((i) => i.category);
}

export default async function BrowsePage() {
  const [items, categories] = await Promise.all([getItems(), getCategories()]);

  return <BrowseContent items={items as any} categories={categories} />;
}
