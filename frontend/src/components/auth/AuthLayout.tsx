import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Home } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col px-6 sm:px-12 py-8">
        <Link to="/" className="flex items-center gap-2 group w-fit">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">Trovia</span>
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="w-full max-w-sm">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </motion.div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Trovia. Trusted rentals for everyone.</p>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 grid place-items-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md rounded-3xl glass shadow-card p-8"
          >
            <div className="text-sm font-medium text-primary mb-3">Featured</div>
            <h3 className="text-2xl font-semibold tracking-tight">"Trovia helped me find my dream studio in two days."</h3>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-sm font-semibold">L</div>
              <div>
                <div className="text-sm font-semibold">Linh Nguyen</div>
                <div className="text-xs text-muted-foreground">Design student · D2</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
