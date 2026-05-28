import { ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserSectionData {
  title: string;
  tag: string;
  bullets: string[];
  cta: string;
}

export function DualUser() {
  const { t } = useTranslation();

  const tenantBullets = t("landing.dual_user.tenant_bullets", { returnObjects: true });
  const landlordBullets = t("landing.dual_user.landlord_bullets", { returnObjects: true });

  const tenant: UserSectionData = {
    title: t("landing.dual_user.tenant_title"),
    tag: t("landing.dual_user.tenant_tag"),
    bullets: Array.isArray(tenantBullets) ? tenantBullets : [],
    cta: t("landing.dual_user.tenant_cta"),
  };

  const landlord: UserSectionData = {
    title: t("landing.dual_user.landlord_title"),
    tag: t("landing.dual_user.landlord_tag"),
    bullets: Array.isArray(landlordBullets) ? landlordBullets : [],
    cta: t("landing.dual_user.landlord_cta"),
  };

  return (
    <section id="tenants" className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-6">
        <Card data={tenant} accent="primary" />
        <Card data={landlord} accent="emerald" id="landlords" />
      </div>
    </section>
  );
}

function Card({
  data,
  accent,
  id,
}: {
  data: UserSectionData;
  accent: "primary" | "emerald";
  id?: string;
}) {
  const isEmerald = accent === "emerald";
  return (
    <div
      id={id}
      className="relative overflow-hidden rounded-3xl ring-1 ring-border bg-surface-elevated p-8 sm:p-10 shadow-card"
    >
      <div
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-40"
        style={{
          background: isEmerald
            ? "radial-gradient(circle, oklch(0.8 0.13 165 / 0.6), transparent 70%)"
            : "radial-gradient(circle, oklch(0.65 0.2 268 / 0.5), transparent 70%)",
        }}
      />
      <div className="relative">
        <div
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
            isEmerald
              ? "bg-[oklch(0.95_0.05_165)] text-[oklch(0.4_0.13_165)]"
              : "bg-primary-soft text-primary"
          }`}
        >
          {data.tag}
        </div>
        <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-5 mb-6">
          {data.title}
        </h3>
        <ul className="space-y-3 mb-8">
          {data.bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-0.5 h-5 w-5 grid place-items-center rounded-full shrink-0 ${
                  isEmerald
                    ? "bg-[oklch(0.95_0.05_165)] text-[oklch(0.4_0.13_165)]"
                    : "bg-primary-soft text-primary"
                }`}
              >
                <Check className="h-3 w-3" />
              </span>
              <span className="text-foreground/80">{b}</span>
            </li>
          ))}
        </ul>
        <button
          className={`group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition ${
            isEmerald
              ? "bg-[oklch(0.45_0.13_165)] text-white hover:opacity-95"
              : "bg-primary text-primary-foreground hover:opacity-95"
          }`}
        >
          {data.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
