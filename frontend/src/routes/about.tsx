import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { ShieldCheck, Heart, Sparkles, Trophy, Users, Star } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Về Trovia — Nền tảng thuê trọ thông minh" },
      { name: "description", content: "Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ xây dựng Trovia nhằm nâng cao trải nghiệm thuê trọ tại Việt Nam." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
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
              Câu chuyện của chúng tôi
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-6xl font-bold tracking-tight"
            >
              Tái định nghĩa trải nghiệm<br />
              <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_285)] bg-clip-text text-transparent">Thuê trọ thời đại số</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Trovia sinh ra để giải quyết nỗi đau của hàng triệu sinh viên và người đi làm trong quá trình tìm nhà trọ và giải quyết các xung đột phát sinh trong giao dịch thuê.
            </motion.p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-24">
            
            {/* Stat numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { count: "50K+", label: "Người thuê tin dùng", icon: <Users className="text-primary h-5 w-5" /> },
                { count: "10K+", label: "Phòng trọ xác thực", icon: <ShieldCheck className="text-[oklch(0.55_0.2_160)] h-5 w-5" /> },
                { count: "4.96", label: "Điểm đánh giá trung bình", icon: <Star className="text-[oklch(0.75_0.15_70)] h-5 w-5 fill-[oklch(0.75_0.15_70)]" /> },
                { count: "98%", label: "Tỉ lệ hài lòng", icon: <Heart className="text-destructive h-5 w-5 fill-destructive" /> },
              ].map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-surface-elevated border border-border text-center space-y-2 shadow-sm">
                  <div className="flex justify-center">{stat.icon}</div>
                  <div className="text-3xl font-extrabold text-foreground">{stat.count}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Vision & Mission */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4 p-8 rounded-3xl bg-surface-elevated border border-border shadow-sm text-left">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Sứ mệnh của Trovia</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thiết lập một hệ sinh thái thuê trọ an toàn, minh bạch và ứng dụng công nghệ hiện đại. Chúng tôi xóa bỏ hoàn toàn khoảng cách bất đối xứng thông tin giữa chủ nhà và người đi thuê thông qua quy trình xác thực toàn diện, ví điện tử hợp đồng số thông minh và hệ thống quản lý trực tuyến.
                </p>
              </div>

              <div className="space-y-4 p-8 rounded-3xl bg-surface-elevated border border-border shadow-sm text-left">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Cam kết cốt lõi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tại Trovia, an toàn và minh bạch là ưu tiên tối thượng của chúng tôi. Mỗi listing phòng trọ đăng tải trên hệ thống đều phải trải qua quá trình kiểm duyệt hồ sơ pháp lý chặt chẽ. Hợp đồng thuê nhà kỹ thuật số và hóa đơn điện tử tự động đảm bảo mọi quyền lợi tối đa cho đôi bên.
                </p>
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
