import { Home, Github, Facebook, Linkedin, Mail, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-10">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">Trovia</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Nền tảng thuê trọ thông minh dành cho sinh viên, chuyên viên trẻ và các chủ nhà hiện đại.
          </p>
          <div className="flex gap-2.5 pt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-secondary hover:text-primary transition"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-secondary hover:text-primary transition"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-secondary hover:text-primary transition"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Product Columns */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-4">Sản phẩm</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/explore" className="text-muted-foreground hover:text-primary transition-colors">
                Khám phá phòng
              </Link>
            </li>
            <li>
              <Link to="/tenants" className="text-muted-foreground hover:text-primary transition-colors">
                Dành cho người thuê
              </Link>
            </li>
            <li>
              <Link to="/landlords" className="text-muted-foreground hover:text-primary transition-colors">
                Dành cho chủ nhà
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                Bảng giá dịch vụ
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Columns */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-4">Công ty</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                Về Trovia
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Liên hệ hỗ trợ
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                Trợ giúp & FAQ
              </Link>
            </li>
            <li>
              <Link to="/safety" className="text-muted-foreground hover:text-primary transition-colors">
                An toàn & Tin cậy
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Newsletter */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-foreground mb-4">Nhận thông tin mới nhất</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đăng ký nhận thông tin thị trường bất động sản trọ và các ưu đãi mới nhất từ chúng tôi.
          </p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 min-w-0 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            <button className="rounded-xl bg-foreground text-background hover:bg-foreground/90 px-4 py-2.5 text-sm font-semibold transition">
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Footer Bar */}
      <div className="border-t border-border bg-surface-elevated/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Trovia Việt Nam. Được xây dựng với</span>
            <Heart className="h-3 w-3 text-destructive fill-destructive" />
            <span>dành cho cộng đồng thuê trọ.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
