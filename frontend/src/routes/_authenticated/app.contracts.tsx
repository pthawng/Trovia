import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { FileText, ShieldCheck, Download, Calendar, ArrowRight, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContractService, type Contract } from "@/services/contract.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/contracts")({
  component: ContractsPage,
});

const statusBadges = {
  DRAFT: { label: "Bản nháp", className: "text-gray-600 bg-gray-50 border border-gray-200" },
  SENT: { label: "Đang chờ ký", className: "text-amber-700 bg-amber-50 border border-amber-200" },
  ACTIVE: { label: "Đang hiệu lực", className: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
  REJECTED: { label: "Đã từ chối", className: "text-rose-700 bg-rose-50 border border-rose-200" },
  EXPIRED: { label: "Hết hạn", className: "text-gray-500 bg-gray-50 border border-gray-200" },
  TERMINATED: { label: "Đã chấm dứt", className: "text-red-700 bg-red-50 border border-red-200" },
};

function ContractsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch current user profile
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getMe,
  });

  // 2. Fetch contracts
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: ContractService.findAll,
  });

  // 3. Accept Contract Mutation
  const acceptMutation = useMutation({
    mutationFn: (id: string) => ContractService.acceptContract(id),
    onSuccess: () => {
      toast.success("Ký hợp đồng thành công! Hóa đơn đặt cọc đã được tạo.");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Không thể ký hợp đồng.");
    },
  });

  // 4. Reject Contract Mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => ContractService.rejectContract(id),
    onSuccess: () => {
      toast.success("Đã từ chối ký hợp đồng.");
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Thao tác thất bại.");
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Hợp đồng thuê phòng</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và thực hiện ký điện tử các hợp đồng thuê nhà trực tuyến của bạn một cách nhanh chóng và an toàn.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-44 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-16 text-center bg-secondary/10">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary grid place-items-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Chưa có hợp đồng nào</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Khi chủ nhà lập dự thảo và gửi hợp đồng thuê phòng cho bạn, thông tin chi tiết hợp đồng sẽ xuất hiện ngay tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {contracts.map((c) => {
            const isTenant = currentUser?.id === c.tenantId;
            const statusConfig = statusBadges[c.status] || { label: c.status, className: "bg-gray-100" };
            const formattedStart = new Date(c.startDate).toLocaleDateString("vi-VN", { dateStyle: "medium" });
            const formattedEnd = new Date(c.endDate).toLocaleDateString("vi-VN", { dateStyle: "medium" });

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 shadow-sm relative overflow-hidden border border-border"
              >
                {/* Visual watermark background */}
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                  <FileText className="h-40 w-40 text-foreground" />
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-semibold tracking-widest px-2.5 py-0.5 rounded-full ${statusConfig.className}`}>
                        {statusConfig.label.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">Mã lực: TRV-{c.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{c.property?.title}</h2>
                    <p className="text-xs text-muted-foreground">Phòng: {c.room?.title} · Địa chỉ: {c.property?.address}, {c.property?.city}</p>
                  </div>
                  
                  {/* Download and actions */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs h-9 border-border/60">
                      <Download className="h-4 w-4" /> Tải bản PDF
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-xs leading-relaxed text-muted-foreground">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block text-muted-foreground/80">Đối tác (Chủ nhà)</span>
                    <span className="font-semibold text-foreground block mt-1">{c.landlord?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block text-muted-foreground/80">Thời hạn lưu trú</span>
                    <span className="font-semibold text-foreground block mt-1 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {formattedStart} - {formattedEnd}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block text-muted-foreground/80">Giá thuê mỗi tháng</span>
                    <span className="font-bold text-primary block mt-1 text-sm">{Number(c.monthlyRent).toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block text-muted-foreground/80">Tiền đặt cọc</span>
                    <span className="font-semibold text-foreground block mt-1 text-sm">{Number(c.deposit).toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>

                {/* Specific terms panel */}
                {c.terms && (
                  <div className="mt-5 p-4 rounded-xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground">
                    <span className="font-bold text-[10px] uppercase block tracking-wider mb-1.5 text-foreground">Điều khoản bổ sung</span>
                    <p className="whitespace-pre-wrap leading-relaxed">{c.terms}</p>
                  </div>
                )}

                {/* Sign Contract Callout (Tenant Action) */}
                {c.status === "SENT" && isTenant && (
                  <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-2 text-left">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">Hợp đồng đang chờ bạn ký điện tử</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Sau khi ký hợp đồng, bạn cần thực hiện thanh toán hóa đơn đặt cọc để chính thức kích hoạt hợp đồng thuê.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs rounded-xl h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent"
                        disabled={rejectMutation.isPending || acceptMutation.isPending}
                        onClick={() => rejectMutation.mutate(c.id)}
                      >
                        Từ chối ký
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs rounded-xl h-9 px-4 bg-primary text-primary-foreground font-semibold hover:bg-primary/95"
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        onClick={() => acceptMutation.mutate(c.id)}
                      >
                        Ký & Chấp nhận hợp đồng
                      </Button>
                    </div>
                  </div>
                )}

                {/* Accept Pending Deposit State */}
                {c.status === "ACTIVE" && (
                  <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle className="h-4 w-4" /> Ký điện tử thành công qua Trovia e-Sign
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      Hợp đồng đã có hiệu lực pháp lý
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Legal standard banner */}
      <div className="rounded-2xl border border-dashed border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10">
        <div className="flex gap-3 items-start text-left">
          <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0 border border-primary/20">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Hợp đồng mẫu chuẩn pháp lý Việt Nam</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Tất cả hợp đồng trên Trovia đều được xây dựng chuẩn theo quy định của Luật Nhà ở hiện hành, bảo vệ tối đa quyền lợi của cả Người thuê và Chủ nhà.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
