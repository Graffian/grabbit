import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ItemNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
        <p className="text-gray-500 mt-2">This item may have been removed or doesn&apos;t exist.</p>
        <Link href="/browse">
          <Button className="mt-4">Browse Items</Button>
        </Link>
      </div>
    </div>
  );
}
