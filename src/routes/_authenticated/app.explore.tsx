import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Grid3x3, List, Map, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROPERTIES } from "@/lib/mock-properties";
import { PropertyCard } from "@/components/app/PropertyCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/explore")({ component: Explore });

const chips = ["All", "Studio", "Boarding room", "Apartment", "Furnished", "Pet-friendly", "Near campus", "Under $400"];

function Explore() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [active, setActive] = useState("All");

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Explore listings</h1>
          <p className="text-muted-foreground mt-1">{PROPERTIES.length} trusted places ready to tour.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md", view === "grid" && "bg-background shadow-sm")}>
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded-md", view === "list" && "bg-background shadow-sm")}>
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" className="gap-2"><Map className="h-4 w-4" />Map</Button>
          <Button variant="outline" className="gap-2"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="City, neighborhood, or landmark…" className="max-w-sm h-11" />
        <div className="flex gap-2 flex-wrap">
          {chips.map((c) => (
            <button key={c} onClick={() => setActive(c)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium transition border",
                active === c ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:bg-secondary"
              )}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={cn(view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4")}>
        {PROPERTIES.map((p, i) => <PropertyCard key={p.id} p={p} index={i} />)}
      </div>
    </div>
  );
}
