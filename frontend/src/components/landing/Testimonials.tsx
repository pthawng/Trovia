import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Testimonials() {
  const { t } = useTranslation();

  const items = [
    {
      quote: t("landing.testimonials.quote_linh"),
      name: "Linh Nguyễn",
      role: t("landing.testimonials.role_linh"),
    },
    {
      quote: t("landing.testimonials.quote_minh"),
      name: "Minh Trần",
      role: t("landing.testimonials.role_minh"),
    },
    {
      quote: t("landing.testimonials.quote_hoa"),
      name: "Chú Hoa",
      role: t("landing.testimonials.role_hoa"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-14 text-left">
          <div className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{t("landing.testimonials.tag")}</div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
            {t("landing.testimonials.title")}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl bg-surface-elevated ring-1 ring-border p-7 shadow-card hover:shadow-[var(--shadow-elegant)] transition-shadow text-left"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[var(--color-amber-soft)] text-[var(--color-amber-soft)]" />
                ))}
              </div>
              <blockquote className="text-base leading-relaxed text-foreground/85">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-border">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-sm font-semibold">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

