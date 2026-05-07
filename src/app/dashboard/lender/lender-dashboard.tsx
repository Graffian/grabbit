"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/trust-badge";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, DollarSign, TrendingUp, Users, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Lender Dashboard</h1>

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
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{data.pendingRequests.length}</p>
              <p className="text-xs text-gray-500">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{formatPrice(data.earnings)}</p>
              <p className="text-xs text-gray-500">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{data.items.length}</p>
              <p className="text-xs text-gray-500">Listed Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        {(["requests", "active", "items"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No pending rental requests</p>
              </CardContent>
            </Card>
          ) : (
            data.pendingRequests.map((rental: any) => (
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
                      <p className="text-sm text-gray-500">
                        {rental.borrower.name || "User"} wants it for {rental.totalDays} days
                      </p>
                      <TrustBadge score={rental.borrower.trustScore} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleRequest(rental.id, "decline")}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleRequest(rental.id, "approve")}>
                      <Check className="h-4 w-4" />
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
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No active rentals</p>
              </CardContent>
            </Card>
          ) : (
            data.activeRentals.map((rental: any) => (
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
                      <p className="text-sm text-gray-500">
                        Borrowed by {rental.borrower.name || "User"} · {formatPrice(rental.rentalFee)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
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
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500 mb-4">You haven&apos;t listed any items yet</p>
                <Link href="/list-item">
                  <Button>List Your First Item</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            data.items.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                      {item.images[0] && (
                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.dailyRate)}/day · {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.isActive ? "Active" : "Paused"}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/items/${item.id}`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {data.payouts.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.payouts.slice(0, 5).map((payout: any) => (
                <div key={payout.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{new Date(payout.createdAt).toLocaleDateString()}</span>
                  <span className="font-medium">{formatPrice(payout.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    payout.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
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
