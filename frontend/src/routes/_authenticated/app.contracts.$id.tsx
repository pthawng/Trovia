import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
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
      toast.success("Ký hợp đồng điện tử thành công!");
      queryClient.invalidateQueries({ queryKey: ["contractDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      // Auto redirect to payments page
      setTimeout(() => {
        navigate({ to: "/app/payments" });
      }, 1000);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Ký hợp đồng thất bại.");
    },
  });

  // 3. Reject Contract Mutation
  const rejectMutation = useMutation({
    mutationFn: () => ContractService.rejectContract(id),
    onSuccess: () => {
      toast.success("Đã từ chối ký hợp đồng.");
      queryClient.invalidateQueries({ queryKey: ["contractDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      
      // Navigate back to contracts listing
      setTimeout(() => {
        navigate({ to: "/app/contracts" });
      }, 1500);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Thao tác thất bại.");
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
        <h2 className="text-2xl font-semibold mt-4">Không tìm thấy hợp đồng</h2>
        <p className="text-muted-foreground mt-2">Hợp đồng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button className="mt-6 rounded-xl" asChild>
          <Link to="/app/contracts">Quay lại danh sách</Link>
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
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách hợp đồng
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Hợp đồng điện tử</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">Chi tiết TRV-{c.id.slice(0, 8).toUpperCase()}</span>
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
                <h4 className="font-bold text-sm text-amber-950">Hợp đồng đang chờ bạn ký điện tử</h4>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                  Vui lòng đọc kỹ toàn bộ điều khoản hợp đồng bên dưới. Sau khi xác nhận đồng ý và thực hiện **Ký điện tử**, bạn sẽ tự động được chuyển sang trang thanh toán để đóng cọc kích hoạt hợp đồng.
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
                <h4 className="font-bold text-sm text-emerald-950">Hợp đồng đã có hiệu lực pháp lý!</h4>
                <p className="text-xs text-emerald-900/80 mt-1 leading-relaxed">
                  Hợp đồng này đã được ký kết thành công qua cổng Trovia e-Sign. Hóa đơn thanh toán cọc và tiền nhà đã được ghi nhận. Bạn có thể tải bản PDF lưu trữ bất cứ lúc nào.
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
                <h4 className="font-bold text-sm text-rose-950">Bạn đã từ chối hợp đồng này</h4>
                <p className="text-xs text-rose-900/80 mt-1 leading-relaxed">
                  Hợp đồng này đã bị từ chối ký điện tử. Nếu có sai sót về thông tin hoặc giá cả, vui lòng nhắn tin liên hệ chủ nhà để điều chỉnh và gửi lại dự thảo hợp đồng mới.
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
              <h3 className="font-bold text-base text-foreground">Section 1: Thông tin người thuê (Bên B)</h3>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Họ và tên người thuê</span>
                <span className="font-semibold text-foreground flex items-center gap-2">
                  {c.tenant?.fullName || "Chưa cập nhật"}
                </span>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Số điện thoại liên hệ</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {(c.tenant as any)?.phone || "Chưa cập nhật"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Địa chỉ email</span>
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
              <h3 className="font-bold text-base text-foreground">Section 2: Thông tin chủ nhà (Bên A)</h3>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Họ và tên chủ nhà</span>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold grid place-items-center text-[10px]">
                    {(c.landlord?.fullName || "L").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground">{c.landlord?.fullName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Số điện thoại liên hệ</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {(c.landlord as any)?.phone || "Chưa cập nhật"}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Địa chỉ email</span>
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
              <h3 className="font-bold text-base text-foreground">Section 3: Thông tin nơi thuê & Tài chính</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Tên bất động sản</span>
                <span className="font-bold text-foreground block">{c.property?.title}</span>
                <span className="text-xs text-muted-foreground block leading-normal mt-0.5">
                  {c.property?.address}, {c.property?.district}, {c.property?.city}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Phòng / Căn hộ số</span>
                <span className="font-semibold text-foreground block">{c.room?.title}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  Diện tích sử dụng: {c.room?.area} m²
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground block">Thời hạn hợp đồng</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.durationMonths} tháng
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5 leading-normal">
                  Từ {formattedStart} <br />đến {formattedEnd}
                </span>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-4 sm:border-0 sm:pt-0">
                <span className="text-xs text-muted-foreground block font-medium">Giá thuê hàng tháng</span>
                <span className="font-bold text-lg text-primary block mt-0.5">{monthlyRentFormatted}</span>
                <span className="text-[10px] text-muted-foreground block">Chưa bao gồm dịch vụ tiện ích</span>
              </div>

              <div className="space-y-1 border-t border-border/60 pt-4 sm:border-0 sm:pt-0">
                <span className="text-xs text-muted-foreground block font-medium">Tiền đặt cọc phòng</span>
                <span className="font-bold text-lg text-foreground block mt-0.5">{depositFormatted}</span>
                <span className="text-[10px] text-muted-foreground block">Được hoàn lại đầy đủ khi hết hạn hợp đồng</span>
              </div>
            </div>
          </div>

          {/* Section 4: Điều khoản hợp đồng */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-base text-foreground">Section 4: Điều khoản hợp đồng thỏa thuận</h3>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-muted-foreground max-h-80 overflow-y-auto pr-2 border border-border/40 p-4 rounded-xl bg-secondary/15">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-2">QUY ĐỊNH CHUNG VÀ CAM KẾT:</p>
              
              <p>
                1. **BÊN A (Chủ nhà)** cam kết bàn giao phòng đúng diện tích, trang thiết bị như đã thỏa thuận và đảm bảo quyền sử dụng phòng thuê độc lập, hợp pháp của **BÊN B (Người thuê)**.
              </p>

              <p>
                2. **BÊN B** cam kết thanh toán tiền thuê phòng đúng kỳ hạn thỏa thuận, sử dụng phòng thuê đúng mục đích cư trú hợp pháp, không chuyển nhượng hoặc cho thuê lại phòng trừ khi có sự đồng ý bằng văn bản của **BÊN A**.
              </p>

              <p>
                3. **TIỀN ĐẶT CỌC:** Được dùng để bảo đảm việc thực hiện đầy đủ nghĩa vụ của BÊN B. Tiền đặt cọc sẽ được hoàn trả lại cho BÊN B đầy đủ sau khi chấm dứt hợp đồng thuê và bàn giao phòng đúng hiện trạng, trừ đi các chi phí thiệt hại hư hỏng do lỗi chủ quan của BÊN B (nếu có).
              </p>

              <p>
                4. **CHẤM DỨT HỢP ĐỒNG:** Mỗi bên muốn chấm dứt hợp đồng trước hạn phải thông báo cho bên kia tối thiểu 30 ngày. Vi phạm quy định này sẽ phải chịu đền bù khoản tương đương tiền cọc phòng.
              </p>

              {c.terms ? (
                <div className="pt-4 border-t border-border mt-4">
                  <span className="font-bold text-foreground text-xs uppercase tracking-wider block mb-1">
                    ĐIỀU KHOẢN BỔ SUNG CỦA CHỦ NHÀ:
                  </span>
                  <p className="whitespace-pre-wrap font-sans font-medium text-foreground bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 mt-1 leading-normal">
                    {c.terms}
                  </p>
                </div>
              ) : (
                <p className="italic text-muted-foreground/80 mt-2">Không có điều khoản bổ sung đặc biệt nào từ chủ nhà.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Actions Sidebar */}
        <aside className="sticky top-24">
          <div className="rounded-3xl bg-surface-elevated ring-1 ring-border p-6 shadow-[var(--shadow-elegant)] border border-border">
            <h3 className="font-bold text-base text-foreground pb-4 border-b border-border">
              Section 5: Xác nhận hợp đồng
            </h3>
            
            <div className="mt-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Mã lực hợp đồng:</span>
                <span className="font-semibold text-foreground">TRV-{c.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.status === "SENT" ? "text-amber-700 bg-amber-50 border border-amber-200" :
                  c.status === "ACTIVE" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" :
                  c.status === "REJECTED" ? "text-rose-700 bg-rose-50 border border-rose-200" :
                  "text-gray-600 bg-gray-50 border border-gray-200"
                }`}>
                  {c.status === "SENT" ? "CHỜ BẠN KÝ" :
                   c.status === "ACTIVE" ? "ĐANG HIỆU LỰC" :
                   c.status === "REJECTED" ? "ĐÃ TỪ CHỐI" : c.status}
                </span>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Tiền cọc cần đóng:</span>
                  <span className="text-foreground">{depositFormatted}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span>Giá thuê mỗi tháng:</span>
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
                      Tôi đã đọc và đồng ý với điều khoản hợp đồng được ghi nhận ở trên.
                    </span>
                  </label>

                  <div className="space-y-2 pt-2">
                    <Button 
                      className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 flex items-center justify-center gap-1.5 shadow-sm transition"
                      disabled={!agreed || acceptMutation.isPending || rejectMutation.isPending}
                      onClick={() => acceptMutation.mutate()}
                    >
                      {acceptMutation.isPending ? "Đang xử lý..." : "Ký điện tử"}
                    </Button>

                    <Button 
                      variant="ghost"
                      className="w-full h-11 text-xs font-semibold rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent transition"
                      disabled={rejectMutation.isPending || acceptMutation.isPending}
                      onClick={() => rejectMutation.mutate()}
                    >
                      {rejectMutation.isPending ? "Đang xử lý..." : "Từ chối"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-border space-y-3">
                  {isActive && (
                    <>
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-emerald-950 block">Hợp đồng đã ký kết!</span>
                        <span className="text-[10px] text-emerald-800 mt-0.5 block leading-normal">
                          Bạn đã thực hiện ký điện tử thành công qua cổng Trovia e-Sign.
                        </span>
                      </div>
                      <Button 
                        className="w-full h-11 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition"
                        asChild
                      >
                        <Link to="/app/payments">Đi tới trang Thanh toán</Link>
                      </Button>
                    </>
                  )}

                  {c.status === "REJECTED" && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                      <XCircle className="h-5 w-5 text-rose-600 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-rose-950 block">Hợp đồng bị từ chối</span>
                      <span className="text-[10px] text-rose-800 mt-0.5 block leading-normal">
                        Yêu cầu ký điện tử hợp đồng này đã bị từ chối.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="text-[10px] text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Bảo mật chuẩn mã hóa Trovia e-Sign</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
