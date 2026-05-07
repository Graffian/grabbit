"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Get started with basic renting",
    features: [
      "Standard deposits (100% base)",
      "15% platform fee",
      "Standard support",
      "Basic trust scoring",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Plus",
    price: 99,
    description: "For regular renters & lenders",
    features: [
      "25% deposit reduction",
      "12% platform fee",
      "Priority support",
      "Deposit protection basics",
      "Badge on profile",
    ],
    cta: "Upgrade to Plus",
    popular: true,
  },
  {
    name: "Pro",
    price: 299,
    description: "For power users & businesses",
    features: [
      "50% deposit reduction",
      "10% platform fee",
      "1 free boost per month",
      "Damage forgiveness (1x/6mo)",
      "Free delivery on rentals < ₹500",
      "Priority listing in search",
      "Dedicated support",
    ],
    cta: "Go Pro",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const currentPlan = (session?.user?.subscriptionPlan || "FREE") as string;

  const handleSubscribe = async (plan: string) => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (plan === "FREE") return;

    toast.success(`Upgrading to ${plan}...`);
    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.toUpperCase() }),
      });
      if (res.ok) {
        toast.success(`Upgraded to ${plan}!`);
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Upgrade failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-3 text-lg">
          Save on fees and deposits with a subscription
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${plan.popular ? "border-indigo-600 shadow-lg ring-2 ring-indigo-600" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                disabled={currentPlan === plan.name.toUpperCase() || plan.disabled}
                onClick={() => handleSubscribe(plan.name.toUpperCase())}
              >
                {currentPlan === plan.name.toUpperCase() ? "Current Plan" : plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
