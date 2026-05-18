import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { HelpCircle, Search, Sparkles, BookOpen, Key, DollarSign, ShieldAlert } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Trung tâm trợ giúp & Hỏi đáp FAQ — Trovia" },
      { name: "description", content: "Tìm câu trả lời cho các câu hỏi thường gặp về cách thức tìm phòng, đăng tin và bảo mật trên Trovia." },
    ],
  }),
  component: HelpPage,
});

const faqCategories = [
  {
    title: "Tài khoản & Đăng nhập",
    icon: <Key className="h-4.5 w-4.5 text-primary" />,
    items: [
      { q: "Làm thế nào để xác thực tài khoản email?", a: "Sau khi đăng ký tài khoản, Trovia sẽ gửi một email xác thực chứa liên kết. Bạn chỉ cần nhấn vào liên kết đó để hoàn tất quá trình xác thực tài khoản." },
      { q: "Tôi phải làm gì nếu quên mật khẩu?", a: "Nhấn vào 'Quên mật khẩu' tại trang đăng nhập, điền email đăng ký và hệ thống sẽ gửi hướng dẫn khôi phục mật khẩu trực tiếp về hộp thư của bạn." }
    ]
  },
  {
    title: "Quy trình Tìm kiếm & Thuê phòng trọ",
    icon: <BookOpen className="h-4.5 w-4.5 text-[oklch(0.55_0.2_160)]" />,
    items: [
      { q: "Phòng trọ có nhãn 'Xác thực' nghĩa là gì?", a: "Những phòng trọ có nhãn này đã được nhân viên của Trovia kiểm tra thực tế, xác thực giấy tờ pháp lý của chủ nhà và tình trạng phòng trống trước khi đăng tải." },
      { q: "Làm thế nào để hẹn lịch xem phòng trọ?", a: "Tại giao diện chi tiết phòng trọ, bạn có thể tạo yêu cầu hẹn xem trực tuyến với khung giờ mong muốn, chủ nhà sẽ duyệt hoặc sắp xếp lại và phản hồi qua tin nhắn." }
    ]
  },
  {
    title: "Thanh toán & Hợp đồng thuê nhà",
    icon: <DollarSign className="h-4.5 w-4.5 text-[oklch(0.75_0.15_70)]" />,
    items: [
      { q: "Tôi có thể đóng tiền nhà bằng cách nào?", a: "Trovia hỗ trợ thanh toán trực tiếp qua mã VietQR thông minh, tiền sẽ chuyển trực tiếp từ tài khoản ngân hàng của bạn tới ngân hàng của chủ nhà vô cùng an toàn." },
      { q: "Hợp đồng thuê điện tử trên hệ thống có giá trị pháp lý không?", a: "Có, hợp đồng thuê nhà được tạo lập và ký số trực tuyến trên Trovia hoàn toàn đáp ứng đầy đủ điều kiện pháp lý giao dịch dân sự theo Luật giao dịch điện tử Việt Nam." }
    ]
  },
  {
    title: "Bảo mật & Tranh chấp",
    icon: <ShieldAlert className="h-4.5 w-4.5 text-destructive" />,
    items: [
      { q: "Trovia xử lý thế nào khi chủ nhà đăng tin sai sự thật?", a: "Nếu phát hiện tin đăng không đúng thực tế, bạn hãy sử dụng chức năng 'Báo cáo vi phạm'. Chúng tôi sẽ cử nhân viên kiểm tra lại và khóa tài khoản của chủ nhà ngay lập tức nếu phát hiện lừa đảo." },
      { q: "Tiền cọc của tôi có được bảo đảm an toàn không?", a: "Có, tiền cọc sẽ được ghi nhận rõ ràng trên hợp đồng số điện tử và Trovia sẽ lưu vết lịch sử giao dịch để làm căn cứ pháp lý giải quyết khi xảy ra tranh chấp hoàn cọc." }
    ]
  }
];

function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Search Section */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-hero-gradient overflow-hidden">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Trung tâm hỗ trợ Trovia
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight"
            >
              Chúng tôi có thể giúp gì cho bạn?
            </motion.h1>
            
            {/* Search Input Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative max-w-xl mx-auto mt-4"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa tìm kiếm trợ giúp..."
                className="w-full rounded-2xl border border-border bg-surface px-12 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-elegant transition"
              />
            </motion.div>
          </div>
        </section>

        {/* FAQs Content List */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-16">
            
            <div className="space-y-12">
              {faqCategories.map((cat, catIdx) => {
                // Filter questions based on search query
                const filteredItems = cat.items.filter(
                  (item) =>
                    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.a.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredItems.length === 0) return null;

                return (
                  <div key={catIdx} className="space-y-4 text-left">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                      {cat.icon}
                      <h3 className="text-lg font-bold text-foreground">{cat.title}</h3>
                    </div>

                    <div className="space-y-3">
                      {filteredItems.map((item, itemIdx) => {
                        const uniqueId = `${catIdx}-${itemIdx}`;
                        const isOpen = openIndex === uniqueId;

                        return (
                          <div
                            key={itemIdx}
                            className="rounded-2xl border border-border bg-surface hover:bg-surface-elevated/40 transition overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFAQ(uniqueId)}
                              className="w-full py-4 px-6 flex items-center justify-between font-semibold text-sm text-foreground text-left"
                            >
                              <span className="pr-4">{item.q}</span>
                              <HelpCircle className={`h-4.5 w-4.5 text-primary shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isOpen && (
                              <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/5">
                                {item.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support CTA Callout */}
            <div className="p-8 rounded-3xl bg-surface-elevated border border-border flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">Bạn không tìm thấy câu trả lời?</h4>
                <p className="text-xs text-muted-foreground">Đội ngũ kỹ sư hỗ trợ kỹ thuật của chúng tôi luôn trực tuyến để xử lý yêu cầu riêng của bạn.</p>
              </div>
              <a
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-foreground hover:opacity-90 text-background text-xs font-bold transition shrink-0"
              >
                Gửi yêu cầu trợ giúp
              </a>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
