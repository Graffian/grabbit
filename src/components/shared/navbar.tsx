"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, Package } from "lucide-react";
import { useState } from "react";

const AUTH_PATHS = ["/login", "/onboarding", "/kyc"];
const HIDE_NAV_PATHS = ["/", ...AUTH_PATHS];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (HIDE_NAV_PATHS.includes(pathname)) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-indigo-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/browse" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <Package className="h-6 w-6" />
          Grabbit
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            Browse
          </Link>
          {session ? (
            <>
              <Link href="/list-item" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                List Item
              </Link>
              <Link href="/dashboard/lender" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/notifications" className="relative text-gray-600 hover:text-indigo-600">
                <Bell className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-indigo-100">
                <span className="text-sm text-gray-500">{session.user?.name || session.user?.phone}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-100 bg-white p-4 space-y-3">
          <Link href="/browse" className="block text-sm font-medium text-gray-600">Browse</Link>
          {session ? (
            <>
              <Link href="/list-item" className="block text-sm font-medium text-gray-600">List Item</Link>
              <Link href="/dashboard/lender" className="block text-sm font-medium text-gray-600">Dashboard</Link>
              <button onClick={() => signOut()} className="block text-sm font-medium text-red-600">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="block text-sm font-medium text-indigo-600">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
