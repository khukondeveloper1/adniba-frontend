"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  Globe,
  Code2,
  Settings,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeveloperAuth } from "@/components/providers/developer-auth-provider";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

// ─────────────────────────────────────────────────────────────────
// DEVELOPER SIDEBAR
// ─────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard",    href: ROUTES.dashboard,    icon: LayoutDashboard },
  { label: "Apps",         href: ROUTES.apps,         icon: Smartphone },
  { label: "External API", href: ROUTES.externalApi,  icon: Code2 },
  { label: "Settings",     href: ROUTES.devSettings,  icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function DeveloperSidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useDeveloperAuth();

  const isActive = (href: string) =>
    href === ROUTES.dashboard
      ? pathname === href
      : pathname.startsWith(href);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border px-4 shrink-0",
        collapsed ? "justify-center" : "justify-between",
      )}>
        {!collapsed && (
          <Link href={ROUTES.dashboard} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">Adniba</span>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className={cn(
        "border-t border-sidebar-border p-3 shrink-0",
        collapsed && "flex justify-center",
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              {user ? getInitials(user.name) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-sidebar-foreground/40 hover:text-red-400 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="text-sidebar-foreground/40 hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60",
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          <aside className="relative z-10 flex w-64 flex-col h-full bg-sidebar">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

// ── Mobile topbar trigger ─────────────────────────────────────────

export function DashboardTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useDeveloperAuth();
  const pathname = usePathname();

  // Derive page title from pathname
  const title = navItems.find((n) => pathname.startsWith(n.href) && n.href !== ROUTES.dashboard)?.label
    ?? (pathname === ROUTES.dashboard ? "Dashboard" : "");

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-white/95 backdrop-blur-sm px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-sm font-semibold text-slate-900 flex-1">{title}</h1>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="hidden sm:inline">{user?.remaining_slots ?? "—"} app slots remaining</span>
      </div>
    </header>
  );
}
