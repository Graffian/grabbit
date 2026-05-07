"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrustBadge } from "@/components/shared/trust-badge";
import { formatPrice } from "@/lib/utils";
import CarouselCard from "@/components/ui/carousel-card";
import { MapPin, SlidersHorizontal, X, Navigation, Search, Package, ChevronDown, ChevronUp, User, Camera } from "lucide-react";

const FEATURED_ITEMS = [
  { id: 1, imgUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop", title: "Sony A7III Camera", price: "₹499/day", location: "Mumbai" },
  { id: 2, imgUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", title: "Bosch Drill Kit", price: "₹199/day", location: "Delhi" },
  { id: 3, imgUrl: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400&h=300&fit=crop", title: "Mountain Bike", price: "₹299/day", location: "Bangalore" },
  { id: 4, imgUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop", title: "MacBook Pro M3", price: "₹999/day", location: "Pune" },
  { id: 5, imgUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop", title: "Epson Projector", price: "₹349/day", location: "Hyderabad" },
  { id: 6, imgUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop", title: "Nike Running Shoes", price: "₹149/day", location: "Chennai" },
];

interface Item {
  id: string;
  title: string;
  description?: string;
  category: string;
  dailyRate: number;
  weeklyRate?: number | null;
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
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState("");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* Profile Section */}
      {session?.user && (
        <section className="bg-gradient-to-r from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-gray-950 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-500/20 shrink-0">
              {session.user.name?.[0]?.toUpperCase() || <User className="h-7 w-7" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {session.user.name || "User"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {session.user.email || session.user.phone || ""}
              </p>
            </div>
            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="shrink-0 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                <Camera className="h-4 w-4 mr-1.5" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Browse Items</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Find exactly what you need, from people nearby</p>
          {userLocation && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1">
              <Navigation className="h-3 w-3" />
              You&apos;re in <strong>{userLocation}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Search + Filters Row */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            placeholder="Search items or locations..."
            className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-10 pr-3 py-2 text-sm text-gray-900 dark:text-gray-100 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`shrink-0 ${showFilters ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600" : ""}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm animate-fade-in">
          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 w-full mb-1">Filter by category</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory("")}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="h-3 w-3 inline mr-1" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Featured Carousel */}
      {!search && !selectedCategory && (
        <section className="bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent rounded-xl p-6 -mx-4 px-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Featured Items
          </h2>
          <CarouselCard data={FEATURED_ITEMS} cardsPerView={4} />
        </section>
      )}

      {/* Nearby Items */}
      {userLocation && nearbyItems.length > 0 && !search && !selectedCategory && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Navigation className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Near you in {userLocation}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyItems.slice(0, 4).map((item) => (
              <ItemCard key={item.id} item={item} expandedCard={expandedCard} setExpandedCard={setExpandedCard} userLocation={userLocation} />
            ))}
          </div>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
        </section>
      )}

      {/* All Items Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl">
          <Search className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No items found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {search || selectedCategory ? "Search Results" : "All Items"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(search || selectedCategory ? filtered : items).map((item) => (
              <ItemCard key={item.id} item={item} expandedCard={expandedCard} setExpandedCard={setExpandedCard} userLocation={userLocation} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ItemCard({ item, expandedCard, setExpandedCard, userLocation }: { item: Item; expandedCard: string | null; setExpandedCard: (id: string | null) => void; userLocation: string }) {
  const isExpanded = expandedCard === item.id;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCard(isExpanded ? null : item.id);
  };

  const weeklyDiscount = Math.round((1 - (parseFloat(item.weeklyRate?.toString() || "0") || 0) / (item.dailyRate * 7)) * 100);

  return (
    <div>
      <Link href={`/items/${item.id}`}>
        <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 h-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {item.images[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                <Package className="h-8 w-8" />
              </div>
            )}
          </div>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                {item.condition}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {item.location}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(item.dailyRate)}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">/day</span>
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.owner.name || "User"}
              </span>
              <TrustBadge score={item.owner.trustScore} />
            </div>

            {/* Read More Toggle */}
            <div className="pt-1">
              <button
                onClick={toggleExpand}
                className="w-full flex items-center justify-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                {isExpanded ? "Show Less" : "Read More"}
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                {item.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 dark:text-gray-400">Daily Rate</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(item.dailyRate)}</p>
                  </div>
                  {item.weeklyRate && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                      <p className="text-gray-500 dark:text-gray-400">Weekly Rate</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(Number(item.weeklyRate))}</p>
                      {weeklyDiscount > 0 && (
                        <p className="text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">Save {weeklyDiscount}%</p>
                      )}
                    </div>
                  )}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 dark:text-gray-400">Category</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{item.category}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                    <p className="text-gray-500 dark:text-gray-400">Condition</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{item.condition}</p>
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Listed by</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.owner.name || "Anonymous"}</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Distance</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.location.toLowerCase() === userLocation.toLowerCase()
                          ? "In your city"
                          : `${item.location}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Trust Score</span>
                    <TrustBadge score={item.owner.trustScore} />
                  </div>
                </div>

                <Button size="sm" className="w-full shadow-md shadow-indigo-500/20 text-xs" asChild>
                  <Link href={`/items/${item.id}`}>View Full Details</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
