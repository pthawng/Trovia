import { motion } from "motion/react";
import { BadgeCheck, Sparkles, Lock, LineChart } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: BadgeCheck,
      title: t("landing.features.verified_title"),
      desc: t("landing.features.verified_desc"),
    },
    {
      icon: Sparkles,
      title: t("landing.features.matching_title"),
      desc: t("landing.features.matching_desc"),
    },
    {
      icon: Lock,
      title: t("landing.features.secure_title"),
      desc: t("landing.features.secure_desc"),
    },
    {
      icon: LineChart,
      title: t("landing.features.management_title"),
      desc: t("landing.features.management_desc"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-surface">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-14">
          <div className="text-sm font-medium text-primary mb-3">{t("landing.why_us")}</div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            {t("landing.features.subtitle")}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative rounded-2xl bg-surface-elevated ring-1 ring-border p-6 hover:ring-primary/30 hover:-translate-y-1 transition-all duration-300 shadow-card"
            >
              <div className="h-11 w-11 rounded-xl bg-primary-soft text-primary grid place-items-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

