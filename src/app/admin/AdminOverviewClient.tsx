"use client";

import { motion } from "framer-motion";
import { Users, Images, Camera, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Props {
  stats: { users: number; galleries: number; photos: number };
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export function AdminOverviewClient({ stats }: Props) {
  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, href: "/admin/users", color: "text-blue-500" },
    { label: "Total Galleries", value: stats.galleries, icon: Images, href: "/admin/galleries", color: "text-purple-500" },
    { label: "Total Photos", value: stats.photos, icon: Camera, href: "/admin/photos", color: "text-gold" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-gold" />
          <p className="text-xs text-gold uppercase tracking-widest font-semibold">Admin Panel</p>
        </div>
        <h1 className="font-display text-4xl font-light italic">Overview</h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <motion.div key={label} variants={itemVariants}>
            <Link href={href}>
              <Card className="hover:border-gold/40 transition-colors group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-light">{value.toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
