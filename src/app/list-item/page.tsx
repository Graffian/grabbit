"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiStepForm } from "@/components/ui/multi-step-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { DateRangePickerComponent } from "@/components/ui/date-range-picker";
import { Upload, X, Sparkles, MapPin, Info, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

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

  const canGoNext = () => {
    if (step === 1) return !!form.category && !!form.title;
    if (step === 2) return !!form.dailyRate && !!form.itemValue;
    if (step === 3) return form.images.length >= 2 && !!form.location;
    return false;
  };

  const handleNext = () => {
    if (!canGoNext()) {
      if (step === 1) toast.error("Fill in category and title");
      else if (step === 2) toast.error("Fill in daily rate and item value");
      else if (step === 3) toast.error("Add at least 2 photos and a location");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 to-white dark:from-gray-950 dark:to-indigo-950/10 py-8">
    <div className="mx-auto max-w-2xl px-4">
      <MultiStepForm
        currentStep={step}
        totalSteps={3}
        title="List Your Item"
        description="Tell us about your item and set your rental terms."
        onBack={handleBack}
        onNext={handleNext}
        disableNext={step === 3}
        nextButtonText={step === 3 ? "List Item" : "Next Step"}
      >
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a category</option>
                {Object.keys(CATEGORY_RATES).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Sony A7III Camera"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[120px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-gray-400"
                placeholder="Describe your item, its condition, what's included, etc..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Choose a clear title and accurate category to help renters find your item.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
                <div className="flex gap-2">
                  <Input
                    id="dailyRate"
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
                <Label htmlFor="weeklyRate">Weekly Rate (₹)</Label>
                <Input
                  id="weeklyRate"
                  type="number"
                  placeholder="2499"
                  value={form.weeklyRate}
                  onChange={(e) => setForm({ ...form, weeklyRate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemValue">Item Value (₹) *</Label>
              <Input
                id="itemValue"
                type="number"
                placeholder="e.g. 50000"
                value={form.itemValue}
                onChange={(e) => setForm({ ...form, itemValue: e.target.value })}
              />
              <p className="text-xs text-gray-500">Used to calculate refundable deposit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <select
                id="condition"
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location">Location *</Label>
                <Button variant="ghost" size="sm" onClick={detectLocation} type="button">
                  <MapPin className="h-4 w-4 mr-1" />
                  Detect
                </Button>
              </div>
              <Input
                id="location"
                placeholder="e.g. Mumbai, Maharashtra"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <DateRangePickerComponent />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Photos *</Label>
                <span className="text-xs text-gray-400">{form.images.length}/10</span>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
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
                <div className="grid grid-cols-5 gap-2">
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

            {form.images.length < 2 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You need at least 2 photos to list this item.
                </AlertDescription>
              </Alert>
            )}

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

            {form.images.length >= 2 && (
              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Listing..." : "List Item"}
              </Button>
            )}
          </div>
        )}
      </MultiStepForm>
      </div>
    </div>
  );
}
