import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, Calendar, CheckCircle2, AlertCircle, Receipt, X, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentService, type Payment } from "@/services/payment.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/payments")({
  component: PaymentsPage,
});

const typeLabels = {
  DEPOSIT: "Tiền đặt cọc",
  FIRST_MONTH_RENT: "Tiền nhà tháng đầu",
  MONTHLY_RENT: "Tiền thuê hàng tháng",
  UTILITIES: "Tiền điện nước",
  OTHER: "Chi phí khác",
};

function PaymentsPage() {
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
          ? "Kích hoạt hợp đồng thành công! Lịch lưu trú đã được thiết lập."
          : "Đã hoàn tất thanh toán hóa đơn."
      );
      setActivePayInvoice(null);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["tenancies"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Thanh toán thất bại.");
    },
  });

  const activeBills = payments.filter((p) => p.status === "PENDING" && p.tenantId === currentUser?.id);
  const paymentHistory = payments.filter((p) => p.status === "PAID");

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Thanh toán & Hóa đơn</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi các hóa đơn thuê phòng hàng tháng, thực hiện quét mã VietQR và kiểm tra lịch sử giao dịch.
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
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Bills & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Bills */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2 text-foreground">
                <CreditCard className="h-5 w-5 text-primary" /> Hóa đơn cần thanh toán
              </h2>
              <div className="space-y-3">
                {activeBills.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground bg-secondary/10">
                    Tuyệt vời! Bạn không có hóa đơn nào đang chờ thanh toán.
                  </div>
                ) : (
                  activeBills.map((b) => {
                    const formattedDue = new Date(b.dueDate).toLocaleDateString("vi-VN", { dateStyle: "medium" });
                    return (
                      <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-surface-elevated ring-1 ring-border border border-border/80 hover:shadow-elegant transition gap-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0 border border-primary/20">
                            <CreditCard className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-foreground">{b.contract?.property?.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">{typeLabels[b.type] || b.type}</span>
                              <span className="inline-block h-1 w-1 rounded-full bg-border" />
                              <span className="text-primary font-medium flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Hạn chót: {formattedDue}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-xs text-foreground">{Number(b.amount).toLocaleString('vi-VN')} VND</div>
                            <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-0.5 inline-block text-center border border-amber-200">Đợi thanh toán</span>
                          </div>
                          <Button size="sm" className="font-semibold shadow-[var(--shadow-glow)] rounded-xl text-xs h-9 cursor-pointer" onClick={() => setActivePayInvoice(b)}>
                            Thanh toán
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
                <Receipt className="h-5 w-5 text-primary" /> Lịch sử thanh toán
              </h2>
              <div className="rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden divide-y divide-border border border-border">
                {paymentHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground bg-secondary/10">
                    Chưa có giao dịch lịch sử nào được ghi nhận.
                  </div>
                ) : (
                  paymentHistory.map((h) => {
                    const formattedPaid = h.paidAt ? new Date(h.paidAt).toLocaleDateString("vi-VN", { dateStyle: "medium" }) : "Vừa xong";
                    return (
                      <div key={h.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 transition">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shrink-0 border border-emerald-200">
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-foreground">{h.contract?.property?.title}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span>{typeLabels[h.type] || h.type}</span>
                              <span>·</span>
                              <span>Ngày trả: {formattedPaid}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xs text-emerald-600">-{Number(h.amount).toLocaleString('vi-VN')} VND</div>
                          <div className="text-[8px] text-muted-foreground mt-0.5">Chuyển khoản VietQR · Ref: {h.providerTransactionId || "TRV-TX-ME"}</div>
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
            <section className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 space-y-4 border border-border">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">Phương thức đề xuất</h3>
              <div className="rounded-xl border border-border p-4 flex items-center gap-3 bg-secondary/10">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center font-bold text-xs border border-primary/20">
                  QR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">VietQR Chuyển khoản nhanh</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Liên kết trực tiếp NAPAS 24/7</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chúng tôi khuyên dùng mã VietQR để thanh toán được xác nhận tự động tức thì. Tiền cọc/thuê sẽ được chuyển trực tiếp vào tài khoản ngân hàng của Chủ nhà.
              </p>
            </section>

            {/* Quick FAQs */}
            <section className="rounded-2xl bg-secondary/20 p-6 space-y-3 border border-border/55 text-xs text-muted-foreground">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hỗ trợ thanh toán</h4>
              <div className="space-y-2">
                <div>
                  <h5 className="font-semibold text-foreground">Tiền cọc giữ chỗ có được bảo vệ không?</h5>
                  <p className="text-[11px] mt-0.5 leading-relaxed">Có, toàn bộ khoản cọc được giữ an toàn trên hệ thống Trovia Trust cho tới khi bạn hoàn thành việc nhận phòng.</p>
                </div>
                <div>
                  <h5 className="font-semibold text-foreground">Có mất phí giao dịch không?</h5>
                  <p className="text-[11px] mt-0.5 leading-relaxed">Hoàn toàn miễn phí khi thanh toán bằng hình thức Quét mã VietQR/Chuyển khoản liên ngân hàng.</p>
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
            {/* Overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePayInvoice(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-surface ring-1 ring-border rounded-3xl p-6 shadow-2xl z-10 border border-border text-center space-y-5"
            >
              {/* Close Button */}
              <button 
                onClick={() => setActivePayInvoice(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-secondary hover:bg-border grid place-items-center transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>

              <div className="pt-2">
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase bg-primary-soft/30 px-3 py-1 rounded-full border border-primary/20">VietQR Thanh toán nhanh</span>
              </div>

              {/* Fake VietQR Code Generator */}
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
                <p className="text-xs text-muted-foreground">{typeLabels[activePayInvoice.type]} · {activePayInvoice.contract?.property?.title}</p>
              </div>

              <div className="text-[11px] text-muted-foreground leading-relaxed bg-secondary/40 p-3 rounded-xl border border-border/40 text-left space-y-1">
                <div className="flex justify-between"><span>Ngân hàng:</span><span className="font-semibold text-foreground">VIETCOMBANK</span></div>
                <div className="flex justify-between"><span>Số tài khoản:</span><span className="font-semibold text-foreground">982 109 485067</span></div>
                <div className="flex justify-between"><span>Chủ tài khoản:</span><span className="font-semibold text-foreground">TROVIA TRUST HOLDINGS</span></div>
                <div className="flex justify-between"><span>Nội dung chuyển:</span><span className="font-semibold text-foreground">TRV PAY {activePayInvoice.id.slice(0,8).toUpperCase()}</span></div>
              </div>

              <div className="pt-2 space-y-2">
                <Button 
                  disabled={payMutation.isPending}
                  onClick={() => payMutation.mutate(activePayInvoice.id)}
                  className="w-full rounded-xl h-11 text-xs font-semibold shadow-[var(--shadow-glow)]"
                >
                  {payMutation.isPending ? "Đang xác thực giao dịch..." : "Xác nhận đã chuyển khoản"}
                </Button>
                <p className="text-[10px] text-muted-foreground">Quét QR hoặc chuyển tiền, sau đó click nút để xác nhận thanh toán.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
