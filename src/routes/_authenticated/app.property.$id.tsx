import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { Star, MapPin, Bed, Bath, Maximize2, ShieldCheck, Heart, Share2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROPERTIES } from "@/lib/mock-properties";

export const Route = createFileRoute("/_authenticated/app/property/$id")({ component: PropertyDetail });

function PropertyDetail() {
  const { id } = useParams({ from: "/_authenticated/app/property/$id" });
  const p = PROPERTIES.find((x) => x.id === id) ?? PROPERTIES[0];

  return (
    <div className="max-w-7xl space-y-8">
      <Link to="/app/explore" className="text-sm text-muted-foreground hover:text-foreground">← Back to explore</Link>

      <div className="grid lg:grid-cols-4 gap-3 h-[420px]">
        <div className="lg:col-span-2 lg:row-span-2 rounded-2xl overflow-hidden">
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
        </div>
        <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={p.image} alt="" className="h-full w-full object-cover" /></div>
        <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={p.image} alt="" className="h-full w-full object-cover" /></div>
        <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={p.image} alt="" className="h-full w-full object-cover" /></div>
        <div className="rounded-2xl overflow-hidden hidden lg:block"><img src={p.image} alt="" className="h-full w-full object-cover" /></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{p.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-2"><MapPin className="h-4 w-4" />{p.location}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon"><Heart className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 mt-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current text-amber-500" />{p.rating} · {p.reviews} reviews</span>
              <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{p.beds} bed</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{p.baths} bath</span>
              <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4" />{p.area} m²</span>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-3">About this place</h2>
            <p className="text-muted-foreground leading-relaxed">
              A bright, calmly designed home in one of the city's friendliest neighborhoods. Walking distance to cafés, transit, and university campuses. Move-in ready with quality essentials and quick landlord response.
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-4">What's included</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {p.amenities.map((a) => (
                <div key={a} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm">{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-4">Your landlord</h2>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white font-semibold">{p.landlord.initials}</div>
              <div>
                <div className="font-semibold flex items-center gap-2">{p.landlord.name}
                  {p.landlord.verified && <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Verified</span>}
                </div>
                <div className="text-sm text-muted-foreground">Responds in ~1 hour · Joined 2023</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {[
                { name: "Anh L.", text: "Smooth move-in and a really helpful landlord. Highly recommend!", rating: 5 },
                { name: "Mai T.", text: "Quiet building, the photos match the place perfectly.", rating: 5 },
              ].map((r) => (
                <div key={r.name} className="rounded-2xl border border-border p-5">
                  <div className="flex items-center gap-1 text-amber-500 text-sm mb-2">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                  <div className="text-xs mt-3 font-medium">{r.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="sticky top-24 rounded-3xl bg-surface-elevated ring-1 ring-border p-6 shadow-[var(--shadow-elegant)]">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-semibold">${p.price}</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <div className="mt-4 space-y-3">
              <Button className="w-full h-12">Request to rent</Button>
              <Button variant="outline" className="w-full h-12 gap-2"><Calendar className="h-4 w-4" />Book a tour</Button>
            </div>
            <div className="text-xs text-muted-foreground text-center mt-3">You won't be charged yet.</div>
            <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span>${p.price}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service fee</span><span>$24</span></div>
              <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>Move-in total</span><span>${p.price * 2 + 24}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
