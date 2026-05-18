import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Check, HelpCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Bảng giá dịch vụ — Trovia" },
      { name: "description", content: "Bảng giá các gói dịch vụ quản lý phòng trọ hiện đại, minh bạch dành cho chủ nhà trên Trovia." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-hero-gradient overflow-hidden">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Minh bạch tuyệt đối
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-6xl font-bold tracking-tight"
            >
              Lựa chọn gói dịch vụ<br />
              <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_285)] bg-clip-text text-transparent">Phù hợp với mô hình của bạn</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Người thuê trọ sử dụng Trovia hoàn toàn miễn phí. Chủ nhà có thể lựa chọn các gói dịch vụ linh hoạt tùy theo quy mô số lượng phòng quản lý.
            </motion.p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-4 sm:px-6 bg-background">
          <div className="mx-auto max-w-6xl space-y-16">
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Plan 1: Free */}
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm text-left flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Gói Cơ Bản</h3>
                    <p className="text-xs text-muted-foreground mt-1">Dành cho chủ nhà nhỏ dưới 5 phòng</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">0đ</span>
                    <span className="text-xs text-muted-foreground">/ tháng</span>
                  </div>
                  <ul className="space-y-3 pt-4 border-t border-border/60">
                    {["Đăng tối đa 5 tin phòng trọ", "Hợp đồng thuê điện tử cơ bản", "Quản lý hóa đơn thủ công", "Không mất phí giao dịch", "Support qua ticket"].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="w-full py-3 px-4 rounded-xl border border-border hover:bg-secondary text-foreground text-sm font-semibold transition">
                  Bắt đầu miễn phí
                </button>
              </div>

              {/* Plan 2: Professional (Popular) */}
              <div className="p-8 rounded-3xl bg-surface-elevated border-2 border-primary shadow-[var(--shadow-elegant)] text-left flex flex-col justify-between space-y-8 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Phổ biến nhất
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Gói Chuyên Nghiệp</h3>
                    <p className="text-xs text-muted-foreground mt-1">Quản lý chuyên nghiệp lên đến 50 phòng</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-primary">290.000đ</span>
                    <span className="text-xs text-muted-foreground">/ tháng</span>
                  </div>
                  <ul className="space-y-3 pt-4 border-t border-border/60">
                    {["Đăng tin phòng không giới hạn", "Hợp đồng thuê ký số trực tiếp", "Tự động xuất hóa đơn qua email", "Tích hợp cổng VietQR thanh toán tự động", "Báo cáo doanh thu thời gian thực", "Support nhanh trong 2 giờ"].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="w-full py-3 px-4 rounded-xl bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 transition">
                  Nâng cấp chuyên nghiệp
                </button>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm text-left flex flex-col justify-between space-y-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Gói Doanh Nghiệp</h3>
                    <p className="text-xs text-muted-foreground mt-1">Dành cho tòa nhà chung cư, chuỗi phòng trọ lớn</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">Liên hệ</span>
                  </div>
                  <ul className="space-y-3 pt-4 border-t border-border/60">
                    {["Quản lý chuỗi hàng trăm phòng", "Bàn giao mã nguồn riêng biệt (nếu yêu cầu)", "Thiết lập VietQR/Cổng thanh toán riêng", "Kỹ sư kỹ thuật hỗ trợ 24/7", "Đào tạo nghiệp vụ nhân sự miễn phí"].map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="w-full py-3 px-4 rounded-xl border border-border hover:bg-secondary text-foreground text-sm font-semibold transition">
                  Liên hệ bộ phận bán hàng
                </button>
              </div>

            </div>

            {/* Pricing FAQ list */}
            <div className="pt-16 border-t border-border max-w-4xl mx-auto space-y-8">
              <h3 className="text-2xl font-bold text-foreground text-center">Câu hỏi thường gặp</h3>
              <div className="grid md:grid-cols-2 gap-8 text-left">
                {[
                  { q: "Tôi có thể hủy gói dịch vụ lúc nào?", a: "Có, bạn hoàn toàn có thể hủy hoặc hạ cấp dịch vụ bất cứ lúc nào từ trang cài đặt hồ sơ của bạn mà không phải chịu bất kỳ khoản phí ẩn nào." },
                  { q: "Phí dịch vụ VietQR được tính thế nào?", a: "Chúng tôi không phụ thu thêm phí giao dịch VietQR, số tiền khách thuê đóng sẽ được chuyển thẳng trực tiếp vào tài khoản ngân hàng thụ hưởng của chủ nhà." },
                  { q: "Khách thuê có cần đóng phí gì không?", a: "Không, Trovia cam kết miễn phí 100% trọn đời dành cho người đi tìm phòng và người thuê nhà trọ." },
                  { q: "Tôi có thể dùng thử gói Chuyên Nghiệp không?", a: "Có, tất cả tài khoản chủ nhà đăng ký mới đều được tự động dùng thử gói Chuyên Nghiệp hoàn toàn miễn phí trong vòng 30 ngày." },
                ].map((faq, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground pl-6">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
