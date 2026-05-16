import { motion } from "motion/react";
import { ArrowRight, MapPin, Search, ShieldCheck, Sparkles, Star } from "lucide-react";
import heroImg from "@/assets/hero-apartment.jpg";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-hero-gradient overflow-hidden">
      <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 backdrop-blur px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Verified rentals, redesigned for the next generation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight"
          >
            Find your perfect space with{" "}
            <span className="text-gradient">confidence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed"
          >
            Trovia helps students and young professionals discover trusted rentals — and
            gives landlords a calm, modern way to manage every property.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#explore"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-[var(--shadow-glow)] hover:shadow-[0_14px_48px_-10px_oklch(0.45_0.22_265/0.6)] transition-all hover:-translate-y-0.5"
            >
              Explore rooms
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#landlords"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-6 py-3.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Become a landlord
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-6 pt-2 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-emerald-soft)]" />
              ID-verified hosts
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-[var(--color-amber-soft)] text-[var(--color-amber-soft)]" />
              4.9 from 12k+ tenants
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-6 relative"
        >
          <div className="relative aspect-[4/5] sm:aspect-[5/5] rounded-3xl overflow-hidden shadow-[var(--shadow-elegant)] ring-1 ring-black/5">
            <img
              src={heroImg}
              alt="Sunlit modern apartment with city view"
              width={1280}
              height={1280}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent" />
          </div>

          {/* Floating search card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-6 -left-4 sm:left-6 right-6 sm:right-auto sm:w-[360px] glass rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Searching near</p>
                <p className="text-sm font-medium truncate">RMIT University, Saigon</p>
              </div>
              <span className="text-xs font-medium text-[var(--color-emerald-soft)] bg-[oklch(0.95_0.05_165)] px-2 py-1 rounded-md">
                284 rooms
              </span>
            </div>
          </motion.div>

          {/* Floating rating card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 -right-2 sm:-right-6 glass rounded-2xl p-3 shadow-card hidden sm:block"
          >
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--color-amber-soft)] to-[oklch(0.65_0.16_50)] grid place-items-center text-white text-xs font-semibold">
                AN
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-[var(--color-amber-soft)] text-[var(--color-amber-soft)]" />
                  <span className="font-semibold">4.96</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Verified host</p>
              </div>
            </div>
          </motion.div>

          {/* Map pin pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-10 left-6 glass rounded-full px-3 py-1.5 shadow-card flex items-center gap-1.5 text-xs font-medium"
          >
            <MapPin className="h-3 w-3 text-primary" />
            District 7 · $320/mo
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
