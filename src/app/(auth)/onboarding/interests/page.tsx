"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const INTERESTS = [
  "Tools",
  "Electronics",
  "Vehicles",
  "Sports",
  "Party & Events",
  "Furniture",
  "Books",
  "Other",
];

export default function InterestsPage() {
  const { update } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (interest: string) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected.join(",") }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await update();
      toast.success("All set!");
      router.push("/browse");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">What are you interested in?</CardTitle>
          <CardDescription>Select all the categories you&apos;d like to rent</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((interest) => {
                const isSelected = selected.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggle(interest)}
                    className={cn(
                      "rounded-lg border px-4 py-3 text-sm font-medium transition-all text-left",
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/onboarding/hear-about-us")}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Get Started"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
