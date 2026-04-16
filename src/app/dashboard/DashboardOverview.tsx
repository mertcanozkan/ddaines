"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Images, Camera, Heart, Upload, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Props {
  user: { name?: string | null; email: string };
  stats: { galleries: number; photos: number; likes: number };
}

export function DashboardOverview({ user, stats }: Props) {
  const statCards = [
    { label: "Galleries", value: stats.galleries, icon: Images, href: "/dashboard/galleries" },
    { label: "Photos", value: stats.photos, icon: Camera, href: "/dashboard/upload" },
    { label: "Liked", value: stats.likes, icon: Heart, href: "/dashboard/likes" },
  ];

  const quickActions = [
    { label: "Create Gallery", icon: Plus, href: "/dashboard/galleries", color: "text-gold" },
    { label: "Upload Photos", icon: Upload, href: "/dashboard/upload", color: "text-gold" },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-muted-foreground text-sm">Welcome back,</p>
        <h1 className="font-display text-4xl font-light italic mt-1">
          {user.name ?? user.email.split("@")[0]}
        </h1>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {statCards.map(({ label, value, icon: Icon, href }) => (
          <motion.div key={label} variants={itemVariants}>
            <Link href={href}>
              <Card className="hover:border-gold/40 transition-colors group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-light">{value.toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display text-xl font-light italic mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-sm hover:border-gold/40 hover:bg-gold/5 transition-all text-sm"
            >
              <Icon className={`h-4 w-4 ${color}`} />
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
