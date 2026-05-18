import { Link } from "@tanstack/react-router";
import { Heart, Star, MapPin, Bed, Bath, Maximize2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import heroImg from "@/assets/hero-apartment.jpg";

export function PropertyCard({ p, index = 0 }: { p: any; index?: number }) {
  const image = p.images?.[0]?.url || p.image || heroImg;
  const location = p.location || `${p.district || ""}, ${p.city || ""}`;
  const price = typeof p.price === "number" ? p.price : (p.rooms?.[0] ? Number(p.rooms[0].price) : 0);
  const beds = p.beds ?? (p.rooms?.[0] ? p.rooms[0].capacity : 1);
  const baths = p.baths ?? 1;
  const area = p.area ?? (p.rooms?.[0] ? p.rooms[0].area : 25);
  const rating = p.rating ?? 4.9;
  const isVerified = p.landlord?.verified ?? (p.landlord?.status === "ACTIVE" || true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
    >
      <Link to="/app/property/$id" params={{ id: p.id }} className="group block rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden hover:shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={image} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <button className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur grid place-items-center hover:scale-110 transition" onClick={(e) => { e.preventDefault(); }}>
            <Heart className="h-4 w-4" />
          </button>
          <div className="absolute top-3 left-3 text-[11px] font-medium bg-background/90 backdrop-blur px-2 py-1 rounded-md">{p.type}</div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold tracking-tight line-clamp-1">{p.title}</h3>
            <span className="flex items-center gap-1 text-xs font-medium"><Star className="h-3 w-3 fill-current text-amber-500" />{rating}</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{location}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
            <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{beds} Beds</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{baths} Bath</span>
            <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{area}m²</span>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
            <div>
              <span className="text-lg font-semibold">${price}</span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
            {isVerified && (
              <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Verified</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
