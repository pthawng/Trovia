import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Liên hệ với Trovia — Hỗ trợ 24/7" },
      { name: "description", content: "Kết nối với bộ phận hỗ trợ khách hàng và tư vấn dịch vụ của Trovia Việt Nam." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFormData({ name: "", email: "", message: "" });
      toast.success("Tin nhắn của bạn đã được gửi thành công! Đội ngũ Trovia sẽ liên hệ lại sớm nhất.");
    }, 1200);
  };

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
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Kết nối ngay
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-6xl font-bold tracking-tight"
            >
              Chúng tôi luôn sẵn sàng<br />
              <span className="bg-gradient-to-r from-primary to-[oklch(0.6_0.2_285)] bg-clip-text text-transparent">Lắng nghe & Hỗ trợ bạn</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Mọi đóng góp ý kiến, phản hồi về dịch vụ hoặc yêu cầu hỗ trợ kỹ thuật, xin vui lòng gửi tin nhắn hoặc liên hệ trực tiếp qua hotline.
            </motion.p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl grid md:grid-cols-[1.2fr_1.8fr] gap-12 text-left">
            
            {/* Direct support information card */}
            <div className="space-y-8 p-8 rounded-3xl bg-surface border border-border shadow-sm">
              <h3 className="text-xl font-bold text-foreground">Thông tin liên hệ</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Đội ngũ chăm sóc khách hàng của Trovia hỗ trợ trực tuyến liên tục 24/7 kể cả các ngày lễ Tết.
              </p>
              
              <div className="space-y-6 pt-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Email hỗ trợ</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">support@trovia.vn</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Hotline khẩn cấp</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">+84 (24) 123 4567</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Văn phòng đại diện</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Tòa nhà Innovation, Công viên phần mềm Quang Trung, Quận 12, TP. Hồ Chí Minh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form card */}
            <div className="p-8 rounded-3xl bg-surface-elevated border border-border shadow-[var(--shadow-elegant)]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Họ và tên của bạn</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyen Van A"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Địa chỉ email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@email.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-semibold text-muted-foreground">Nội dung tin nhắn</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tôi cần tư vấn thêm về dịch vụ..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 rounded-xl bg-primary hover:opacity-95 text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Đang gửi đi..." : "Gửi tin nhắn liên hệ"}
                </button>
              </form>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
