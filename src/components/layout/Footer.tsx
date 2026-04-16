import Link from "next/link";
import { Camera } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <Camera className="h-5 w-5 text-gold" />
              <span className="font-display text-xl font-semibold tracking-widest uppercase">
                DAINES<span className="text-gold">·</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A premium, cinematic photo-sharing platform for photographers who
              demand the extraordinary.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-gold transition-colors">All Photos</Link></li>
              <li><Link href="/explore?category=landscape" className="hover:text-gold transition-colors">Landscape</Link></li>
              <li><Link href="/explore?category=portrait" className="hover:text-gold transition-colors">Portrait</Link></li>
              <li><Link href="/explore?category=architecture" className="hover:text-gold transition-colors">Architecture</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest uppercase mb-4">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/register" className="hover:text-gold transition-colors">Create Account</Link></li>
              <li><Link href="/auth/login" className="hover:text-gold transition-colors">Sign In</Link></li>
              <li><Link href="/dashboard" className="hover:text-gold transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/upload" className="hover:text-gold transition-colors">Upload Photos</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DAINES Gallery. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-display italic">Capture. Curate. Share.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
