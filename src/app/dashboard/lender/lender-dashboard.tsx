"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/trust-badge";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, DollarSign, TrendingUp, Users, Check, X, ArrowUpRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const statCards = [
  { key: "activeRentals", icon: Package, color: "from-indigo-500 to-indigo-600", label: "Active Rentals", bg: "indigo" },
  { key: "pendingRequests", icon: Clock, color: "from-amber-500 to-orange-600", label: "Pending Requests", bg: "amber" },
  { key: "earnings", icon: DollarSign, color: "from-emerald-500 to-green-600", label: "Total Earnings", bg: "emerald" },
  { key: "items", icon: TrendingUp, color: "from-blue-500 to-blue-600", label: "Listed Items", bg: "blue" },
];

export function LenderDashboard({ data }: { data: any }) {
  const [tab, setTab] = useState<"active" | "requests" | "items">("active");

  const handleRequest = async (rentalId: string, action: "approve" | "decline") => {
    try {
      const res = await fetch(`/api/rentals/${rentalId}/${action}`, { method: "POST" });
      if (res.ok) {
        toast.success(action === "approve" ? "Rental approved!" : "Rental declined");
        window.location.reload();
      } else {
        toast.error("Failed to process request");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lender Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your rentals and earnings</p>
        </div>
        <Link href="/list-item">
          <Button className="shadow-md shadow-indigo-500/20">
            <Package className="h-4 w-4 mr-2" />
            List New Item
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, icon: Icon, color, label }) => {
          const value = key === "earnings" ? formatPrice(data[key]) : data[key]?.length ?? data[key];
          return (
            <Card key={key} className="border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900 dark:to-indigo-950/20 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-${color.split(" ")[0].replace("from-", "")}/20`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 mb-2">
        {(["requests", "active", "items"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            {t === "requests" && `Requests (${data.pendingRequests.length})`}
            {t === "active" && `Active (${data.activeRentals.length})`}
            {t === "items" && `My Items (${data.items.length})`}
          </button>
        ))}
      </div>

      {tab === "requests" && (
        <div className="space-y-3">
          {data.pendingRequests.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No pending rental requests</p>
              </CardContent>
            </Card>
          ) : (
            data.pendingRequests.map((rental: any) => (
              <Card key={rental.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden shrink-0 border border-indigo-100 dark:border-indigo-800">
                      {rental.item.images[0] && (
                        <img src={rental.item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rental.item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rental.borrower.name || "User"} wants it for {rental.totalDays} days
                      </p>
                      <TrustBadge score={rental.borrower.trustScore} />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleRequest(rental.id, "decline")} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                      <X className="h-4 w-4 mr-1" /> Decline
                    </Button>
                    <Button size="sm" onClick={() => handleRequest(rental.id, "approve")} className="shadow-md shadow-indigo-500/20">
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "active" && (
        <div className="space-y-3">
          {data.activeRentals.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No active rentals</p>
              </CardContent>
            </Card>
          ) : (
            data.activeRentals.map((rental: any) => (
              <Card key={rental.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden shrink-0 border border-indigo-100 dark:border-indigo-800">
                      {rental.item.images[0] && (
                        <img src={rental.item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rental.item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Borrowed by {rental.borrower.name || "User"} · {formatPrice(rental.rentalFee)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full shrink-0">
                    {rental.status}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "items" && (
        <div className="space-y-3">
          {data.items.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven&apos;t listed any items yet</p>
                <Link href="/list-item">
                  <Button className="shadow-md shadow-indigo-500/20">List Your First Item</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            data.items.map((item: any) => (
              <Card key={item.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden shrink-0 border border-indigo-100 dark:border-indigo-800">
                      {item.images[0] && (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatPrice(item.dailyRate)}/day · {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      item.isActive
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}>
                      {item.isActive ? "Active" : "Paused"}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/items/${item.id}`} className="text-indigo-600 dark:text-indigo-400">
                        Edit <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {data.payouts.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Recent Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.payouts.slice(0, 5).map((payout: any) => (
                <div key={payout.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(payout.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatPrice(payout.amount)}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    payout.status === "PAID"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                  }`}>
                    {payout.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
