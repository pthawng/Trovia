import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, Bookmark, Eye, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PROPERTIES } from "@/lib/mock-properties";
import { PropertyCard } from "@/components/app/PropertyCard";

export const Route = createFileRoute("/_authenticated/app/")({ component: Dashboard });

const stats = [
  { label: "Saved properties", value: "12", icon: Bookmark, color: "text-primary bg-primary-soft" },
  { label: "Recently viewed", value: "28", icon: Eye, color: "text-amber-600 bg-amber-50" },
  { label: "Active conversations", value: "3", icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
];

function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string)?.split(" ")[0] || "there";
  return (
    <div className="space-y-10 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Welcome back</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Good to see you, {name}.</h1>
        <p className="text-muted-foreground mt-2">Here's a snapshot of your search and a few homes we think you'll love.</p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-surface-elevated ring-1 ring-border p-5">
            <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-3xl font-semibold tracking-tight mt-4">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Recommended for you</h2>
            <p className="text-sm text-muted-foreground mt-1">Tailored to your saved searches in HCMC & Hanoi.</p>
          </div>
          <Link to="/app/explore" className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:underline">
            Explore all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROPERTIES.slice(0, 3).map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-5">Recently viewed</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROPERTIES.slice(3, 6).map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
        </div>
      </section>
    </div>
  );
}
