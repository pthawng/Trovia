import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Eye, ShieldCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Chính sách bảo mật thông tin — Trovia" },
      { name: "description", content: "Tìm hiểu chính sách bảo vệ dữ liệu cá nhân, lưu trữ và mã hóa thông tin của người dùng trên Trovia." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <Lock className="h-3.5 w-3.5 text-primary" />
              Bảo mật tuyệt đối
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight"
            >
              Chính sách bảo mật thông tin
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm text-muted-foreground max-w-2xl mx-auto"
            >
              Cập nhật lần cuối: Ngày 18 tháng 5 năm 2026. Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn theo chuẩn mã hóa cao nhất.
            </motion.p>
          </div>
        </section>

        {/* Privacy Policy Content Section */}
        <section className="py-16 px-4 sm:px-6 text-left">
          <div className="mx-auto max-w-4xl rounded-3xl bg-surface border border-border p-8 sm:p-12 space-y-8 leading-relaxed text-sm text-muted-foreground shadow-sm">
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                1. Dữ liệu cá nhân thu thập
              </h2>
              <p>
                Khi bạn đăng ký tài khoản hoặc sử dụng ứng dụng Trovia, chúng tôi thu thập các thông tin cá nhân cơ bản bao gồm: Họ tên, địa chỉ email, số điện thoại liên lạc, thông tin xác minh danh tính đối với chủ nhà (CMND/CCCD, ảnh chụp) và lịch sử lưu vết hoạt động tìm trọ.
              </p>
              <p>
                Mọi thông tin nhạy cảm như mật khẩu đều được băm bằng thuật toán bảo mật cao cấp (BCrypt/Argon2) trước khi lưu trữ vào hệ thống cơ sở dữ liệu.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                2. Mục đích sử dụng dữ liệu
              </h2>
              <p>
                Trovia sử dụng dữ liệu thu thập được nhằm mục đích:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Xác thực tài khoản người dùng và duy trì phiên hoạt động bảo mật.</li>
                <li>Xử lý và chuyển tiếp yêu cầu xem phòng, hồ sơ đăng ký thuê giữa các bên.</li>
                <li>Gửi thông báo cập nhật qua email (Hóa đơn thanh toán, trạng thái bảo trì phòng trọ, yêu cầu hợp đồng).</li>
                <li>Ngăn chặn và phát hiện các hành vi gian lận tài chính hoặc tin đăng lừa đảo giả mạo.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                3. Cam kết bảo mật an ninh dữ liệu
              </h2>
              <p>
                Hệ thống máy chủ Trovia áp dụng chuẩn bảo mật đường truyền mã hóa SSL/TLS cho mọi yêu cầu mạng API. Cơ sở dữ liệu chính được bảo vệ chặt chẽ sau tường lửa thế hệ mới và sao lưu tự động hàng ngày.
              </p>
              <p>
                Chúng tôi tuyệt đối không mua bán, trao đổi hoặc cho bên thứ ba thuê thông tin cá nhân của bạn vì mục đích quảng cáo thương mại dưới bất kỳ hình thức nào.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                4. Chia sẻ thông tin bắt buộc
              </h2>
              <p>
                Thông tin liên hệ của bạn chỉ được hiển thị trực tiếp cho đối tác giao dịch (Ví dụ: Số điện thoại người thuê hiển thị cho chủ nhà sau khi yêu cầu thuê được chấp nhận) để phục vụ công tác liên lạc nhận phòng trọ. Ngoài ra, Trovia có nghĩa vụ cung cấp dữ liệu cá nhân cho cơ quan an ninh điều tra khi nhận được yêu cầu chính thức bằng văn bản pháp luật.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                5. Quyền kiểm soát của người dùng
              </h2>
              <p>
                Bạn có toàn quyền thay đổi tùy chọn nhận email thông báo tại tab <strong>Cấu hình thông báo</strong> trong trang hồ sơ cá nhân của mình, yêu cầu xuất dữ liệu hoặc yêu cầu xóa bỏ vĩnh viễn dữ liệu tài khoản bằng cách liên hệ trực tiếp với đội ngũ chăm sóc khách hàng của chúng tôi.
              </p>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
