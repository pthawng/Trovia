import { Star } from "lucide-react";

const items = [
  {
    quote: "I found my studio near RMIT in two days. The verification badge made me actually trust the listing.",
    name: "Linh Nguyen",
    role: "Student, RMIT",
  },
  {
    quote: "As a young professional I needed something fast and safe. Trovia's chat and contracts saved me a week.",
    name: "Minh Tran",
    role: "Product designer",
  },
  {
    quote: "Managing six rooms used to mean spreadsheets. Now I open the dashboard once a week and I'm done.",
    name: "Mr. Hoa",
    role: "Landlord, District 10",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-14">
          <div className="text-sm font-medium text-primary mb-3">Loved by both sides</div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Stories from tenants and landlords.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl bg-surface-elevated ring-1 ring-border p-7 shadow-card hover:shadow-[var(--shadow-elegant)] transition-shadow"
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
