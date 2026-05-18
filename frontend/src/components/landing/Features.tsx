import { motion } from "motion/react";
import { BadgeCheck, Sparkles, Lock, LineChart } from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "Verified listings",
    desc: "Every property is reviewed and identity-checked so what you see is what you get.",
  },
  {
    icon: Sparkles,
    title: "Smart matching",
    desc: "Tell us your budget, school, and lifestyle — we surface the rooms that actually fit.",
  },
  {
    icon: Lock,
    title: "Secure experience",
    desc: "Encrypted messaging, protected deposits, and contracts you can sign in minutes.",
  },
  {
    icon: LineChart,
    title: "Easy management",
    desc: "Landlords get a calm dashboard for occupancy, payments, and tenant requests.",
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-surface">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-14">
          <div className="text-sm font-medium text-primary mb-3">Why Trovia</div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Built for the way people really rent today.
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
