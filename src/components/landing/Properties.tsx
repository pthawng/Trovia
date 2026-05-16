import { motion } from "motion/react";
import { Heart, MapPin, Star, Wifi, Bed, Bath } from "lucide-react";
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";

const properties = [
  {
    img: p1,
    title: "Sunlit Studio · Thao Dien",
    location: "District 2 · 8 min to RMIT",
    price: 320,
    rating: 4.96,
    tags: ["Near University", "Verified"],
    beds: 1, baths: 1,
  },
  {
    img: p2,
    title: "Quiet Boarding Room",
    location: "District 10 · Bach Khoa area",
    price: 180,
    rating: 4.82,
    tags: ["New", "Verified"],
    beds: 1, baths: 1,
  },
  {
    img: p3,
    title: "Skyline Loft Apartment",
    location: "District 1 · City center",
    price: 540,
    rating: 4.91,
    tags: ["Featured", "Verified"],
    beds: 1, baths: 1,
  },
];

export function Properties() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <div className="text-sm font-medium text-primary mb-3">Featured stays</div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Handpicked rooms,<br className="hidden sm:block" /> ready to move in.
            </h2>
          </div>
          <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Browse all listings →
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p, i) => (
            <motion.article
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-3xl bg-surface-elevated ring-1 ring-border overflow-hidden shadow-card hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="glass text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full glass hover:scale-110 transition-transform" aria-label="Save">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-base leading-snug">{p.title}</h3>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="h-3.5 w-3.5 fill-[var(--color-amber-soft)] text-[var(--color-amber-soft)]" />
                    <span className="font-medium">{p.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.location}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {p.beds} bed</span>
                  <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {p.baths} bath</span>
                  <span className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> Fiber</span>
                </div>
                <div className="flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <span className="text-2xl font-semibold">${p.price}</span>
                    <span className="text-sm text-muted-foreground"> / month</span>
                  </div>
                  <button className="text-sm font-medium text-primary hover:underline underline-offset-4">
                    View details
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
