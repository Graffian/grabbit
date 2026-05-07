"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function KYCPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ aadhaar?: string; pan?: string }>({});

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleUpload = async (type: "aadhaar" | "pan") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("files", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setFiles((prev) => ({ ...prev, [type]: data.urls[0] }));
          toast.success(`${type === "aadhaar" ? "Aadhaar" : "PAN"} uploaded`);
        }
      } catch {
        toast.error("Upload failed");
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!files.aadhaar) {
      toast.error("Please upload your Aadhaar card");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(files),
      });
      if (res.ok) {
        toast.success("KYC documents submitted for verification");
        router.push("/browse");
      } else {
        toast.error("Failed to submit KYC");
      }
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
          <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
          <CardDescription>Upload your KYC documents to build trust on Grabbit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="font-medium mt-2">Aadhaar Card {files.aadhaar && "✓"}</p>
              <p className="text-xs text-gray-500">Front & back accepted</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleUpload("aadhaar")}>
                {files.aadhaar ? "Change" : "Upload"}
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="font-medium mt-2">PAN Card {files.pan && "✓"}</p>
              <p className="text-xs text-gray-500">Optional but recommended</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleUpload("pan")}>
                {files.pan ? "Change" : "Upload"}
              </Button>
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !files.aadhaar}>
            {loading ? "Submitting..." : "Submit for Verification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
