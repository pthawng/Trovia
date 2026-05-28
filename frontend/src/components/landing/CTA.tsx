import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CTA() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl relative overflow-hidden rounded-[2rem] p-10 sm:p-16 text-center"
        style={{
          background:
            "radial-gradient(80% 120% at 50% 0%, oklch(0.55 0.2 285) 0%, oklch(0.32 0.18 268) 60%, oklch(0.22 0.12 268) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
        <div className="relative">
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white max-w-3xl mx-auto leading-[1.05]">
            {t("landing.cta.title")}
          </h2>
          <p className="mt-5 text-white/75 max-w-xl mx-auto text-lg">
            {t("landing.cta.subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-xl bg-white text-foreground px-6 py-3.5 text-sm font-medium hover:bg-white/90 transition"
            >
              {t("landing.cta.get_started")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 text-white px-6 py-3.5 text-sm font-medium hover:bg-white/10 transition"
            >
              {t("landing.cta.talk_team")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

