import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, ShieldCheck, Download, Calendar, ArrowRight, Clock, AlertCircle, 
  CheckCircle2, CreditCard, MessageSquare, ChevronDown, ChevronUp, Landmark, 
  MapPin, Archive, Wrench, Star, LogOut, Plus, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContractService, type Contract } from "@/services/contract.service";
import { AuthService } from "@/services/auth.service";
import { TenancyService } from "@/services/tenancy.service";
import { MaintenanceService } from "@/services/maintenance.service";
import { ReviewService } from "@/services/review.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/contracts")({
  component: ContractsPage,
});

function ContractsPage() {
  const { t } = useTranslation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const queryClient = useQueryClient();

  // Modals state
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [selectedTenancyForMaintenance, setSelectedTenancyForMaintenance] = useState("");
  const [mTitle, setMTitle] = useState("");
  const [mDescription, setMDescription] = useState("");
  const [mPriority, setMPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  const [showAddReview, setShowAddReview] = useState(false);
  const [selectedTenancyForReview, setSelectedTenancyForReview] = useState("");
  const [rRating, setRRating] = useState(5);
  const [rComment, setRComment] = useState("");

  // 1. Fetch current user profile to verify tenant context
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getMe,
  });

  // 2. Fetch contracts
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: ContractService.findAll,
  });

  // 3. Fetch active/ended tenancies
  const { data: tenancies = [], isLoading: tenanciesLoading } = useQuery({
    queryKey: ["tenancies"],
    queryFn: TenancyService.findForTenant,
  });

  // 4. Fetch tenant maintenance requests
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["maintenanceRequests"],
    queryFn: MaintenanceService.findForTenant,
  });

  // MUTATIONS
  // Submit Move-Out Request
  const requestMoveOutMutation = useMutation({
    mutationFn: (tenancyId: string) => TenancyService.requestMoveOut(tenancyId),
    onSuccess: () => {
      toast.success(t("contract.toasts.move_out_success"));
      queryClient.invalidateQueries({ queryKey: ["tenancies"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("contract.toasts.move_out_error"));
    }
  });

  // Create Maintenance Request
  const createMaintenanceMutation = useMutation({
    mutationFn: (dto: any) => MaintenanceService.create(dto),
    onSuccess: () => {
      toast.success(t("contract.toasts.maintenance_success"));
      setShowAddMaintenance(false);
      setMTitle("");
      setMDescription("");
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("contract.toasts.maintenance_error"));
    }
  });

  // Submit Landlord Review
  const submitReviewMutation = useMutation({
    mutationFn: (dto: any) => ReviewService.create(dto),
    onSuccess: () => {
      toast.success(t("contract.toasts.review_success"));
      setShowAddReview(false);
      setRComment("");
      setRRating(5);
      queryClient.invalidateQueries({ queryKey: ["tenancies"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("contract.toasts.review_error"));
    }
  });

  // Filter only contracts where current user is the tenant to keep tenant view absolutely clean
  const tenantContracts = contracts.filter((c) => currentUser?.id === c.tenantId);

  // 3. Partition contracts into 3 critical sections
  const needActionContracts = tenantContracts.filter((c) => c.status === "SENT");
  const activeContracts = tenantContracts.filter((c) => c.status === "ACTIVE");
  const historyContracts = tenantContracts.filter((c) => 
    c.status === "TERMINATED" || c.status === "REJECTED" || c.status === "EXPIRED"
  );

  // Helper to calculate next payment date (real-world scheduling representation)
  const getNextPaymentDate = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const today = new Date();
    // Default to the same calendar day in the next upcoming month
    const nextPay = new Date(today.getFullYear(), today.getMonth() + 1, start.getDate());
    return nextPay.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
  };

  const defaultPropertyImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title & Welcome description */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">{t("contract.my_contracts")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("contract.my_contracts_desc")}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : tenantContracts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-secondary/10">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">{t("contract.no_contracts")}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {t("contract.no_contracts_desc")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: 🔥 CẦN HÀNH ĐỘNG */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                🔥 {t("contract.need_action")}
                {needActionContracts.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 rounded-full px-2 py-0.5 animate-pulse">
                    {t("dashboard.active_requests_count", { count: needActionContracts.length })}
                  </span>
                )}
              </h2>
            </div>

            {needActionContracts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center bg-secondary/5 text-xs text-muted-foreground">
                {t("contract.no_pending_contracts")}
              </div>
            ) : (
              <div className="grid gap-6">
                {needActionContracts.map((c) => {
                  const propertyImg = c.property?.images?.[0]?.url || defaultPropertyImage;
                  const createdDate = new Date(c.createdAt).toLocaleDateString("vi-VN", { dateStyle: "medium" });
                  const formattedRent = Number(c.monthlyRent).toLocaleString("vi-VN") + " đ";
                  const formattedDeposit = Number(c.deposit).toLocaleString("vi-VN") + " đ";

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-surface border border-amber-200 shadow-sm hover:shadow-md transition duration-300 overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image Preview Block */}
                        <div className="w-full md:w-56 h-40 md:h-auto shrink-0 relative bg-secondary">
                          <img 
                            src={propertyImg} 
                            alt={c.property?.title} 
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider bg-amber-500 text-white rounded px-2 py-0.5 shadow-sm uppercase flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t("contract.status_pending")}
                          </span>
                        </div>

                        {/* Card Content details */}
                        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-lg text-foreground hover:text-primary transition">
                                  <Link to={`/app/contracts/${c.id}` as any}>{c.property?.title}</Link>
                                </h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3.5 w-3.5" /> {t("contract.room")}: {c.room?.title} · {c.property?.address}, {c.property?.city}
                                </p>
                              </div>
                              <span className="text-[10px] font-semibold text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                                TRV-{c.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>

                            {/* Key contract specifications */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/40 text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">{t("contract.landlord")}</span>
                                <span className="font-semibold text-foreground block mt-0.5">{c.landlord?.fullName}</span>
                              </div>
                              
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">{t("contract.rent_per_month")}</span>
                                <span className="font-bold text-primary block mt-0.5">{formattedRent}</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">{t("contract.security_deposit")}</span>
                                <span className="font-semibold text-foreground block mt-0.5">{formattedDeposit}</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">{t("contract.rental_duration")}</span>
                                <span className="font-semibold text-foreground block mt-0.5 flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {t("contract.months", { count: c.durationMonths })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Layout */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/50">
                            <span className="text-[10px] text-muted-foreground">
                              {t("contract.created_at", { date: createdDate })}
                            </span>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs rounded-xl h-9 font-semibold text-muted-foreground hover:text-foreground border-border/60"
                                asChild
                              >
                                <Link to={`/app/contracts/${c.id}` as any}>{t("common.view_details")}</Link>
                              </Button>

                              <Button 
                                size="sm" 
                                className="text-xs rounded-xl h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-1"
                                asChild
                              >
                                <Link to={`/app/contracts/${c.id}` as any}>{t("contract.sign_and_continue")} <ArrowRight className="h-3.5 w-3.5" /></Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: 🏠 ĐANG THUÊ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                🏠 {t("contract.active_rentals")}
                {activeContracts.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 rounded-full px-2 py-0.5">
                    {t("contract.apartments_count", { count: activeContracts.length })}
                  </span>
                )}
              </h2>
            </div>

            {activeContracts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center bg-secondary/5 text-xs text-muted-foreground">
                {t("contract.no_active_rentals_desc")}
              </div>
            ) : (
              <div className="grid gap-6">
                {activeContracts.map((c) => {
                  const propertyImg = c.property?.images?.[0]?.url || defaultPropertyImage;
                  const formattedRent = Number(c.monthlyRent).toLocaleString("vi-VN") + " đ";
                  const nextPayment = getNextPaymentDate(c.startDate);

                  // Match the exact tenancy record from the backend
                  const tenancy = tenancies.find((t) => t.contractId === c.id);

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-surface border border-border shadow-sm hover:shadow-md transition duration-300 overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image Preview Block */}
                        <div className="w-full md:w-56 h-40 md:h-auto shrink-0 relative bg-secondary">
                          <img 
                            src={propertyImg} 
                            alt={c.property?.title} 
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wider bg-emerald-600 text-white rounded px-2 py-0.5 shadow-sm uppercase flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {t("contract.status_active")}
                          </span>
                        </div>

                        {/* Card Content details */}
                        <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-lg text-foreground hover:text-primary transition">
                                  <Link to={`/app/contracts/${c.id}` as any}>{c.property?.title}</Link>
                                </h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3.5 w-3.5" /> {t("contract.room")}: {c.room?.title} · {c.property?.address}, {c.property?.city}
                                </p>
                              </div>
                              <span className="text-[10px] font-semibold text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                                {t("contract.contract")}: TRV-{c.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>

                            {/* Active Rent financial status details */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-border/40 text-xs">
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">{t("contract.landlord")}</span>
                                <span className="font-semibold text-foreground block mt-0.5">{c.landlord?.fullName}</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-medium">{t("contract.monthly_period")}</span>
                                <span className="font-bold text-primary block mt-0.5">{formattedRent}</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-amber-700 font-bold uppercase block">{t("contract.next_payment")}</span>
                                <span className="font-bold text-amber-700 block mt-0.5 flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" /> {nextPayment}
                                </span>
                              </div>
                            </div>

                            {/* Live Tenancy Occupancy Details */}
                            {tenancy && (
                              <div className="pt-3 border-t border-border/40 space-y-3 text-xs">
                                <div className="flex flex-wrap justify-between items-center gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
                                  <div className="space-y-0.5">
                                    <span className="font-semibold text-primary block">🏠 {t("contract.occupancy_status")}:</span>
                                    <span className="text-[10px] text-muted-foreground">{t("contract.activated_since", { date: new Date(tenancy.startedAt || c.startDate).toLocaleDateString("vi-VN") })}</span>
                                  </div>
                                  <div>
                                    {tenancy.moveOutRequested ? (
                                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3 animate-bounce" /> {t("contract.awaiting_move_out_confirm")}
                                      </span>
                                    ) : (
                                      <Button 
                                        onClick={() => {
                                          if (confirm(t("contract.confirm_move_out"))) {
                                            requestMoveOutMutation.mutate(tenancy.id);
                                          }
                                        }}
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-[10px] text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl"
                                        disabled={requestMoveOutMutation.isPending}
                                      >
                                        <LogOut className="h-3 w-3 mr-1" /> {t("contract.request_move_out")}
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Maintenance List */}
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-foreground flex items-center gap-1"><Wrench className="h-3.5 w-3.5 text-primary" /> {t("contract.maintenance_issues")}:</span>
                                    <Button 
                                      onClick={() => {
                                        setSelectedTenancyForMaintenance(tenancy.id);
                                        setShowAddMaintenance(true);
                                      }}
                                      size="sm" 
                                      className="h-7 text-[10px] bg-primary/10 text-primary hover:bg-primary/20 rounded-lg px-2 cursor-pointer"
                                    >
                                      <Plus className="h-3 w-3 mr-0.5" /> {t("contract.report_issue")}
                                    </Button>
                                  </div>

                                  {/* Filter and show active maintenance requests for this tenancy */}
                                  {maintenanceRequests.filter(m => m.propertyId === tenancy.propertyId).length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground italic pl-4">{t("contract.no_maintenance_recorded")}</p>
                                  ) : (
                                    <div className="space-y-1.5 pl-4 border-l-2 border-border/80">
                                      {maintenanceRequests.filter(m => m.propertyId === tenancy.propertyId).slice(0, 3).map((m: any) => (
                                        <div key={m.id} className="flex justify-between items-center text-[10px] py-1 bg-secondary/10 px-2 rounded-lg border border-border/40">
                                          <div className="min-w-0 pr-2">
                                            <span className="font-semibold text-foreground truncate block">{m.title}</span>
                                            {m.assignedTo && <span className="text-[9px] text-indigo-600 block">{t("contract.technician")}: {m.assignedTo}</span>}
                                            {m.comment && <span className="text-[9px] text-muted-foreground block">{t("contract.landlord_note")}: "{m.comment}"</span>}
                                          </div>
                                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                            m.status === "OPEN" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                            m.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                            m.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                            "bg-gray-50 text-gray-500 border-gray-200"
                                          }`}>
                                            {m.status}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Action bar layout */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs rounded-xl h-9 gap-1.5 border-border/60 hover:bg-secondary cursor-pointer"
                              asChild
                            >
                              <Link to="/app/messages">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" /> {t("contract.open_messages")}
                              </Link>
                            </Button>

                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs rounded-xl h-9 gap-1.5 border-border/60 hover:bg-secondary cursor-pointer"
                              asChild
                            >
                              <Link to={`/app/contracts/${c.id}` as any}>
                                <FileText className="h-4 w-4 text-muted-foreground" /> {t("contract.view_contract")}
                              </Link>
                            </Button>

                            <Button 
                              size="sm" 
                              className="text-xs rounded-xl h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/95 flex items-center gap-1.5 cursor-pointer"
                              asChild
                            >
                              <Link to="/app/payments">
                                <CreditCard className="h-4 w-4" /> {t("contract.pay_now")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: 📁 LỊCH SỬ HỢP ĐỒNG */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 border border-border/50 transition select-none"
            >
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Archive className="h-4.5 w-4.5 text-muted-foreground" />
                {t("contract.contract_history")} ({historyContracts.length})
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{historyOpen ? t("common.collapse") : t("common.expand")}</span>
                {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            <AnimatePresence>
              {historyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-4 pt-2"
                >
                  {historyContracts.length === 0 ? (
                    <div className="text-center p-6 text-xs text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border/40">
                      {t("contract.no_history_contracts")}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {historyContracts.map((c) => {
                        const formattedRent = Number(c.monthlyRent).toLocaleString("vi-VN") + " đ";
                        const formattedStart = new Date(c.startDate).toLocaleDateString("vi-VN", { dateStyle: "short" });
                        const formattedEnd = new Date(c.endDate).toLocaleDateString("vi-VN", { dateStyle: "short" });

                        // Find corresponding tenancy if any
                        const tenancy = tenancies.find((t) => t.contractId === c.id);

                        return (
                          <div 
                            key={c.id}
                            className="rounded-xl border border-border/70 p-4 bg-surface flex flex-wrap items-center justify-between gap-4 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  c.status === "REJECTED" ? "text-rose-700 bg-rose-50 border border-rose-100" :
                                  c.status === "TERMINATED" ? "text-red-700 bg-red-50 border border-red-100" :
                                  "text-gray-500 bg-gray-50 border border-gray-200"
                                }`}>
                                  {c.status === "REJECTED" ? t("contract.status_rejected") :
                                   c.status === "TERMINATED" ? t("contract.status_terminated") : t("contract.status_expired")}
                                </span>
                                <span className="font-semibold text-foreground">{c.property?.title}</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                {t("contract.room")}: {c.room?.title} · {t("contract.rental_duration")}: {formattedStart} - {formattedEnd}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="block font-semibold text-foreground">{formattedRent} / {t("contract.month")}</span>
                                <span className="block text-[10px] text-muted-foreground">{t("contract.partner")}: {c.landlord?.fullName}</span>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-[11px] rounded-lg border-border/60 hover:bg-secondary cursor-pointer"
                                  asChild
                                >
                                  <Link to={`/app/contracts/${c.id}` as any}>{t("common.view_details")}</Link>
                                </Button>

                                {tenancy && tenancy.status === "ENDED" && (
                                  <Button
                                    onClick={() => {
                                      setSelectedTenancyForReview(tenancy.id);
                                      setShowAddReview(true);
                                    }}
                                    size="sm"
                                    className="h-8 text-[11px] bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-2.5 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Star className="h-3 w-3 fill-white" /> {t("contract.write_review")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* Vietnam housing legal banner (retained UI premium touch) */}
      <div className="rounded-2xl border border-dashed border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/15 mt-8">
        <div className="flex gap-3 items-start text-left">
          <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0 border border-primary/10">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{t("contract.legal_banner_title")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {t("contract.legal_banner_desc")}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL - REPORT MAINTENANCE */}
      <AnimatePresence>
        {showAddMaintenance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMaintenance(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-md bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-left">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-1.5"><Wrench className="h-5 w-5 text-primary" /> {t("contract.maintenance_modal_title")}</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const matchedTen = tenancies.find(t => t.id === selectedTenancyForMaintenance);
                if (!matchedTen) return;
                createMaintenanceMutation.mutate({
                  propertyId: matchedTen.propertyId,
                  roomId: matchedTen.roomId,
                  title: mTitle,
                  description: mDescription,
                  priority: mPriority,
                });
              }} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("contract.maintenance_title_label")}</label>
                  <Input placeholder={t("contract.maintenance_title_placeholder")} value={mTitle} onChange={(e) => setMTitle(e.target.value)} required className="bg-secondary/40 text-xs h-10 rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("contract.maintenance_desc_label")}</label>
                  <Textarea rows={3} placeholder={t("contract.maintenance_desc_placeholder")} value={mDescription} onChange={(e) => setMDescription(e.target.value)} required className="bg-secondary/40 text-xs rounded-xl p-3 resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("contract.maintenance_priority_label")}</label>
                  <select value={mPriority} onChange={(e) => setMPriority(e.target.value as any)} className="w-full bg-secondary/40 text-xs h-10 rounded-xl px-3 border border-border focus:outline-none">
                    <option value="LOW">{t("contract.priority_low")}</option>
                    <option value="MEDIUM">{t("contract.priority_medium")}</option>
                    <option value="HIGH">{t("contract.priority_high")}</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" onClick={() => setShowAddMaintenance(false)} variant="outline" className="flex-1 rounded-xl h-10 border-border/60 text-xs font-semibold cursor-pointer">{t("common.cancel")}</Button>
                  <Button type="submit" disabled={createMaintenanceMutation.isPending} className="flex-1 rounded-xl h-10 bg-primary text-white font-semibold text-xs cursor-pointer">
                    {createMaintenanceMutation.isPending ? t("common.loading") : t("contract.submit_request")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL - SUBMIT LANDLORD REVIEW */}
      <AnimatePresence>
        {showAddReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddReview(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-md bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-left">
              <h3 className="font-bold text-lg text-foreground mb-2 flex items-center gap-1.5 text-amber-500"><Star className="h-5 w-5 fill-amber-500 text-amber-500" /> {t("contract.review_modal_title")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("contract.review_modal_desc")}</p>

              <form onSubmit={(e) => {
                e.preventDefault();
                submitReviewMutation.mutate({
                  tenancyId: selectedTenancyForReview,
                  rating: rRating,
                  comment: rComment,
                });
              }} className="space-y-4">
                <div className="space-y-2 text-center py-2 bg-secondary/15 rounded-xl border">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground block">{t("contract.rating_score")}</span>
                  <div className="flex justify-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRRating(star)}
                        className="transition focus:outline-none cursor-pointer"
                      >
                        <Star className={`h-8 w-8 ${star <= rRating ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 mt-1 block">
                    {rRating === 5 ? t("contract.rating_5") : 
                     rRating === 4 ? t("contract.rating_4") : 
                     rRating === 3 ? t("contract.rating_3") : 
                     rRating === 2 ? t("contract.rating_2") : t("contract.rating_1")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">{t("contract.review_comment_label")}</label>
                  <Textarea rows={3} placeholder={t("contract.review_comment_placeholder")} value={rComment} onChange={(e) => setRComment(e.target.value)} required className="bg-secondary/40 text-xs rounded-xl p-3 resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" onClick={() => setShowAddReview(false)} variant="outline" className="flex-1 rounded-xl h-10 border-border/60 text-xs font-semibold cursor-pointer">{t("common.cancel")}</Button>
                  <Button type="submit" disabled={submitReviewMutation.isPending} className="flex-1 rounded-xl h-10 bg-primary text-white font-semibold text-xs cursor-pointer">
                    {submitReviewMutation.isPending ? t("common.loading") : t("contract.submit_review")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
