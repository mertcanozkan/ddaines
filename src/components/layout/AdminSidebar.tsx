"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Images, Camera as CameraIcon, Flag,
  Settings, LogOut, Camera, ChevronRight, X, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/galleries", label: "Galleries", icon: Images },
  { href: "/admin/photos", label: "Photos", icon: CameraIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-gold" />
          <span className="font-display text-lg font-semibold tracking-widest uppercase">
            DAINES<span className="text-gold">·</span>
          </span>
        </Link>
        {onMobileClose && (
          <button onClick={onMobileClose} className="ml-auto p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-gold">
          <Shield className="h-4 w-4" />
          <span className="text-xs font-semibold tracking-widest uppercase">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 relative",
                active
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {active && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute left-0 top-1 bottom-1 w-0.5 bg-gold rounded-full"
                />
              )}
              <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-gold" : "")} />
              <span>{item.label}</span>
              {active && <ChevronRight className="h-3 w-3 ml-auto text-gold" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>User Dashboard</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border fixed inset-y-0 left-0 z-40">
      <SidebarContent />
    </aside>
  );
}
