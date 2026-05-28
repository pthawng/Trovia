import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { 
  Bookmark, Eye, MessageSquare, FileText, CreditCard, Clock, 
  ArrowRight, ShieldCheck, Sparkles, Calendar
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "react-i18next";
import { PropertyCard } from "@/components/app/PropertyCard";
import { useQuery } from "@tanstack/react-query";
import { ListingService } from "@/services/listing.service";
import { BookingRequestService } from "@/services/booking-request.service";
import { SavedPropertyService } from "@/services/saved-property.service";
import { PaymentService } from "@/services/payment.service";
import { ConversationService } from "@/services/conversation.service";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/tenant/dashboard")({
  component: TenantDashboard,
});

function TenantDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const name = user?.fullName?.split(" ")[0] || t("common.you");

  // 1. Fetch listings for "Recently viewed" & "Recommendations"
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ["exploreListings", { limit: 6 }],
    queryFn: () => ListingService.search({ limit: 6 }),
  });
  const listings = listingsData?.listings || [];

  // 2. Fetch actual requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ["tenantBookings"],
    queryFn: () => BookingRequestService.findAllForTenant(),
  });

  // 3. Fetch saved properties list
  const { data: savedList = [] } = useQuery({
    queryKey: ["savedProperties"],
    queryFn: () => SavedPropertyService.getSavedListings(),
  });

  // 4. Fetch actual payments
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => PaymentService.findAll(),
  });
  const activeBills = payments.filter((p) => p.status === "PENDING" && p.tenantId === user?.id);

  // 5. Fetch actual conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => ConversationService.findAll(),
  });

  const stats = [
    { 
      label: t("dashboard.tenant.stats.saved"), 
      value: savedList.length.toString(), 
      icon: Bookmark, 
      color: "text-primary bg-primary-soft",
      to: "/app/saved"
    },
    { 
      label: t("dashboard.tenant.stats.pending_bills"), 
      value: activeBills.length.toString(), 
      icon: CreditCard, 
      color: "text-amber-600 bg-amber-50",
      to: "/app/payments"
    },
    { 
      label: t("dashboard.tenant.stats.messages"), 
      value: conversations.length.toString(), 
      icon: MessageSquare, 
      color: "text-emerald-600 bg-emerald-50",
      to: "/app/messages"
    },
    { 
      label: t("dashboard.tenant.stats.requests"), 
      value: requests.length.toString(), 
      icon: FileText, 
      color: "text-blue-600 bg-blue-50",
      to: "/app/requests"
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary-soft/50 to-transparent p-6 sm:p-8 border border-primary/10"
      >
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 sm:opacity-40">
          <Sparkles className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <div className="relative z-10 max-w-2xl text-left">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> {t("dashboard.tenant.personal_hub")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t("dashboard.tenant.welcome_back", { name })}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed text-sm">
            {t("dashboard.tenant.subtitle")}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <motion.div 
            key={s.label} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl bg-surface-elevated ring-1 ring-border p-5 hover:shadow-elegant transition group border border-border"
          >
            <Link to={s.to as any} className="block text-left">
              <div className="flex justify-between items-start">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0" />
              </div>
              <div className="text-3xl font-semibold tracking-tight mt-4 text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Left column (Reminders, Requests) & Right column (Conversations) */}
      <div className="grid lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Payment Reminders */}
          <section className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 space-y-4 border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <CreditCard className="h-4 w-4 text-primary" /> {t("dashboard.tenant.payments.title")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("dashboard.tenant.payments.subtitle")}</p>
              </div>
              <Link to="/app/payments" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                {t("dashboard.tenant.payments.view_all")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeBills.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground bg-secondary/15 rounded-xl border border-dashed border-border/80">
                  {t("dashboard.tenant.payments.empty")}
                </div>
              ) : (
                activeBills.slice(0, 2).map((p) => {
                  const formattedDue = new Date(p.dueDate).toLocaleDateString("vi-VN", { dateStyle: "medium" });
                  return (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/20 ring-1 ring-border/80 hover:bg-secondary/40 transition gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary grid place-items-center shrink-0 mt-0.5 border border-primary/20">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground">{p.contract?.property?.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                            <span>{p.type === "DEPOSIT" ? t("dashboard.tenant.payments.deposit") : t("dashboard.tenant.payments.rent")}</span>
                            <span className="inline-block h-1 w-1 rounded-full bg-border" />
                            <span className="flex items-center gap-1 text-primary"><Calendar className="h-3 w-3" /> {t("dashboard.tenant.payments.due_date", { dueDate: formattedDue })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-xs text-foreground">{Number(p.amount).toLocaleString('vi-VN')} VND</div>
                        </div>
                        <Button size="sm" className="h-8 text-[11px] font-semibold shadow-[var(--shadow-glow)] rounded-xl" asChild>
                          <Link to="/app/payments">{t("dashboard.tenant.payments.details")}</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Active Rental Requests */}
          <section className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 space-y-4 border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-primary" /> {t("dashboard.tenant.requests.title")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("dashboard.tenant.requests.subtitle")}</p>
              </div>
              <Link to="/app/requests" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                {t("dashboard.tenant.requests.manage")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {requestsLoading ? (
              <div className="space-y-2">
                <div className="h-16 bg-muted animate-pulse rounded-xl" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 bg-secondary/10 rounded-xl border border-dashed border-border/80 p-6">
                <div className="h-10 w-10 rounded-full bg-primary-soft text-primary grid place-items-center mx-auto mb-3">
                  <Clock className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold text-foreground">{t("dashboard.tenant.requests.empty_title")}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t("dashboard.tenant.requests.empty_desc")}</p>
                <Link to="/app/explore" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mt-3">
                  {t("dashboard.tenant.requests.explore_now")} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 2).map((r: any) => {
                  const proposedDate = new Date(r.moveInDate || r.proposedMoveInDate).toLocaleDateString("vi-VN", {
                    month: "short", day: "numeric", year: "numeric"
                  });
                  return (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 ring-1 ring-border/80 hover:bg-secondary/40 transition">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 grid place-items-center font-semibold text-xs shrink-0 uppercase">
                          {(r.property?.title || "C").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-foreground truncate">{r.property?.title || "Nhà thuê"}</div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {t("tenant.proposed_date")}: <span className="font-medium text-foreground">{proposedDate}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          r.status === "PENDING" ? "text-amber-700 bg-amber-50 border border-amber-200" :
                          r.status === "ACCEPTED" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" :
                          "text-rose-700 bg-rose-50 border border-rose-200"
                        }`}>
                          {r.status === "PENDING" ? t("dashboard.tenant.requests.status.pending") :
                           r.status === "ACCEPTED" ? t("dashboard.tenant.requests.status.accepted") :
                           t("dashboard.tenant.requests.status.rejected")}
                        </span>
                        <Link to="/app/requests" className="text-[11px] font-bold text-primary hover:underline">
                          {t("dashboard.tenant.requests.view")}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        {/* Right Side (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Active Conversations */}
          <section className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 space-y-4 border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" /> {t("dashboard.tenant.messages.title")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("dashboard.tenant.messages.subtitle")}</p>
              </div>
              <Link to="/app/messages" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
                {t("dashboard.tenant.messages.mailbox")} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-secondary/15 rounded-xl border border-dashed border-border/80">
                  {t("dashboard.tenant.messages.empty")}
                </div>
              ) : (
                conversations.slice(0, 3).map((c) => {
                  const otherUser = c.tenantId === user?.id ? c.landlord : c.tenant;
                  const initials = otherUser?.fullName?.slice(0, 2).toUpperCase() || "TR";
                  return (
                    <Link key={c.id} to="/app/messages" className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition relative group border border-transparent hover:border-border">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-white font-semibold text-xs grid place-items-center shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{otherUser?.fullName}</div>
                        </div>
                        <p className="text-[11px] mt-1 truncate text-muted-foreground">
                          {c.lastMessage ? c.lastMessage.content : t("dashboard.tenant.messages.start_convo")}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* Quick Help / Trust Card */}
          <section className="rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary p-6 ring-1 ring-border relative overflow-hidden border border-border">
            <h3 className="text-xs font-bold tracking-tight flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> {t("dashboard.tenant.trust.title")}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              {t("dashboard.tenant.trust.desc")}
            </p>
          </section>

        </div>

      </div>

      {/* Recommended Listings section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("dashboard.tenant.recommendations.title")}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.tenant.recommendations.subtitle")}</p>
          </div>
          <Link to="/app/explore" className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            {t("dashboard.tenant.recommendations.explore_more")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {listingsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs">{t("dashboard.tenant.recommendations.empty")}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.slice(0, 3).map((p, i) => (
              <PropertyCard key={p.id} p={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
