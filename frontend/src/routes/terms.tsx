import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Scale, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Điều khoản sử dụng dịch vụ — Trovia" },
      { name: "description", content: "Đọc kỹ điều khoản sử dụng và quy định pháp lý khi sử dụng nền tảng tìm kiếm và quản lý phòng trọ Trovia." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
              <Scale className="h-3.5 w-3.5 text-primary" />
              Văn bản pháp lý
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight"
            >
              Điều khoản sử dụng dịch vụ
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm text-muted-foreground max-w-2xl mx-auto"
            >
              Cập nhật lần cuối: Ngày 18 tháng 5 năm 2026. Xin vui lòng đọc kỹ các quy định trước khi đăng ký tài khoản.
            </motion.p>
          </div>
        </section>

        {/* Terms Content Section */}
        <section className="py-16 px-4 sm:px-6 text-left">
          <div className="mx-auto max-w-4xl rounded-3xl bg-surface border border-border p-8 sm:p-12 space-y-8 leading-relaxed text-sm text-muted-foreground shadow-sm">
            
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                1. Định nghĩa & Giới thiệu
              </h2>
              <p>
                Chào mừng bạn đến với <strong>Trovia</strong>. Khi đăng ký sử dụng tài khoản của chúng tôi (bao gồm cả tài khoản Người thuê và tài khoản Chủ nhà), bạn đồng ý tuân thủ toàn bộ các điều kiện và điều khoản pháp lý được quy định tại văn bản này.
              </p>
              <p>
                Trovia là nền tảng trung gian trực tuyến hỗ trợ kết nối, đăng tải tin thông tin phòng trọ, xác lập hợp đồng thuê nhà điện tử và quản lý các giao dịch đóng tiền cọc, tiền nhà giữa Chủ nhà và Người thuê nhà trọ.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                2. Quy định dành cho Người thuê phòng trọ
              </h2>
              <p>
                Người thuê cam kết cung cấp đầy đủ thông tin cá nhân chính xác (họ tên, email, số điện thoại, CMND/CCCD) khi thực hiện tạo yêu cầu thuê hoặc ký hợp đồng trực tuyến.
              </p>
              <p>
                Mọi hành vi thanh toán tiền cọc và tiền thuê qua nền tảng phải tuân thủ đúng hạn quy định trên hợp đồng đã ký kết. Người thuê hoàn toàn tự chịu trách nhiệm trước pháp luật về các hoạt động sinh hoạt và cư trú diễn ra trong phòng trọ đã thuê.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                3. Quy định dành cho Chủ phòng trọ (Landlords)
              </h2>
              <p>
                Chủ nhà phải cung cấp đầy đủ giấy chứng nhận quyền sở hữu hoặc quyền khai thác cho thuê bất động sản hợp pháp khi đăng ký tài khoản. Các hình ảnh, giá cả phòng và mô tả tiện ích đăng tải bắt buộc phải trùng khớp 100% với thực tế phòng trọ.
              </p>
              <p>
                Trovia có toàn quyền gỡ bỏ không báo trước các tin đăng có dấu hiệu lừa đảo, sai lệch thông tin hoặc nhận được nhiều phản hồi tiêu cực từ cộng đồng người thuê.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                4. Hợp đồng số & Giao dịch thanh toán
              </h2>
              <p>
                Hợp đồng điện tử được khởi tạo trên Trovia là văn bản thỏa thuận dân sự tự nguyện giữa hai bên. Trovia chỉ cung cấp công nghệ khởi tạo và lưu trữ chữ ký số, không tham gia vào bất kỳ nghĩa vụ tài chính nào liên quan trực tiếp đến việc thực thi hợp đồng thuê.
              </p>
              <p>
                Chúng tôi cam kết bảo mật mọi thông tin giao dịch VietQR của chủ nhà và khách thuê.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                5. Giới hạn trách nhiệm pháp lý
              </h2>
              <p>
                Trovia nỗ lực tối đa để xác thực thông tin đăng tải, tuy nhiên chúng tôi không chịu bất kỳ trách nhiệm pháp lý nào đối với tổn thất tài chính, thiệt hại tài sản hoặc tranh chấp dân sự phát sinh ngoài ý muốn giữa Chủ nhà và Người thuê nhà trong suốt thời gian cư trú thực tế.
              </p>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
