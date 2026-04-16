"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-light italic">Admin Settings</h1>
      </motion.div>

      <div className="space-y-6">
        <div className="space-y-1.5">
          <Label>Site Name</Label>
          <Input defaultValue="DAINES Gallery" />
        </div>
        <div className="space-y-1.5">
          <Label>Tagline</Label>
          <Input defaultValue="Capture. Curate. Share." />
        </div>
        <div className="space-y-1.5">
          <Label>Contact Email</Label>
          <Input type="email" defaultValue="admin@dainesgallery.com" />
        </div>
        <Separator />
        <div className="space-y-1.5">
          <Label>Max Upload Size (MB)</Label>
          <Input type="number" defaultValue="20" className="max-w-[120px]" />
        </div>
        <button className="px-5 py-2 bg-gold text-background text-sm font-medium rounded-sm hover:opacity-90 transition-opacity">
          Save Settings
        </button>
      </div>
    </div>
  );
}
