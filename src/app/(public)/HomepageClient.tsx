"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Camera } from "lucide-react";
import { GalleryCard, type GalleryItem } from "@/components/gallery/GalleryCard";
import { useEffect, useRef, useState } from "react";

interface HomepageClientProps {
  stats: { photoCount: number; galleryCount: number; userCount: number };
  featuredGalleries: Array<{
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    category: string | null;
    isFeatured: boolean | null;
    userName: string | null;
    username: string | null;
  }>;
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const increment = target / 60;
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

export function HomepageClient({ stats, featuredGalleries }: HomepageClientProps) {
  const galleries: GalleryItem[] = featuredGalleries.map((g) => ({
    id: g.id,
    title: g.title,
    slug: g.slug,
    coverImageUrl: g.coverImageUrl,
    category: g.category,
    isFeatured: g.isFeatured,
    visibility: "public",
    user: { name: g.userName, username: g.username },
  }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-gold/5" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, var(--gold) 0%, transparent 50%), radial-gradient(circle at 75% 50%, var(--gold) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-6"
          >
            <Camera className="h-12 w-12 text-gold mx-auto mb-6" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-display text-6xl sm:text-8xl lg:text-[10rem] font-light tracking-tight leading-none mb-4"
          >
            <span className="block italic text-foreground/90">Capture.</span>
            <span className="block text-foreground">Curate.</span>
            <span className="block italic text-gold">Share.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed"
          >
            A premium, cinematic platform for photographers who demand
            the extraordinary.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-background font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              Explore Gallery <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-3 border border-border text-foreground font-medium rounded-sm hover:border-gold hover:text-gold transition-colors"
            >
              Start Sharing
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-gold/60 to-transparent"
        />
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-8 text-center"
          >
            {[
              { value: stats.photoCount, label: "Photos" },
              { value: stats.galleryCount, label: "Galleries" },
              { value: stats.userCount, label: "Photographers" },
            ].map(({ value, label }) => (
              <motion.div key={label} variants={itemVariants}>
                <p className="font-display text-4xl sm:text-5xl font-light text-gold">
                  <CountUp target={value} />
                </p>
                <p className="text-sm text-muted-foreground mt-1 uppercase tracking-widest">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured galleries */}
      {galleries.length > 0 && (
        <section className="py-24 px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-2">Selected Works</p>
              <h2 className="font-display text-4xl sm:text-5xl font-light italic">
                Featured Galleries
              </h2>
            </div>
            <Link
              href="/explore"
              className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {galleries.map((gallery) => (
              <motion.div key={gallery.id} variants={itemVariants}>
                <GalleryCard gallery={gallery} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}
