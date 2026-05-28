import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { 
  FileText, ShieldCheck, Calendar, ArrowLeft, CheckCircle2, AlertCircle, 
  User, Phone, Mail, Building, Landmark, ChevronRight, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContractService } from "@/services/contract.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/contracts/$id")({
  component: ContractDetail,
});

function ContractDetail() {
  const { t } = useTranslation();
  const { id } = useParams({ from: "/_authenticated/app/contracts/$id" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [agreed, setAgreed] = useState(false);

  // 1. Fetch Contract Details
  const { data: c, isLoading, error } = useQuery({
    queryKey: ["contractDetail", id],
    queryFn: () => ContractService.findOne(id),
  });

  // 2. Accept Contract Mutation
  const acceptMutation = useMutation({
    mutationFn: () => ContractService.acceptContract(id),
    onSuccess: () => {
      toast.success(t("contract.detail.toasts.sign_accept_success"));
      queryClient.invalidateQueries({ queryKey: ["contractDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      // Auto redirect to payments page
      setTimeout(() => {
        navigate({ to: "/app/payments" });
      }, 1000);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("contract.detail.toasts.sign_accept_error"));
    },
  });

  // 3. Reject Contract Mutation
  const rejectMutation = useMutation({
    mutationFn: () => ContractService.rejectContract(id),
    onSuccess: () => {
      toast.success(t("contract.detail.toasts.sign_reject_success"));
      queryClient.invalidateQueries({ queryKey: ["contractDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      
      // Navigate back to contracts listing
      setTimeout(() => {
        navigate({ to: "/app/contracts" });
      }, 1500);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("contract.detail.toasts.sign_reject_error"));
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl space-y-6 py-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-muted rounded-2xl" />
            <div className="h-40 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
          <div className="h-80 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !c) {
    return (
      <div className="max-w-6xl text-center py-20">
        <XCircle className="h-14 w-14 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-semibold mt-4">{t("contract.detail.not_found")}</h2>
        <p className="text-muted-foreground mt-2">{t("contract.detail.not_found_desc")}</p>
        <Button className="mt-6 rounded-xl" asChild>
          <Link to="/app/contracts">{t("contract.detail.back_to_list")}</Link>
        </Button>
      </div>
    );
  }

  const formattedStart = new Date(c.startDate).toLocaleDateString("vi-VN", { dateStyle: "long" });
  const formattedEnd = new Date(c.endDate).toLocaleDateString("vi-VN", { dateStyle: "long" });
  const monthlyRentFormatted = Number(c.monthlyRent).toLocaleString("vi-VN") + " đ";
  const depositFormatted = Number(c.deposit).toLocaleString("vi-VN") + " đ";

  const isSent = c.status === "SENT";
  const isActive = c.status === "ACTIVE";

  return (
    <div className="max-w-6xl space-y-6 pb-12">
      {/* Header & Back Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link 
          to="/app/contracts" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" /> {t("contract.detail.back_to_contracts")}
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t("contract.detail.digital_contract")}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">{t("contract.detail.details_code", { code: c.id.slice(0, 8).toUpperCase() })}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Alert Banner */}
          {isSent && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 flex items-start gap-4"
            >
              <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-950">{t("contract.detail.banners.pending_title")}</h4>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                  {t("contract.detail.banners.pending_desc")}
                </p>
              </div>
            </motion.div>
          )}

          {isActive && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 flex items-start gap-4"
            >
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">{t("contract.detail.banners.active_title")}</h4>
                <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                  {t("contract.detail.banners.active_desc")}
                </p>
              </div>
            </motion.div>
          )}

          {c.status === "REJECTED" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 flex items-start gap-4"
            >
              <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-950">{t("contract.detail.banners.rejected_title")}</h4>
                <p className="text-xs text-rose-900/80 mt-1 leading-relaxed">
                  {t("contract.detail.banners.rejected_desc")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Section 1: Thông tin người thuê */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary grid place-items-center">
                <User className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{t("contract.detail.sections.tenant_info_title")}</h3>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.tenant_name")}</span>
                <span className="font-semibold text-foreground flex items-center gap-2">
                  {c.tenant?.fullName || t("common.no_data")}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.phone")}</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {(c.tenant as any)?.phone || t("common.no_data")}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.email")}</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.tenant?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin chủ nhà */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
                <Landmark className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{t("contract.detail.sections.landlord_info_title")}</h3>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.landlord_name")}</span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold grid place-items-center text-[10px]">
                    {(c.landlord?.fullName || "L").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground">{c.landlord?.fullName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.phone")}</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {(c.landlord as any)?.phone || t("common.no_data")}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.email")}</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.landlord?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Thông tin phòng & Bất động sản */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                <Building className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{t("contract.detail.sections.property_finance_title")}</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.property_name")}</span>
                <span className="font-bold text-foreground block">{c.property?.title}</span>
                <span className="text-xs text-muted-foreground block leading-normal mt-0.5">
                  {c.property?.address}, {c.property?.district}, {c.property?.city}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.room_number")}</span>
                <span className="font-semibold text-foreground block">{c.room?.title}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  {t("contract.detail.sections.room_area", { area: c.room?.area })}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">{t("contract.detail.sections.contract_term")}</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("contract.months", { count: c.durationMonths })}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5 leading-normal">
                  {t("contract.detail.sections.date_range", { start: formattedStart, end: formattedEnd })}
                </span>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-4 sm:border-0 sm:pt-0">
                <span className="text-xs text-muted-foreground block font-medium">{t("contract.detail.sections.monthly_rent")}</span>
                <span className="font-bold text-lg text-primary block mt-0.5">{monthlyRentFormatted}</span>
                <span className="text-[10px] text-muted-foreground block">{t("contract.detail.sections.rent_exclude_utilities")}</span>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-4 sm:border-0 sm:pt-0">
                <span className="text-xs text-muted-foreground block font-medium">{t("contract.detail.sections.deposit")}</span>
                <span className="font-bold text-lg text-foreground block mt-0.5">{depositFormatted}</span>
                <span className="text-[10px] text-muted-foreground block">{t("contract.detail.sections.deposit_refundable")}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Điều khoản hợp đồng */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-base text-foreground">{t("contract.detail.sections.terms_title")}</h3>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground max-h-80 overflow-y-auto pr-2 border border-border/40 p-4 rounded-xl bg-secondary/15">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">{t("contract.detail.sections.terms_general_title")}</p>
              
              <p>
                {t("contract.detail.sections.term_1")}
              </p>

              <p>
                {t("contract.detail.sections.term_2")}
              </p>

              <p>
                {t("contract.detail.sections.term_3")}
              </p>

              <p>
                {t("contract.detail.sections.term_4")}
              </p>

              {c.terms ? (
                <div className="pt-4 border-t border-border mt-4">
                  <span className="font-bold text-foreground text-xs uppercase tracking-wider block mb-1">
                    {t("contract.detail.sections.landlord_additional_terms")}
                  </span>
                  <p className="whitespace-pre-wrap font-sans font-medium text-foreground bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 mt-1 leading-normal">
                    {c.terms}
                  </p>
                </div>
              ) : (
                <p className="italic text-muted-foreground/80 mt-2">{t("contract.detail.sections.no_additional_terms")}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Actions Sidebar */}
        <aside className="sticky top-24">
          <div className="rounded-3xl bg-surface-elevated ring-1 ring-border p-6 shadow-[var(--shadow-elegant)] border border-border">
            <h3 className="font-bold text-base text-foreground pb-4 border-b border-border">
              {t("contract.detail.sections.confirmation_title")}
            </h3>
            
            <div className="mt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t("contract.detail.sections.contract_code_label")}</span>
                <span className="font-semibold text-foreground">TRV-{c.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{t("contract.detail.sections.status_label")}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.status === "SENT" ? "text-amber-700 bg-amber-50 border border-amber-200" :
                  c.status === "ACTIVE" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" :
                  c.status === "REJECTED" ? "text-rose-700 bg-rose-50 border border-rose-200" :
                  "text-gray-600 bg-gray-50 border border-gray-200"
                }`}>
                  {c.status === "SENT" ? t("contract.detail.sections.status_awaiting_signature") :
                   c.status === "ACTIVE" ? t("contract.detail.sections.status_active") :
                   c.status === "REJECTED" ? t("contract.detail.sections.status_rejected") : c.status}
                </span>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{t("contract.detail.sections.deposit_to_pay")}</span>
                  <span className="text-foreground">{depositFormatted}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>{t("contract.detail.sections.monthly_rent_to_pay")}</span>
                  <span className="text-primary">{monthlyRentFormatted}</span>
                </div>
              </div>

              {/* Interaction Block for Draft/Sent State */}
              {isSent ? (
                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={agreed} 
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20 shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition leading-normal select-none">
                      {t("contract.detail.sections.agree_terms_checkbox")}
                    </span>
                  </label>

                  <div className="space-y-2 pt-2">
                    <Button 
                      className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-sm transition"
                      disabled={!agreed || acceptMutation.isPending || rejectMutation.isPending}
                      onClick={() => acceptMutation.mutate()}
                    >
                      {acceptMutation.isPending ? t("common.loading") : t("contract.detail.sections.sign_button")}
                    </Button>

                    <Button 
                      variant="ghost"
                      className="w-full h-11 text-xs font-semibold rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition"
                      disabled={rejectMutation.isPending || acceptMutation.isPending}
                      onClick={() => rejectMutation.mutate()}
                    >
                      {rejectMutation.isPending ? t("common.loading") : t("contract.detail.sections.reject_button")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-border space-y-3">
                  {isActive && (
                    <>
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-emerald-950 block">{t("contract.detail.sections.signed_success_box_title")}</span>
                        <span className="text-[10px] text-emerald-800 mt-0.5 block leading-normal">
                          {t("contract.detail.sections.signed_success_box_desc")}
                        </span>
                      </div>
                      <Button 
                        className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition"
                        asChild
                      >
                        <Link to="/app/payments">{t("contract.detail.sections.go_to_payment_button")}</Link>
                      </Button>
                    </>
                  )}

                  {c.status === "REJECTED" && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                      <XCircle className="h-5 w-5 text-rose-600 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-rose-950 block">{t("contract.detail.sections.rejected_box_title")}</span>
                      <span className="text-[10px] text-rose-800 mt-0.5 block leading-normal">
                        {t("contract.detail.sections.rejected_box_desc")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-[10px] text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{t("contract.detail.sections.secure_encryption_footer")}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
