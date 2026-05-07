"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatPrice } from "@/lib/utils";
import { Package, Clock, DollarSign, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export function BorrowerDashboard({ data }: { data: any }) {
  const [tab, setTab] = useState<"active" | "history">("active");

  const getDepositStatusColor = (status: string) => {
    switch (status) {
      case "HELD": return "bg-yellow-100 text-yellow-700";
      case "RELEASED": return "bg-green-100 text-green-700";
      case "PARTIALLY_DEDUCTED": return "bg-orange-100 text-orange-700";
      case "DEDUCTED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Rentals</h1>
        {data.subscription?.plan === "FREE" && (
          <Link href="/pricing">
            <Button variant="outline" size="sm">Upgrade to Plus</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold">{data.activeRentals.length}</p>
              <p className="text-xs text-gray-500">Active Rentals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{data.rentalHistory.length}</p>
              <p className="text-xs text-gray-500">Past Rentals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">
                {data.deposits.filter((d: any) => d.status === "HELD").length}
              </p>
              <p className="text-xs text-gray-500">Deposits Held</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold capitalize">{data.subscription?.plan || "FREE"}</p>
              <p className="text-xs text-gray-500">Plan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        {(["active", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "active" ? `Active (${data.activeRentals.length})` : `History (${data.rentalHistory.length})`}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-3">
          {data.activeRentals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 mb-4">No active rentals</p>
                <Link href="/browse">
                  <Button>Browse Items</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            data.activeRentals.map((rental: any) => (
              <Card key={rental.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-gray-100 overflow-hidden">
                      {rental.item.images[0] && (
                        <img src={rental.item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{rental.item.title}</p>
                      <p className="text-sm text-gray-500">
                        From {rental.lender.name || "Lender"} · {formatPrice(rental.rentalFee)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-3">
          {data.rentalHistory.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No rental history yet</p>
              </CardContent>
            </Card>
          ) : (
            data.rentalHistory.map((rental: any) => (
              <Card key={rental.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                      {rental.item.images[0] && (
                        <img src={rental.item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{rental.item.title}</p>
                      <p className="text-sm text-gray-500">{formatPrice(rental.rentalFee)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    rental.status === "RETURNED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
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
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.deposits.map((deposit: any) => (
                <div key={deposit.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{deposit.rental.item.title}</p>
                    <p className="text-xs text-gray-500">{formatPrice(deposit.amount)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDepositStatusColor(deposit.status)}`}>
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
