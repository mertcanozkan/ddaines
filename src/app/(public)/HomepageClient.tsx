"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
    photoCount: number;
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
          const increment = target / 50;
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 20);
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
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
    _count: { photos: g.photoCount },
  }));

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-10 pt-14 overflow-hidden">
        {/* Subtle ambient light */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 15% 60%, rgba(208,74,26,0.06) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-end min-h-[80vh] pb-16 pt-24">

            {/* Main type block */}
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.p variants={fadeIn} className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-8 lg:mb-12">
                Photography / Curated
              </motion.p>

              <div className="overflow-hidden">
                <motion.h1
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="font-display font-light leading-[0.9] tracking-tight"
                >
                  {["Capture.", "Curate.", "Share."].map((word, i) => (
                    <motion.span
                      key={word}
                      variants={fadeUp}
                      className="block"
                      style={{
                        fontSize: "clamp(4rem, 12vw, 10rem)",
                        fontStyle: i % 2 === 0 ? "italic" : "normal",
                        color: i === 2 ? "var(--gold)" : undefined,
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h1>
              </div>
            </motion.div>

            {/* Right — description + CTAs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:max-w-[220px] flex flex-col gap-8 lg:pb-4"
            >
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                A premium cinematic platform for photographers who demand the extraordinary.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/explore"
                  className="group inline-flex items-center justify-between gap-4 px-5 py-3 border border-foreground/15 hover:border-gold hover:text-gold transition-all duration-300 text-sm"
                >
                  <span className="uppercase tracking-widest text-xs font-mono">Explore</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-between gap-4 px-5 py-3 bg-gold text-background hover:opacity-90 transition-opacity text-sm"
                >
                  <span className="uppercase tracking-widest text-xs font-mono">Join Free</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll line */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
          className="absolute bottom-8 left-10 w-px h-14 bg-gradient-to-b from-gold/50 to-transparent origin-top"
        />
      </section>

      {/* ── Stats ────────────────────────────── */}
      <section className="border-y border-border">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-3 divide-x divide-border"
        >
          {[
            { value: stats.photoCount, label: "Photos" },
            { value: stats.galleryCount, label: "Galleries" },
            { value: stats.userCount, label: "Photographers" },
          ].map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="py-10 lg:py-14 flex flex-col items-center gap-2 text-center">
              <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-gold leading-none">
                <CountUp target={value} />
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Featured Galleries ───────────────── */}
      {galleries.length > 0 && (
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-end justify-between mb-12 lg:mb-16 pb-6 border-b border-border"
            >
              <div className="flex items-end gap-6">
                <span className="text-xs font-mono text-muted-foreground mb-1">01</span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light italic leading-none">
                  Selected Works
                </h2>
              </div>
              <Link
                href="/explore"
                className="hidden sm:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
              >
                View All
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border"
            >
              {galleries.map((gallery) => (
                <motion.div key={gallery.id} variants={fadeUp} className="bg-background">
                  <GalleryCard gallery={gallery} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── CTA Strip ────────────────────────── */}
      <section className="border-t border-border py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10"
          >
            <h2 className="font-display font-light italic leading-tight" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              Start sharing<br />your work.
            </h2>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gold text-background hover:opacity-90 transition-opacity"
              >
                <span className="text-xs font-mono uppercase tracking-widest">Create Account</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/explore"
                className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                Or explore first →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
