"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/trust-badge";
import { formatPrice, calculateRentalFees, getPlatformFeeRate } from "@/lib/utils";
import { MapPin, ChevronLeft, ChevronRight, Shield, Truck, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  dailyRate: number;
  weeklyRate: number | null;
  itemValue: number;
  condition: string;
  images: string[];
  location: string;
  lat: number | null;
  lng: number | null;
  depositAmount: number | null;
  owner: {
    id: string;
    name: string | null;
    avatar: string | null;
    trustScore: number;
    city: string | null;
  };
  rentals: { startDate: Date; endDate: Date }[];
}

export function ItemDetailClient({ item }: { item: ItemDetail }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [imageIndex, setImageIndex] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [protectionPlan, setProtectionPlan] = useState<"none" | "basic" | "premium">("none");
  const [withDelivery, setWithDelivery] = useState(false);
  const [booking, setBooking] = useState(false);

  const protectionFees = { none: 0, basic: 49, premium: 99 };
  const deliveryFee = withDelivery ? 79 : 0;

  const isOwner = session?.user?.id === item.owner.id;

  const disabledDays = item.rentals.flatMap((r) => {
    const days: Date[] = [];
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  });

  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const platformFeeRate = getPlatformFeeRate(session?.user?.subscriptionPlan || "FREE");

  const fees = startDate && endDate && totalDays > 0
    ? calculateRentalFees(
        item.dailyRate,
        totalDays,
        item.itemValue,
        session?.user?.trustScore || 50,
        protectionFees[protectionPlan],
        deliveryFee,
        platformFeeRate
      )
    : null;

  const handleBook = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select rental dates");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          protectionPlan,
          withDelivery,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Booking failed");
        return;
      }

      const paymentRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId: data.rental.id }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        toast.error(paymentData.error || "Payment failed");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.order.amount,
        currency: "INR",
        name: "Grabbit",
        description: `Rental: ${item.title}`,
        order_id: paymentData.order.id,
        prefill: { contact: session.user.phone },
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rentalId: data.rental.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            toast.success("Booking confirmed!");
            router.push("/dashboard/borrower");
          } else {
            toast.error(verifyData.error || "Payment verification failed");
          }
        },
        modal: { escape: false },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[16/9]">
            {item.images[imageIndex] ? (
              <img src={item.images[imageIndex]} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
            {item.images.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full"
                  onClick={() => setImageIndex((i) => (i === 0 ? item.images.length - 1 : i - 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full"
                  onClick={() => setImageIndex((i) => (i === item.images.length - 1 ? 0 : i + 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {imageIndex + 1}/{item.images.length}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {item.condition}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {item.location}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(item.dailyRate)}</span>
                <span className="text-gray-500">/day</span>
                {item.weeklyRate && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formatPrice(item.weeklyRate)}/week
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  Select Dates
                </label>
                <DayPicker
                  mode="range"
                  selected={{ from: startDate, to: endDate }}
                  onSelect={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                  disabled={[...disabledDays, { before: new Date() }]}
                  modifiersClassNames={{
                    selected: "bg-indigo-600 text-white",
                    today: "text-indigo-600 font-bold",
                  }}
                  className="border rounded-lg p-3"
                />
              </div>

              {fees && (
                <>
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rental ({totalDays} days)</span>
                      <span className="font-medium">{formatPrice(fees.rentalFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform fee ({(platformFeeRate * 100).toFixed(0)}%)</span>
                      <span className="font-medium">{formatPrice(fees.platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Refundable Deposit
                      </span>
                      <span className="font-medium text-green-600">{formatPrice(fees.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (18%)</span>
                      <span className="font-medium">{formatPrice(fees.taxes)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                      <span>Total Payable</span>
                      <span>{formatPrice(fees.totalPaid)}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      *{formatPrice(fees.depositAmount)} is refundable and will be returned after a successful return
                    </p>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Protection Plan
                    </label>
                    {(["none", "basic", "premium"] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setProtectionPlan(plan)}
                        className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                          protectionPlan === plan
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="font-medium capitalize">{plan === "none" ? "No Protection" : plan === "basic" ? "Basic" : "Premium"}</span>
                        <span className="float-right">{plan === "none" ? "Free" : `₹${protectionFees[plan]}`}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery
                    </label>
                    <button
                      onClick={() => setWithDelivery(!withDelivery)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        withDelivery
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {withDelivery ? "Added (₹79)" : "Add"}
                    </button>
                  </div>
                </>
              )}

              <Button
                className="w-full text-base py-6"
                onClick={handleBook}
                disabled={!fees || booking || isOwner}
              >
                {isOwner ? "This is your item" : booking ? "Processing..." : "Rent Now"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                {(item.owner.name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.owner.name || "User"}</p>
                <p className="text-xs text-gray-500">{item.owner.city || ""}</p>
              </div>
              <TrustBadge score={item.owner.trustScore} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
