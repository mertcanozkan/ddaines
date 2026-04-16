import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "DAINES Gallery — Capture. Curate. Share.",
    template: "%s · DAINES Gallery",
  },
  description:
    "A premium, cinematic photo-sharing platform for photographers who demand the extraordinary.",
  openGraph: {
    title: "DAINES Gallery",
    description: "Capture. Curate. Share.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(cormorant.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
