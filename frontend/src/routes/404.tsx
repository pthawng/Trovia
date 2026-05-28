import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Home, Compass, AlertTriangle, ArrowRight } from "lucide-react";

import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "404 — Không tìm thấy trang | Trovia" },
    ],
  }),
  component: NotFoundPage,
});

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Navbar />

        {/* 404 Visual Content Section */}
        <section className="relative pt-40 pb-24 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          
          <div className="relative mx-auto max-w-lg space-y-8 z-10">
            {/* Glow Gradient Behind 404 */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[80px] -z-10" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive border border-destructive/20 shadow-sm"
            >
              <AlertTriangle className="h-8 w-8" />
            </motion.div>

            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-7xl sm:text-8xl font-black tracking-tighter text-foreground bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent"
              >
                404
              </motion.h1>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                {t("error.not_found_title")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto"
              >
                {t("error.page_not_found")}
              </motion.p>
            </div>

            {/* Navigation buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
            >
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 px-6 py-3.5 text-sm font-semibold transition"
              >
                <Home className="h-4.5 w-4.5" />
                {t("common.back_to_home")}
              </Link>
              <Link
                to="/app/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition"
              >
                <Compass className="h-4.5 w-4.5" />
                {t("property.explore_title")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
