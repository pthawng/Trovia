import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROPERTIES } from "@/lib/mock-properties";
import { PropertyCard } from "@/components/app/PropertyCard";

export const Route = createFileRoute("/_authenticated/app/saved")({ component: Saved });

function Saved() {
  const saved = PROPERTIES.slice(0, 4);
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Saved properties</h1>
        <p className="text-muted-foreground mt-1">{saved.length} homes you're keeping an eye on.</p>
      </div>
      {saved.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto"><Heart className="h-6 w-6" /></div>
          <h3 className="mt-5 text-lg font-semibold">No saves yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">Tap the heart icon on listings to keep them here for later.</p>
          <Button asChild className="mt-6"><Link to="/app/explore">Start exploring</Link></Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
