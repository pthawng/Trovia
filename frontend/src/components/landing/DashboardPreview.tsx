import { motion } from "motion/react";
import { TrendingUp, Users, Home, DollarSign } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useTranslation } from "react-i18next";

const data = [
  { m: "Jan", v: 8200 }, { m: "Feb", v: 9100 }, { m: "Mar", v: 8800 },
  { m: "Apr", v: 10400 }, { m: "May", v: 11200 }, { m: "Jun", v: 12800 },
  { m: "Jul", v: 13900 }, { m: "Aug", v: 15200 },
];

export function DashboardPreview() {
  const { t } = useTranslation();

  const stats = [
    { icon: Home, label: t("landing.dashboard_preview.occupancy"), value: "94%", delta: "+3.2%" },
    { icon: DollarSign, label: t("landing.dashboard_preview.revenue"), value: "$15.2k", delta: "+12%" },
    { icon: Users, label: t("landing.dashboard_preview.tenants"), value: "128", delta: "+8" },
  ];

  const recentTenants = [
    { n: "Linh N.", r: t("landing.dashboard_preview.room_studio", { district: "2" }), s: t("landing.dashboard_preview.active"), sRaw: "Active" },
    { n: "Minh T.", r: t("landing.dashboard_preview.room_1br", { district: "7" }), s: t("landing.dashboard_preview.active"), sRaw: "Active" },
    { n: "Hoa P.", r: t("landing.dashboard_preview.room_normal", { district: "10" }), s: t("landing.dashboard_preview.pending"), sRaw: "Pending" },
    { n: "Anh L.", r: t("landing.dashboard_preview.room_studio", { district: "1" }), s: t("landing.dashboard_preview.active"), sRaw: "Active" },
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-60 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl mb-12">
          <div className="text-sm font-medium text-primary mb-3">{t("landing.dashboard_preview.tag")}</div>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            {t("landing.dashboard_preview.title")}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl bg-surface-elevated ring-1 ring-border shadow-[var(--shadow-elegant)] p-4 sm:p-6"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[oklch(0.85_0.1_25)]" />
                <span className="h-3 w-3 rounded-full bg-[oklch(0.85_0.1_80)]" />
                <span className="h-3 w-3 rounded-full bg-[oklch(0.85_0.1_165)]" />
              </div>
              <span className="ml-3 text-xs text-muted-foreground">trovia.app/dashboard</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">{t("landing.dashboard_preview.live_preview")}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border p-5 bg-surface">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary grid place-items-center">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-[oklch(0.45_0.13_165)] bg-[oklch(0.95_0.05_165)] px-2 py-0.5 rounded-md flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {s.delta}
                  </span>
                </div>
                <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-border p-5 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold">{t("landing.dashboard_preview.revenue_trend")}</div>
                  <div className="text-xs text-muted-foreground">{t("landing.dashboard_preview.last_8_months")}</div>
                </div>
                <div className="text-xs text-muted-foreground">USD</div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.42 0.19 268)" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="oklch(0.42 0.19 268)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.5 0.02 265)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid oklch(0.92 0.008 265)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="v" stroke="oklch(0.42 0.19 268)" strokeWidth={2.5} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-5 bg-surface">
              <div className="text-sm font-semibold mb-4">{t("landing.dashboard_preview.recent_tenants")}</div>
              <ul className="space-y-3">
                {recentTenants.map((ten) => (
                  <li key={ten.n} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-semibold">
                      {ten.n[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{ten.n}</div>
                      <div className="text-xs text-muted-foreground truncate">{ten.r}</div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      ten.sRaw === "Active"
                        ? "bg-[oklch(0.95_0.05_165)] text-[oklch(0.4_0.13_165)]"
                        : "bg-[oklch(0.96_0.05_70)] text-[oklch(0.45_0.13_70)]"
                    }`}>
                      {ten.s}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

