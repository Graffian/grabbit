"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, DollarSign, Shield, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

const statCards = [
  { key: "activeRentals", icon: Package, color: "from-indigo-500 to-indigo-600", label: "Active Rentals" },
  { key: "rentalHistory", icon: Clock, color: "from-blue-500 to-blue-600", label: "Past Rentals" },
  { key: "heldDeposits", icon: DollarSign, color: "from-emerald-500 to-green-600", label: "Deposits Held" },
  { key: "plan", icon: Shield, color: "from-purple-500 to-purple-600", label: "Plan" },
];

export function BorrowerDashboard({ data }: { data: any }) {
  const [tab, setTab] = useState<"active" | "history">("active");

  const getDepositStatusColor = (status: string) => {
    switch (status) {
      case "HELD": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      case "RELEASED": return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
      case "PARTIALLY_DEDUCTED": return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
      case "DEDUCTED": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  const statValues: Record<string, string | number> = {
    activeRentals: data.activeRentals.length,
    rentalHistory: data.rentalHistory.length,
    heldDeposits: data.deposits.filter((d: any) => d.status === "HELD").length,
    plan: (data.subscription?.plan || "FREE"),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Rentals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your rentals, deposits, and subscription</p>
        </div>
        <div className="flex gap-2">
          {data.subscription?.plan === "FREE" && (
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                Upgrade Plan
              </Button>
            </Link>
          )}
          <Link href="/browse">
            <Button size="sm" className="shadow-md shadow-indigo-500/20">
              <Search className="h-4 w-4 mr-2" />
              Browse Items
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, icon: Icon, color, label }) => {
          const value = statValues[key];
          return (
            <Card key={key} className="border-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-900 dark:to-indigo-950/20 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {key === "plan" ? (
                      <span className="capitalize">{value}</span>
                    ) : (
                      value
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2 mb-2">
        {(["active", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
          >
            {t === "active" ? `Active (${data.activeRentals.length})` : `History (${data.rentalHistory.length})`}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {data.activeRentals.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No active rentals</p>
                <Link href="/browse">
                  <Button className="shadow-md shadow-indigo-500/20">Browse Items</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            data.activeRentals.map((rental: any) => (
              <Card key={rental.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden shrink-0 border border-indigo-100 dark:border-indigo-800">
                      {rental.item.images[0] && (
                        <img src={rental.item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rental.item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From {rental.lender.name || "Lender"} · {formatPrice(rental.rentalFee)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 shrink-0" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {data.rentalHistory.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No rental history yet</p>
              </CardContent>
            </Card>
          ) : (
            data.rentalHistory.map((rental: any) => (
              <Card key={rental.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden shrink-0 border border-indigo-100 dark:border-indigo-800">
                      {rental.item.images[0] && (
                        <img src={rental.item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{rental.item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatPrice(rental.rentalFee)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    rental.status === "RETURNED"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                    {rental.status}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {data.deposits.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Deposits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.deposits.map((deposit: any) => (
                <div key={deposit.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{deposit.rental.item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatPrice(deposit.amount)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDepositStatusColor(deposit.status)}`}>
                    {deposit.status.replace("_", " ")}
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
