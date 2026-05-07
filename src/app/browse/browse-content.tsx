"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/trust-badge";
import { formatPrice } from "@/lib/utils";
import { Search, MapPin, SlidersHorizontal, X, Navigation } from "lucide-react";

interface Item {
  id: string;
  title: string;
  description?: string;
  category: string;
  dailyRate: number;
  images: string[];
  location: string;
  condition: string;
  owner: {
    id: string;
    name: string | null;
    avatar: string | null;
    trustScore: number;
    city: string | null;
  };
}

export function BrowseContent({
  items,
  categories,
}: {
  items: Item[];
  categories: string[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state || "";
            if (city) setUserLocation(city);
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const nearbyItems = userLocation
    ? filtered.filter((item) => item.location.toLowerCase().includes(userLocation.toLowerCase()))
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
          <p className="text-gray-500 mt-1">Find exactly what you need, from people nearby</p>
          {userLocation && (
            <p className="text-xs text-indigo-600 flex items-center gap-1 mt-1">
              <Navigation className="h-3 w-3" />
              You&apos;re in <strong>{userLocation}</strong>
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search items or locations..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-indigo-50 border-indigo-300" : ""}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border animate-fade-in">
            <span className="text-sm font-medium text-gray-700 w-full mb-1">Category</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <X className="h-3 w-3 inline mr-1" />
                Clear
              </button>
            )}
          </div>
        )}

        {userLocation && nearbyItems.length > 0 && !search && !selectedCategory && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-indigo-600" />
              Near you in {userLocation}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyItems.slice(0, 4).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
            <hr className="my-6 border-gray-200" />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(search || selectedCategory ? filtered : items).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item.id}`}>
      <Card className="group hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
        <div className="aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
          {item.images[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full whitespace-nowrap">
              {item.condition}
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {item.location}
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(item.dailyRate)}<span className="text-sm font-normal text-gray-500">/day</span>
          </p>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-500 truncate">
              {item.owner.name || "User"}
            </span>
            <TrustBadge score={item.owner.trustScore} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
