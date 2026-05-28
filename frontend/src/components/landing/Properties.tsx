import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Heart, MapPin, Wifi, Users, LayoutGrid, AlertCircle, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ListingService } from "@/services/listing.service";
import type { Property } from "@/services/property.service";
import { useTranslation } from "react-i18next";

export function Properties() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["publicFeaturedListings"],
    queryFn: () => ListingService.search({ limit: 6, status: "PUBLISHED" }),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Handle both { listings: Property[] } and raw Property[] formats safely
  const listings: Property[] = data
    ? Array.isArray(data)
      ? data
      : (data as any).listings || []
    : [];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 text-left">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{t("landing.properties.tag")}</div>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
              {t("landing.properties.title")}
            </h2>
          </div>
          <Link
            to="/app/explore"
            className="text-sm font-semibold text-primary hover:underline underline-offset-4 flex items-center gap-1.5"
          >
            {t("landing.properties.view_all")}
          </Link>
        </div>

        {/* Loading skeleton state */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl border border-border bg-surface-elevated overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-muted/60" />
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-muted/60 rounded-lg w-3/4" />
                  <div className="h-4 bg-muted/60 rounded-lg w-1/2" />
                  <div className="h-4 bg-muted/60 rounded-lg w-2/3" />
                  <div className="pt-4 border-t border-border flex justify-between">
                    <div className="h-6 bg-muted/60 rounded-lg w-1/3" />
                    <div className="h-6 bg-muted/60 rounded-lg w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Error state */}
        {!isLoading && error && (
          <div className="text-center py-16 border border-dashed border-destructive/20 rounded-3xl bg-destructive/5 space-y-4 max-w-2xl mx-auto">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto animate-bounce" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">{t("landing.properties.error_title")}</h4>
              <p className="text-xs text-muted-foreground">{t("landing.properties.error_desc")}</p>
            </div>
            <Link
              to="/app/explore"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 transition-all"
            >
              {t("landing.properties.retry_btn")}
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-3xl bg-muted/10 space-y-4 max-w-2xl mx-auto">
            <Home className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">{t("landing.properties.empty_title")}</h4>
              <p className="text-xs text-muted-foreground">{t("landing.properties.empty_desc")}</p>
            </div>
          </div>
        )}

        {/* Real listings grid */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {listings.map((p, i) => {
              const displayImage = p.images?.[0]?.url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";
              const firstRoom = p.rooms?.[0];
              const minPrice = firstRoom?.price
                ? `${firstRoom.price.toLocaleString("vi-VN")} VND`
                : t("landing.properties.contact_price");
              const area = firstRoom?.area ? `${firstRoom.area} m²` : t("landing.properties.no_update");
              const capacity = firstRoom?.capacity ? t("landing.properties.max_guests", { count: firstRoom.capacity }) : t("landing.properties.no_update");
              const typeLabel = t(`landing.properties.type_labels.${p.type}`) || t("landing.properties.type_labels.BOARDING_HOUSE");

              return (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group rounded-3xl bg-surface-elevated ring-1 ring-border overflow-hidden shadow-card hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={displayImage}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="glass text-[11px] font-semibold px-2.5 py-1 rounded-full text-foreground">
                          {typeLabel}
                        </span>
                        {p.hasParking && (
                          <span className="glass text-[11px] font-semibold px-2.5 py-1 rounded-full text-foreground">
                            {t("landing.properties.parking_label")}
                          </span>
                        )}
                      </div>
                      <Link
                        to="/app/property/$id"
                        params={{ id: p.id }}
                        className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full glass hover:scale-110 transition-transform text-foreground"
                      >
                        <Heart className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="font-semibold text-base leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {p.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="line-clamp-1">{p.address}, {p.district}, {p.city}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1.5">
                          <LayoutGrid className="h-3.5 w-3.5" />
                          {area}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {capacity}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Wifi className="h-3.5 w-3.5" />
                          {t("landing.properties.wifi_label")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex items-end justify-between pt-3 border-t border-border">
                      <div>
                        <span className="text-xl font-bold text-primary">{minPrice}</span>
                        {firstRoom?.price && <span className="text-xs text-muted-foreground">{t("landing.properties.per_month")}</span>}
                      </div>
                      <Link
                        to="/app/property/$id"
                        params={{ id: p.id }}
                        className="text-sm font-semibold text-primary hover:underline underline-offset-4"
                      >
                        {t("landing.properties.view_details")}
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

