import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, Calendar, CheckCircle2, AlertCircle, Receipt, X, 
  ShieldCheck, QrCode, ArrowRight, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentService, type Payment } from "@/services/payment.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/app/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activePayInvoice, setActivePayInvoice] = useState<Payment | null>(null);

  // 1. Fetch current user profile
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getMe,
  });

  // 2. Fetch payments list
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: PaymentService.findAll,
  });

  // 3. Mark Paid Mutation (Simulating bank QR clearance)
  const payMutation = useMutation({
    mutationFn: (id: string) => PaymentService.markAsPaid(id),
    onSuccess: (data) => {
      toast.success(
        data.contractActivated
          ? t("dashboard.payments.toasts.contract_activated_success")
          : t("dashboard.payments.toasts.payment_invoice_success")
      );
      setActivePayInvoice(null);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["tenancies"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("dashboard.payments.toasts.payment_failed"));
    },
  });

  const activeBills = payments.filter((p) => p.status === "PENDING" && p.tenantId === currentUser?.id);
  const paymentHistory = payments.filter((p) => p.status === "PAID");

  // Move-in bills matching deposit and first month rent
  const depositBill = activeBills.find((b) => b.type === "DEPOSIT");
  const rentBill = activeBills.find((b) => b.type === "FIRST_MONTH_RENT" || b.type === "MONTHLY_RENT");
  const hasMoveInBills = depositBill || rentBill;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("dashboard.payments.page_title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.payments.page_subtitle")}
        </p>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="h-44 bg-muted animate-pulse rounded-2xl" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Columns - Bills & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* SECTION: Thanh toán cần thực hiện (Move-in Bills Summary Block) */}
            {hasMoveInBills && (
              <motion.section 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-6 shadow-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <CreditCard className="h-40 w-40 text-foreground" />
                </div>

                <div className="flex items-center gap-2 pb-3 mb-5 border-b border-border/60">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-ping shrink-0" />
                  <h3 className="font-bold text-base text-foreground">{t("dashboard.payments.due_actions")}</h3>
                </div>

                {/* Cards for each fee item */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {depositBill && (
                    <div className="rounded-2xl border border-border bg-surface p-4 text-xs space-y-1 relative shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("dashboard.payments.deposit_label")}</span>
                      <span className="font-bold text-foreground block text-sm mt-1">{Number(depositBill.amount).toLocaleString('vi-VN')} đ</span>
                      <span className="text-[9px] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-2.5 inline-block font-semibold">{t("dashboard.payments.pending_status")}</span>
                    </div>
                  )}
                  {rentBill && (
                    <div className="rounded-2xl border border-border bg-surface p-4 text-xs space-y-1 relative shadow-sm">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("dashboard.payments.first_month_label")}</span>
                      <span className="font-bold text-foreground block text-sm mt-1">{Number(rentBill.amount).toLocaleString('vi-VN')} đ</span>
                      <span className="text-[9px] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-2.5 inline-block font-semibold">{t("dashboard.payments.pending_status")}</span>
                    </div>
                  )}
                  <div className="rounded-2xl border border-border bg-surface p-4 text-xs space-y-1 relative shadow-sm">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t("dashboard.payments.service_fee_label")}</span>
                    <span className="font-bold text-foreground block text-sm mt-1">100.000 đ</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 mt-2.5 inline-block font-semibold font-medium">{t("dashboard.payments.fixed_status")}</span>
                  </div>
                </div>

                {/* Summary block */}
                <div className="rounded-2xl bg-secondary/25 p-4 border border-border/40 text-xs space-y-2 mb-6">
                  {depositBill && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("dashboard.payments.deposit_colon")}</span>
                      <span className="font-semibold text-foreground">{Number(depositBill.amount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  {rentBill && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("dashboard.payments.first_month_colon")}</span>
                      <span className="font-semibold text-foreground">{Number(rentBill.amount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("dashboard.payments.service_fee_colon")}</span>
                    <span className="font-semibold text-foreground">100.000đ</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2 border-t border-border/60 text-sm">
                    <span className="text-foreground">{t("dashboard.payments.total_colon")}</span>
                    <span className="text-primary">
                      {Number((depositBill?.amount || 0) + (rentBill?.amount || 0) + 100000).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Bulk pay button */}
                <div className="flex justify-end">
                  <Button 
                    className="w-full sm:w-auto px-6 h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-[var(--shadow-glow)] transition"
                    onClick={() => {
                      const totalAmount = (depositBill?.amount || 0) + (rentBill?.amount || 0) + 100000;
                      setActivePayInvoice({
                        id: depositBill?.id || rentBill?.id || "bulk",
                        amount: totalAmount,
                        type: "DEPOSIT",
                        contractId: depositBill?.contractId || rentBill?.contractId || "",
                        tenantId: currentUser?.id || "",
                        status: "PENDING",
                        dueDate: depositBill?.dueDate || new Date().toISOString(),
                        paidAt: null,
                        providerTransactionId: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        contract: depositBill?.contract || rentBill?.contract || {
                          property: { title: "Căn hộ của bạn", address: "", city: "", district: "" },
                          room: { title: "" }
                        },
                        landlord: depositBill?.landlord || rentBill?.landlord || { fullName: "" },
                        tenant: depositBill?.tenant || rentBill?.tenant || { fullName: "" },
                        // Custom bulk flags
                        isBulk: true,
                        bulkIds: [depositBill?.id, rentBill?.id].filter(Boolean) as string[]
                      } as any);
                    }}
                  >
                    {t("dashboard.payments.pay_now_btn")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.section>
            )}

            {/* General Bills Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" /> {t("dashboard.payments.other_pending_bills")}
              </h2>
              <div className="space-y-3">
                {activeBills.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground bg-secondary/10">
                    {t("dashboard.payments.no_pending_bills")}
                  </div>
                ) : (
                  activeBills.map((b) => {
                    const formattedDue = new Date(b.dueDate).toLocaleDateString("vi-VN", { dateStyle: "medium" });
                    return (
                      <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-surface border border-border hover:shadow-md transition gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0 border border-primary/10">
                            <CreditCard className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-foreground">{b.contract?.property?.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">{t(`dashboard.payments.types.${b.type}`, { defaultValue: b.type })}</span>
                              <span className="inline-block h-1 w-1 rounded-full bg-border" />
                              <span className="text-primary font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {t("dashboard.tenant.payments.due_date", { dueDate: formattedDue })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-xs text-foreground">{Number(b.amount).toLocaleString('vi-VN')} VND</div>
                            <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-0.5 inline-block text-center border border-amber-200">{t("dashboard.payments.waiting_payment")}</span>
                          </div>
                          <Button size="sm" className="font-semibold shadow-sm rounded-xl text-xs h-9 cursor-pointer" onClick={() => setActivePayInvoice(b)}>
                            {t("dashboard.payments.pay_btn")}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Payment History */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
                <Receipt className="h-5 w-5 text-primary" /> {t("dashboard.payments.successful_history")}
              </h2>
              <div className="rounded-2xl bg-surface ring-1 ring-border overflow-hidden divide-y divide-border border border-border">
                {paymentHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground bg-secondary/10">
                    {t("dashboard.payments.no_history")}
                  </div>
                ) : (
                  paymentHistory.map((h) => {
                    const formattedPaid = h.paidAt ? new Date(h.paidAt).toLocaleDateString("vi-VN", { dateStyle: "medium" }) : t("dashboard.payments.just_now");
                    return (
                      <div key={h.id} className="flex items-center justify-between p-4 hover:bg-secondary/5 transition">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 border border-emerald-200">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-foreground">{h.contract?.property?.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span>{t(`dashboard.payments.types.${h.type}`, { defaultValue: h.type })}</span>
                              <span>·</span>
                              <span>{t("dashboard.payments.payment_date", { date: formattedPaid })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xs text-emerald-600">-{Number(h.amount).toLocaleString('vi-VN')} VND</div>
                          <div className="text-[8px] text-muted-foreground mt-0.5">{t("dashboard.payments.vietqr_ref", { ref: h.providerTransactionId || "TRV-TX-ME" })}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>

          {/* Right Column - Wallet & Help */}
          <div className="space-y-8">
            
            {/* Preferred Payout */}
            <section className="rounded-2xl bg-surface border border-border p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold tracking-tight text-foreground">{t("dashboard.payments.preferred_method")}</h3>
              <div className="rounded-xl border border-border p-4 flex items-center gap-3 bg-secondary/10">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center font-bold text-xs border border-primary/20">
                  QR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{t("dashboard.payments.vietqr_fast")}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t("dashboard.payments.napas_link")}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("dashboard.payments.preferred_desc")}
              </p>
            </section>

            {/* Quick FAQs */}
            <section className="rounded-2xl bg-secondary/20 p-6 space-y-3 border border-border text-xs text-muted-foreground">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-primary" /> {t("dashboard.payments.faq_title")}
              </h4>
              <div className="space-y-3 pt-1">
                <div>
                  <h5 className="font-semibold text-foreground">{t("dashboard.payments.faq_1_q")}</h5>
                  <p className="text-[11px] mt-0.5 leading-relaxed">{t("dashboard.payments.faq_1_a")}</p>
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">{t("dashboard.payments.faq_2_q")}</h5>
                  <p className="text-[11px] mt-0.5 leading-relaxed">{t("dashboard.payments.faq_2_a")}</p>
                </div>
              </div>
            </section>

          </div>

        </div>
      )}

      {/* VietQR Lightbox Simulator Modal */}
      <AnimatePresence>
        {activePayInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePayInvoice(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-center space-y-5"
            >
              <button 
                onClick={() => setActivePayInvoice(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>

              <div className="pt-2">
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary-soft/30 px-3 py-1 rounded-full border border-primary/20">{t("dashboard.payments.vietqr_quick_payout")}</span>
              </div>

              {/* VietQR Code Generator */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-gray-100 mx-auto">
                <div className="relative h-44 w-44 bg-gray-50 flex items-center justify-center border border-dashed border-gray-200 rounded-xl">
                  <QrCode className="h-28 w-28 text-foreground" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 backdrop-blur-[0.5px]">
                    <span className="text-[9px] font-bold bg-foreground text-background px-2 py-0.5 rounded shadow">NAPAS 247</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">{Number(activePayInvoice.amount).toLocaleString('vi-VN')} VND</h3>
                <p className="text-xs text-muted-foreground">
                  {(activePayInvoice as any).isBulk ? t("dashboard.payments.total_reservation_payment") : t(`dashboard.payments.types.${activePayInvoice.type}`, { defaultValue: activePayInvoice.type })}
                </p>
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/40 p-3 rounded-xl border border-border/40 text-left space-y-1">
                <div className="flex justify-between"><span>{t("dashboard.payments.bank_label")}</span><span className="font-semibold text-foreground">VIETCOMBANK</span></div>
                <div className="flex justify-between"><span>{t("dashboard.payments.account_number_label")}</span><span className="font-semibold text-foreground">982 109 485067</span></div>
                <div className="flex justify-between"><span>{t("dashboard.payments.account_holder_label")}</span><span className="font-semibold text-foreground">TROVIA TRUST HOLDINGS</span></div>
                <div className="flex justify-between"><span>{t("dashboard.payments.transfer_content_label")}</span><span className="font-semibold text-foreground">TRV PAY {activePayInvoice.id.slice(0,8).toUpperCase()}</span></div>
              </div>

              <div className="pt-2 space-y-2">
                <Button 
                  disabled={payMutation.isPending}
                  onClick={async () => {
                    if ((activePayInvoice as any).isBulk) {
                      const ids = (activePayInvoice as any).bulkIds || [];
                      try {
                        // Mark all bulk IDs as paid in parallel
                        await Promise.all(ids.map((id: string) => PaymentService.markAsPaid(id)));
                        toast.success(t("dashboard.payments.toasts.contract_activated_success"));
                        setActivePayInvoice(null);
                        queryClient.invalidateQueries({ queryKey: ["payments"] });
                        queryClient.invalidateQueries({ queryKey: ["contracts"] });
                        queryClient.invalidateQueries({ queryKey: ["tenancies"] });
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || t("dashboard.payments.toasts.payment_failed"));
                      }
                    } else {
                      payMutation.mutate(activePayInvoice.id);
                    }
                  }}
                  className="w-full rounded-xl h-11 text-xs font-semibold shadow-[var(--shadow-glow)]"
                >
                  {payMutation.isPending ? t("dashboard.payments.validating_transaction") : t("dashboard.payments.confirm_transferred")}
                </Button>
                <p className="text-[10px] text-muted-foreground">{t("dashboard.payments.qr_instruction")}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
