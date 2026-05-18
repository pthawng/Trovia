import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, Lock } from "lucide-react";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "An toàn & Tin cậy trên Trovia" },
      { name: "description", content: "Tìm hiểu cách thức Trovia thiết lập môi trường thuê phòng trọ an toàn, chống lừa đảo tiền cọc." },
    ],
  }),
  component: SafetyPage,
});

function SafetyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 bg-hero-gradient overflow-hidden">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-[oklch(0.55_0.2_160)]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Chính sách an tâm
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight"
            >
              An toàn & Tin cậy cùng Trovia
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm text-muted-foreground max-w-2xl mx-auto"
            >
              Chúng tôi xây dựng các bộ lọc xác thực mạnh mẽ để loại bỏ hoàn toàn rủi ro lừa đảo tiền đặt cọc và phòng trọ kém chất lượng.
            </motion.p>
          </div>
        </section>

        {/* Safety Content Section */}
        <section className="py-16 px-4 sm:px-6 text-left">
          <div className="mx-auto max-w-5xl space-y-16">
            
            {/* Grid of Safety Measures */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Measure 1 */}
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Xác minh danh tính chủ nhà (KYC)</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Mọi tài khoản chủ nhà (Landlord Profile) đăng tin trên Trovia đều phải trải qua quá trình tải ảnh căn cước công dân/hộ chiếu pháp lý và được đội ngũ nhân viên kiểm duyệt hồ sơ thủ công nghiêm ngặt trước khi được phép xuất bản tin đăng.
                </p>
              </div>

              {/* Measure 2 */}
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Kiểm duyệt chất lượng tin phòng</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Trovia có đội ngũ kiểm duyệt thực tế đi khảo sát phòng trọ định kỳ. Các căn phòng đáp ứng chất lượng sống, đúng thông tin diện tích và đầy đủ cơ sở vật chất sẽ được gắn huy hiệu xanh **Đã Xác Thực**, giúp người đi thuê an tâm tuyệt đối khi xuống tiền cọc.
                </p>
              </div>

              {/* Measure 3 */}
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[oklch(0.95_0.05_160)] text-[oklch(0.55_0.2_160)] flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Hợp đồng thuê số minh bạch</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Trovia xóa bỏ mọi kẽ hở pháp lý bằng quy trình ký kết hợp đồng số trực tuyến. Hợp đồng số quy định rõ ràng quyền hạn của đôi bên, hạn chế tuyệt đối tranh chấp liên quan đến việc hoàn trả tiền cọc hoặc tranh chấp phụ thu tiền điện, nước phát sinh.
                </p>
              </div>

              {/* Measure 4 */}
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm space-y-4">
                <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Phòng chống lừa đảo đặt cọc</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Chúng tôi khuyến nghị khách thuê tuyệt đối không chuyển khoản tiền giữ chỗ trực tiếp cho chủ phòng bên ngoài hệ thống khi chưa ký kết hợp đồng số trên Trovia hoặc chưa đi xem thực tế căn phòng để tránh rủi ro mất tiền cọc.
                </p>
              </div>

            </div>

            {/* Safety Tips Checklist */}
            <div className="p-8 sm:p-12 rounded-3xl bg-surface-elevated border border-border space-y-6">
              <h3 className="text-xl font-bold text-foreground text-center">Nguyên tắc thuê trọ an toàn từ Trovia</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  "Luôn yêu cầu xem phòng và kiểm tra cơ sở vật chất trực tiếp trước khi thanh toán.",
                  "Mọi giao dịch thanh toán đặt cọc nên được thực hiện thông qua ghi nhận của hệ thống.",
                  "Ký kết hợp đồng thuê nhà điện tử trên Trovia để bảo đảm giá trị pháp lý khi xảy ra tranh chấp.",
                  "Báo cáo ngay cho ban quản trị nếu chủ nhà có biểu hiện gian dối hoặc yêu cầu thanh toán ngoài luồng trái phép."
                ].map((tip, idx) => (
                  <div key={idx} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
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
