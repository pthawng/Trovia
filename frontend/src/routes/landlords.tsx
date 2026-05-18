import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { ShieldCheck, BarChart3, Smartphone, FileSpreadsheet, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/landlords")({
  head: () => ({
    meta: [
      { title: "Trovia for Landlords — Giải pháp quản lý phòng trọ 4.0" },
      { name: "description", content: "Tự động hóa quản lý hóa đơn, hợp đồng số, thu tiền trọ tự động qua VietQR dành cho chủ nhà trọ hiện đại." },
    ],
  }),
  component: LandlordsPage,
});

function LandlordsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-hero-gradient overflow-hidden">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 grid md:grid-cols-[1.2fr_0.8fr] gap-12 items-center text-left">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Giải pháp vận hành tối ưu
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
              >
                Quản lý chuỗi phòng trọ<br />
                <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_285)] bg-clip-text text-transparent">Nhẹ nhàng & Tự động 100%</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base text-muted-foreground leading-relaxed max-w-xl"
              >
                Bỏ qua sổ sách thủ công. Trovia giúp bạn tự động hóa toàn bộ quy trình: từ đăng tin tìm khách, ký hợp đồng điện tử đến tự động tạo hóa đơn tiền nhà và đối soát VietQR ngân hàng tức thì.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center gap-3"
              >
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-95 transition"
                >
                  Bắt đầu ngay miễn phí
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold hover:bg-secondary transition"
                >
                  Xem bảng giá
                </Link>
              </motion.div>
            </div>
            
            {/* Visual representation card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hidden md:block p-6 rounded-3xl bg-surface-elevated border border-border shadow-[var(--shadow-elegant)] space-y-4"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Doanh thu tháng này</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Đã thanh toán (18 phòng)</span>
                  <span className="font-bold text-foreground">84.500.000đ</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-[oklch(0.55_0.2_160)] h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>Chờ thanh toán (2 phòng)</span>
                  <span className="font-bold text-primary">8.200.000đ</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-16 text-left">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Tại sao hơn 2.000+ chủ trọ chọn Trovia?</h2>
              <p className="text-sm text-muted-foreground">Chúng tôi đóng gói toàn bộ công cụ vận hành bất động sản chuyên nghiệp vào một phần mềm duy nhất.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Xác thực KYC Uy Tín</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Gia tăng độ uy tín, hút khách thuê nhanh gấp 3 lần nhờ huy hiệu Đã Xác Thực của Trovia.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Thu tiền nhà qua VietQR</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Hóa đơn tự động sinh mã VietQR động chứa chính xác số tiền nhà, nhận tiền nổi ngay lập tức.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Ký số Hợp đồng trực tuyến</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Ký kết văn bản pháp lý chỉ bằng 1 chạm trên điện thoại, lưu trữ bảo mật trên blockchain đám mây.</p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Báo cáo tài chính chi tiết</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Theo dõi dòng tiền, chi phí dịch vụ điện nước và tỉ lệ lấp đầy phòng trọ trực quan.</p>
              </div>

            </div>

            {/* Bottom Register Prompt */}
            <div className="p-8 sm:p-12 rounded-3xl bg-surface-elevated border border-border text-center space-y-6 max-w-3xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Bắt đầu hiện đại hóa khu trọ của bạn hôm nay</h3>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">Dùng thử trọn vẹn toàn bộ các tính năng cao cấp của gói Chuyên Nghiệp hoàn toàn miễn phí trong vòng 30 ngày.</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition"
              >
                Đăng ký tài khoản chủ nhà
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
