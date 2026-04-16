"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SessionProvider } from "next-auth/react";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        }}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="lg:pl-60">
        {/* Mobile header */}
        <div className="lg:hidden h-14 flex items-center px-4 border-b border-border bg-card sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 hover:bg-muted rounded">
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-3 font-display text-lg font-semibold tracking-widest uppercase">
            DAINES<span className="text-gold">·</span>
          </span>
        </div>
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SessionProvider>
  );
}
