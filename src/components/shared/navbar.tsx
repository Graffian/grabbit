"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, Moon, Package, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const AUTH_PATHS = ["/login", "/onboarding", "/kyc"];
const HIDE_NAV_PATHS = ["/", ...AUTH_PATHS];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (HIDE_NAV_PATHS.includes(pathname)) return null;

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 border-b border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-r from-white via-indigo-50/40 to-white dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/browse" className="flex items-center gap-2.5 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Package className="h-4 w-4 text-white" />
          </div>
          Grabbit
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/browse" active={isActive("/browse")}>Browse</NavLink>
          {session ? (
            <>
              <NavLink href="/list-item" active={isActive("/list-item")}>List Item</NavLink>
              <NavLink href="/dashboard/lender" active={isActive("/dashboard")}>Dashboard</NavLink>
              <Link href="/notifications" className={`relative p-2 rounded-lg transition-all ${
                isActive("/notifications")
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
              }`}>
                <Bell className="h-5 w-5" />
              </Link>
              <ThemeToggleButton />
              <div className="flex items-center gap-3 pl-4 ml-2 border-l border-indigo-200/60 dark:border-indigo-800/50">
                <span className="text-sm text-gray-500 dark:text-gray-400 max-w-[120px] truncate">
                  {session.user?.name || session.user?.phone}
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login" className="ml-3">
              <Button size="sm" className="shadow-md shadow-indigo-500/20">Sign In</Button>
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-gray-950 p-4 space-y-2 animate-slide-up">
          <MobileNavLink href="/browse" onClick={() => setMobileOpen(false)}>Browse</MobileNavLink>
          {session ? (
            <>
              <MobileNavLink href="/list-item" onClick={() => setMobileOpen(false)}>List Item</MobileNavLink>
              <MobileNavLink href="/dashboard/lender" onClick={() => setMobileOpen(false)}>Dashboard</MobileNavLink>
              <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <MobileNavLink href="/login" onClick={() => setMobileOpen(false)}>Sign In</MobileNavLink>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm"
          : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
          : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
      }`}
    >
      {children}
    </Link>
  );
}

function ThemeToggleButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const el = document.documentElement;
    el.classList.toggle("dark");
    setDark(el.classList.contains("dark"));
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
