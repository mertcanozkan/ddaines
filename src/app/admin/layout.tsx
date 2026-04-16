import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") redirect("/");

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-60">
          <main className="p-6 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
