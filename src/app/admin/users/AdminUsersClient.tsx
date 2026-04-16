"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Shield, UserX, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  role: string;
  status: string;
  createdAt: Date | null;
  avatarUrl: string | null;
}

interface Props {
  users: AdminUser[];
}

export function AdminUsersClient({ users: initial }: Props) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  async function promote(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });
    setUsers(users.map((u) => (u.id === id ? { ...u, role: "admin" } : u)));
  }

  async function suspend(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "suspended" }),
    });
    setUsers(users.map((u) => (u.id === id ? { ...u, status: "suspended" } : u)));
  }

  async function deleteUser(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers(users.filter((u) => u.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-light italic">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} total users</p>
        </div>
      </motion.div>

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">User</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Joined</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
              return (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className={user.role === "admin" ? "bg-gold/20 text-gold border-gold/30" : ""}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant={user.status === "active" ? "outline" : "destructive"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {user.role !== "admin" && (
                        <button onClick={() => promote(user.id)} className="p-1.5 rounded-sm hover:bg-gold/10 hover:text-gold transition-colors" title="Promote to admin">
                          <Shield className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {user.status !== "suspended" && (
                        <button onClick={() => suspend(user.id)} className="p-1.5 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors" title="Suspend user">
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget(user.id)} className="p-1.5 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors" title="Delete user">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user, all their galleries and photos. Cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteUser(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
