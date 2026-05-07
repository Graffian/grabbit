"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpAZ, ArrowDownAZ, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SearchItem {
  id: number;
  creator: string;
  title: string;
  description: string;
  tags: string[];
}

interface SearchComponentProps {
  data: SearchItem[];
  onSelect?: (item: SearchItem) => void;
}

const SearchComponent = ({ data, onSelect }: SearchComponentProps) => {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");

  const lowerCaseQuery = query.toLowerCase().trim();
  const results = data.filter((item) =>
    item.title.toLowerCase().includes(lowerCaseQuery)
  );

  if (sortOrder === "asc") {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === "desc") {
    results.sort((a, b) => b.title.localeCompare(a.title));
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search items..."
            className="pl-10 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => setSortOrder("asc")} className="flex justify-between">
              <span>Title A-Z</span>
              <ArrowUpAZ className="h-4 w-4 text-gray-400" />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("desc")} className="flex justify-between">
              <span>Title Z-A</span>
              <ArrowDownAZ className="h-4 w-4 text-gray-400" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {query && (
        <ScrollArea className="h-72 w-full rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-3">
            {results.length > 0 ? (
              results.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-colors"
                  onClick={() => onSelect?.(item)}
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">No results found.</p>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export { SearchComponent };
export type { SearchItem };
