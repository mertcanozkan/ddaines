"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Images, Upload, Heart, Settings, LogOut,
  Camera, ChevronRight, X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/galleries", label: "My Galleries", icon: Images },
  { href: "/dashboard/upload", label: "Upload Photos", icon: Upload },
  { href: "/dashboard/likes", label: "Liked Photos", icon: Heart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function DashboardSidebar({ user, mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
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

      {/* User info */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-gold/30">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-sm bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name ?? "Photographer"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
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
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 group relative",
                active
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
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

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
