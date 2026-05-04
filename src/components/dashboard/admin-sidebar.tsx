"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Smartphone, Users, Globe,
  BarChart3, Mail, FileText, BookOpen, Zap,
  LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import { ROUTES } from "@/constants/routes";

const navItems = [
  { label: "Dashboard",      href: ROUTES.adminDashboard,    icon: LayoutDashboard },
  { label: "Apps",           href: ROUTES.adminApps,         icon: Smartphone },
  { label: "Developers",     href: ROUTES.adminDevelopers,   icon: Users },
  { label: "Networks",       href: ROUTES.adminNetworks,     icon: Globe },
  { label: "Limit Requests", href: ROUTES.adminLimitRequests,icon: BarChart3 },
  { label: "Analytics",      href: ROUTES.adminAnalytics,    icon: BarChart3 },
  { label: "Emails",         href: ROUTES.adminEmails,       icon: Mail },
  { label: "API Docs",       href: ROUTES.adminApiDocs,      icon: BookOpen },
  { label: "Pages",          href: ROUTES.adminPages,        icon: FileText },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  const isActive = (href: string) =>
    href === ROUTES.adminDashboard ? pathname === href : pathname.startsWith(href);

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-screen sticky top-0 bg-slate-950 border-r border-slate-800 transition-all duration-300 shrink-0",
      collapsed ? "w-16" : "w-60",
    )}>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-slate-800 px-4 shrink-0", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><Zap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-base font-bold text-white">Adniba <span className="text-xs font-normal text-slate-400">Admin</span></span>
          </div>
        )}
        {collapsed && <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"><Zap className="h-3.5 w-3.5 text-white" /></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex h-6 w-6 items-center justify-center text-slate-500 hover:text-slate-300 transition-colors">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(href) ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
            collapsed && "justify-center px-2",
          )}>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className={cn("border-t border-slate-800 p-3", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-md transition-colors">
            <LogOut className="h-4 w-4" /><span>Sign Out</span>
          </button>
        ) : (
          <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors"><LogOut className="h-4 w-4" /></button>
        )}
      </div>
    </aside>
  );
}
