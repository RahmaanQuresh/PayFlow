"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  BarChart3,
  Scale,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import React from "react";
import { signOut } from "next-auth/react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  BarChart3,
  Scale,
  Settings,
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 h-16 border-b-2 border-foreground bg-card">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="font-display text-xl font-black tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                PayFlow
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 flex-col border-r-2 border-foreground bg-card p-4">
          <nav className="flex flex-col gap-1">
            {navigation.main.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 bouncy",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white shadow-hard-sm border-2 border-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:border-2 hover:border-foreground hover:-translate-x-[2px]"
                  )}
                >
                  {Icon && (
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                        isActive
                          ? "bg-white/20"
                          : "bg-muted group-hover:bg-primary/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed left-0 top-0 h-full w-64 bg-card border-r-2 border-foreground p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-lg font-black tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  PayFlow
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1">
                {navigation.main.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary to-secondary text-white shadow-hard-sm border-2 border-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {Icon && (
                        <span
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            isActive ? "bg-white/20" : "bg-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
