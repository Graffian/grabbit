"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Upload, X, Sparkles, MapPin } from "lucide-react";

const CATEGORY_RATES: Record<string, { min: number; max: number }> = {
  Electronics: { min: 100, max: 2000 },
  Cameras: { min: 500, max: 5000 },
  Tools: { min: 100, max: 1500 },
  Sports: { min: 200, max: 3000 },
  Vehicles: { min: 500, max: 10000 },
  Furniture: { min: 100, max: 3000 },
  Party: { min: 200, max: 5000 },
  Other: { min: 50, max: 2000 },
};

export default function ListItemPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    dailyRate: "",
    weeklyRate: "",
    itemValue: "",
    condition: "Good",
    location: "",
    images: [] as string[],
  });

  if (!session) {
    router.push("/login");
    return null;
  }

  const suggestPrice = () => {
    const rates = CATEGORY_RATES[form.category];
    if (!rates) {
      toast.error("Select a category first");
      return;
    }
    const value = parseFloat(form.itemValue) || 0;
    const suggested = Math.round(Math.min(Math.max(value * 0.02, rates.min), rates.max));
    setForm((f) => ({ ...f, dailyRate: suggested.toString() }));
    toast.success(`Suggested rate: ₹${suggested}/day`);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.state || "Unknown";
          setForm((f) => ({ ...f, location: city }));
          toast.success(`Detected: ${city}`);
        } catch {
          toast.error("Could not detect city name");
        }
      },
      () => toast.error("Location permission denied"),
      { enableHighAccuracy: true }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (files.length + form.images.length > 10) {
      toast.error("Max 10 photos allowed");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm((f) => ({ ...f, images: [...f.images, ...data.urls] }));
        toast.success(`${data.urls.length} photo(s) uploaded`);
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.dailyRate || !form.itemValue || !form.location) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.images.length < 2) {
      toast.error("Upload at least 2 photos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/items/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dailyRate: parseFloat(form.dailyRate),
          weeklyRate: form.weeklyRate ? parseFloat(form.weeklyRate) : null,
          itemValue: parseFloat(form.itemValue),
        }),
      });
      if (res.ok) {
        toast.success("Item listed successfully!");
        router.push("/browse");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to list item");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">List Your Item</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {Object.keys(CATEGORY_RATES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="e.g. Sony A7III Camera"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  placeholder="Describe your item, its condition, what's included, etc..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full">Next</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Rate (₹) *</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="499"
                      value={form.dailyRate}
                      onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={suggestPrice}
                      title="Suggest a fair price"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekly Rate (₹)</label>
                  <Input
                    type="number"
                    placeholder="2499"
                    value={form.weeklyRate}
                    onChange={(e) => setForm({ ...form, weeklyRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Value (₹) *</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={form.itemValue}
                  onChange={(e) => setForm({ ...form, itemValue: e.target.value })}
                />
                <p className="text-xs text-gray-500">Used to calculate refundable deposit</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition *</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Location *</label>
                  <Button variant="ghost" size="sm" onClick={detectLocation} type="button">
                    <MapPin className="h-4 w-4 mr-1" />
                    Detect
                  </Button>
                </div>
                <Input
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Photos *</label>
                  <span className="text-xs text-gray-400">{form.images.length}/10</span>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="text-sm font-medium text-gray-700 mt-2">Upload photos of your item</p>
                  <p className="text-xs text-gray-500 mt-1">Add at least 2 photos, 5+ recommended for best results</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="mt-3"
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? "Uploading..." : "Select Photos"}
                  </Button>
                </div>
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {form.itemValue && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <p className="text-sm text-indigo-700">
                    Refundable deposit: <strong>₹{Math.max(Math.round(parseFloat(form.itemValue) * 0.2), 200)}</strong>
                  </p>
                  <p className="text-xs text-indigo-500 mt-1">
                    Final deposit depends on borrower's trust score and subscription plan
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} disabled={loading || form.images.length < 2} className="flex-1">
                  {loading ? "Listing..." : `List Item${form.images.length >= 2 ? "" : " (need 2+ photos)"}`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
