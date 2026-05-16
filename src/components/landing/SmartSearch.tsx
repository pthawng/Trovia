import { Building2, DollarSign, GraduationCap, MapPin, Search } from "lucide-react";

const chips = [
  "Near University",
  "Under $400",
  "Studio",
  "Pet friendly",
  "Furnished",
  "Short term",
];

export function SmartSearch() {
  return (
    <section id="explore" className="relative -mt-8 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-3xl bg-surface-elevated shadow-[var(--shadow-elegant)] ring-1 ring-border p-4 sm:p-6">
        <div className="grid md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 items-center">
          <Field icon={<MapPin className="h-4 w-4" />} label="Location" value="Ho Chi Minh City" />
          <Field icon={<DollarSign className="h-4 w-4" />} label="Budget" value="$200 – $500" />
          <Field icon={<Building2 className="h-4 w-4" />} label="Room type" value="Studio · 1BR" />
          <Field icon={<GraduationCap className="h-4 w-4" />} label="Nearby" value="RMIT, FTU" />
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 text-sm font-medium shadow-[var(--shadow-glow)] hover:opacity-95 transition">
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-primary-soft hover:text-primary hover:border-primary/20 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="group rounded-xl px-4 py-2.5 hover:bg-secondary transition-colors cursor-pointer">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}
