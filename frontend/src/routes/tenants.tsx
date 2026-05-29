import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { ShieldCheck, Heart, Search, ClipboardCheck, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/tenants")({
  head: () => ({
    meta: [
      { title: "Trovia for Tenants — Tìm phòng trọ an toàn, nhanh chóng" },
      { name: "description", content: "Tìm kiếm hàng ngàn phòng trọ sinh viên, phòng studio dịch vụ đã xác thực thông tin 100% tại Hà Nội, TP.HCM." },
    ],
  }),
  component: TenantsPage,
});

function TenantsPage() {
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
                Dành cho học sinh, sinh viên & người đi làm
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]"
              >
                Tìm căn phòng mơ ước<br />
                <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_285)] bg-clip-text text-transparent">Nhanh chóng & An tâm tuyệt đối</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-base text-muted-foreground leading-relaxed max-w-xl"
              >
                Tạm biệt thông tin ảo, cò mồi lừa đảo. Trovia kết nối bạn trực tiếp với các chủ trọ uy tín đã qua xác thực danh tính rõ ràng. Trải nghiệm hành trình thuê phòng trọ khép kín hoàn hảo từ tìm kiếm, xem phòng đến ký hợp đồng số và thanh toán VietQR cực kỳ tiện lợi.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center gap-3"
              >
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3.5 text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-95 transition"
                >
                  Bắt đầu tìm phòng ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold hover:bg-secondary transition"
                >
                  Đăng ký tài khoản
                </Link>
              </motion.div>
            </div>

            {/* Visual representation card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hidden md:block p-6 rounded-3xl bg-surface-elevated border border-border shadow-[var(--shadow-elegant)] space-y-4 text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Phòng trọ đã xác thực</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Căn phòng này đã được nhân viên của Trovia kiểm duyệt thực địa tại chỗ, thông tin diện tích 28m² và giá cọc 1 tháng là chính xác."
              </p>
              <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                100% Tin cậy
              </span>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-16 text-left">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Hành trình thuê nhà thông minh hơn</h2>
              <p className="text-sm text-muted-foreground font-medium">Trovia đồng hành và bảo vệ quyền lợi tối đa cho bạn từ lúc bắt đầu tìm trọ đến suốt thời gian cư trú.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Search className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Tìm kiếm thông minh</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Lọc chính xác phòng theo địa bàn quận huyện, khoảng giá mong muốn hoặc khoảng cách gần trường học.</p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Xác thực tin đăng</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Loại bỏ tin ảo, tin rác. Đội ngũ Trovia đi khảo sát trực tiếp chất lượng phòng tại các khu vực trọng điểm.</p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Hợp đồng điện tử</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Đọc và ký kết hợp đồng thuê số nhanh chóng ngay trên ứng dụng, không lo sửa đổi điều khoản bất lợi.</p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                  <Heart className="h-5 w-5 fill-destructive text-destructive" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Báo cáo bảo trì tức thì</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Phát hiện sự cố điện nước? Chỉ cần chụp ảnh gửi yêu cầu, chủ nhà sẽ tiếp nhận và sửa chữa ngay.</p>
              </div>

            </div>

            {/* Bottom Explore Prompt */}
            <div className="p-8 sm:p-12 rounded-3xl bg-surface-elevated border border-border text-center space-y-6 max-w-3xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Tìm căn phòng lý tưởng của bạn ngay bây giờ</h3>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">Hàng ngàn phòng trọ dịch vụ cao cấp, phòng trọ giá rẻ gần các trường đại học lớn đang chờ bạn khám phá.</p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition animate-pulse"
              >
                Khám phá bản đồ phòng trọ
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
