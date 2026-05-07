"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/trust-badge";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";

export function DisputeDetail({ dispute, role }: { dispute: any; role: string }) {
  const [evidence, setEvidence] = useState<string[]>([]);
  const [resolution, setResolution] = useState("");
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN";

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setEvidence((prev) => [...prev, ...data.urls]);
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleResolve = async () => {
    if (!resolution) {
      toast.error("Select a resolution");
      return;
    }
    try {
      const res = await fetch(`/api/disputes/${dispute.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      });
      if (res.ok) {
        toast.success("Dispute resolved");
        window.location.reload();
      } else {
        toast.error("Failed to resolve");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Dispute #{dispute.id.slice(0, 8)}</CardTitle>
              <p className="text-sm text-gray-500">{dispute.type.replace("_", " ")}</p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
              dispute.status === "OPEN" ? "bg-red-100 text-red-700" :
              dispute.status === "EVIDENCE_COLLECTION" ? "bg-yellow-100 text-yellow-700" :
              dispute.status === "UNDER_REVIEW" ? "bg-blue-100 text-blue-700" :
              "bg-green-100 text-green-700"
            }`}>
              {dispute.status.replace("_", " ")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Item</h3>
            <p className="text-sm text-gray-600">{dispute.rental.item.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Borrower</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{dispute.rental.borrower.name || "User"}</span>
                <TrustBadge score={dispute.rental.borrower.trustScore} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Lender</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{dispute.rental.lender.name || "User"}</span>
                <TrustBadge score={dispute.rental.lender.trustScore} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{dispute.description}</p>
          </div>

          {dispute.status !== "RESOLVED" && (
            <div>
              <h3 className="font-medium mb-2">Upload Evidence</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-6 w-6 mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-1">Upload photos or documents</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEvidenceUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload">
                  <Button variant="outline" size="sm" className="mt-2 cursor-pointer" type="button">
                    Upload
                  </Button>
                </label>
              </div>
              {evidence.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {evidence.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          {isAdmin && dispute.status !== "RESOLVED" && (
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-medium">Resolution</h3>
              {[
                { value: "FULL_REFUND_BORROWER", label: "Full refund to borrower (lender claim rejected)" },
                { value: "FULL_DEPOSIT_LENDER", label: "Full deposit to lender (damage confirmed)" },
                { value: "PARTIAL_500", label: "Partial deduction - ₹500 to lender" },
                { value: "PARTIAL_1000", label: "Partial deduction - ₹1,000 to lender" },
                { value: "PARTIAL_2500", label: "Partial deduction - ₹2,500 to lender" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setResolution(opt.value)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                    resolution === opt.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <Button onClick={handleResolve} className="w-full">
                Resolve Dispute
              </Button>
            </div>
          )}

          {dispute.status === "RESOLVED" && dispute.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800">Resolution</p>
              <p className="text-sm text-green-700 mt-1">{dispute.resolution.replace(/_/g, " ")}</p>
              {dispute.adminNotes && (
                <p className="text-sm text-green-600 mt-1">Notes: {dispute.adminNotes}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
