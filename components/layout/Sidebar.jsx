"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Wallet,
  Tags,
  FormInput,
  UserCog,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NAV_ITEMS,
  SETTINGS_NAV_ITEMS,
  hasRoleAccess,
} from "@/config/constants";
import { LogoutButton } from "@/components/auth/LogoutButton";

const ICON_MAP = {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Wallet,
  Tags,
  FormInput,
  UserCog,
  Building2,
};

function NavLink({ item, pathname, onNavigate }) {
  const Icon = ICON_MAP[item.icon];
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-sidebar-foreground/75 hover:bg-white/8 hover:text-sidebar-foreground"
      )}
    >
      {Icon ? <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" /> : null}
      <span>{item.label}</span>
    </Link>
  );
}

export function SidebarContent({ user, onNavigate }) {
  const pathname = usePathname();
  const settingsItems = SETTINGS_NAV_ITEMS.filter((item) =>
    hasRoleAccess(user?.role, item.roles)
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-5 py-5">
        <BrandLogo size={40} className="rounded-lg p-0.5 shadow-sm ring-1 ring-white/20" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Axaline</p>
          <p className="truncate text-xs text-white/55">Medical Billing</p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-3 pb-3">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {settingsItems.length > 0 ? (
          <div className="min-h-0 flex-1 overflow-hidden">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Settings
            </p>
            <nav className="scrollbar-none max-h-full space-y-0.5 overflow-y-auto">
              {settingsItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </nav>
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-3">
        <LogoutButton variant="sidebar" onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function Sidebar({ user }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-hidden bg-sidebar-gradient lg:flex">
      <SidebarContent user={user} />
    </aside>
  );
}
