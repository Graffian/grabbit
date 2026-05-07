"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface AdminData {
  rentals: any[];
  users: any[];
  disputes: any[];
  kycQueue: any[];
  revenue: { _sum: { platformFee: number | null; rentalFee: number | null } };
}

export function AdminDashboard({ data }: { data: AdminData }) {
  const [tab, setTab] = useState<"overview" | "kyc" | "disputes" | "users">("overview");

  const handleKyc = async (userId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/kyc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        toast.success(`KYC ${action}d`);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to process KYC");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Rentals</p>
            <p className="text-2xl font-bold">{data.rentals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{data.users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Open Disputes</p>
            <p className="text-2xl font-bold">{data.disputes.filter((d: any) => d.status !== "RESOLVED").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Platform Revenue</p>
            <p className="text-2xl font-bold">{formatPrice(data.revenue._sum.platformFee || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        {(["overview", "kyc", "disputes", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t === "kyc" ? `KYC (${data.kycQueue.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Rentals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.rentals.slice(0, 10).map((rental: any) => (
                  <div key={rental.id} className="flex justify-between items-center text-sm py-2 border-b last:border-0">
                    <span className="font-medium">{rental.item.title}</span>
                    <span className="text-gray-500">{rental.borrower.name || "User"}</span>
                    <span className="text-gray-500">{formatPrice(rental.rentalFee)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      rental.status === "RETURNED" ? "bg-green-100 text-green-700" :
                      rental.status === "ACTIVE" ? "bg-blue-100 text-blue-700" :
                      rental.status === "DISPUTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{rental.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "kyc" && (
        <div className="space-y-3">
          {data.kycQueue.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No pending KYC verifications
              </CardContent>
            </Card>
          ) : (
            data.kycQueue.map((user: any) => (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name || "User"} ({user.phone})</p>
                    <p className="text-sm text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleKyc(user.id, "reject")}>
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleKyc(user.id, "approve")}>
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "disputes" && (
        <div className="space-y-3">
          {data.disputes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No disputes
              </CardContent>
            </Card>
          ) : (
            data.disputes.map((dispute: any) => (
              <Card key={dispute.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{dispute.type.replace("_", " ")}</p>
                    <p className="text-sm text-gray-500">{dispute.rental.item.title}</p>
                    <p className="text-xs text-gray-400">By {dispute.raisedBy.name || "User"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dispute.status === "OPEN" ? "bg-red-100 text-red-700" :
                      dispute.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{dispute.status.replace("_", " ")}</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/disputes/${dispute.id}`}>Review</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          {data.users.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name || "No name"} ({user.phone})</p>
                  <p className="text-sm text-gray-500">
                    Trust: {user.trustScore} · KYC: {user.kycStatus} · Role: {user.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
