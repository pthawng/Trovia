import { motion } from "motion/react";
import { Home, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { UserBar } from "@/components/app/UserBar";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t("nav.explore"), href: "/explore" },
    { label: t("landing.why_us"), href: "#why-us" },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-300 ${
            scrolled ? "glass shadow-card" : "bg-transparent"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">{t("common.app_name")}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {!loading && user ? (
              <UserBar showModeSwitch={false} />
            ) : (
              <>
                <LanguageSwitcher />
                <Link to="/login" className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 transition-opacity">
                  {t("nav.register")}
                </Link>
              </>
            )}
            <button className="md:hidden p-2 rounded-lg hover:bg-secondary" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
