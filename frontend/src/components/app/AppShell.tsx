import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Home, Compass, Heart, MessageSquare, FileText, User, Sparkles,
  Search, Bell, Moon, Sun, LogOut, Settings, Menu, X, LayoutDashboard,
  CreditCard, ArrowLeftRight, Building, HelpCircle, Laptop, Wrench
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { cn } from "@/lib/utils";

type NavItem = { to: string; labelKey?: string; label?: string; view?: string; icon: any; exact?: boolean; badge?: number };

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = (user?.fullName || user?.email || "U").slice(0, 2).toUpperCase();
  const isLandlord = user?.roles?.includes("LANDLORD");
  const inLandlordMode = path.startsWith("/app/landlord");

  const locationState = useRouterState({ select: (s) => s.location });
  const viewParam = (locationState.search as any)?.view || "overview";

  // Dynamic sidebars depending on current role context
  const tenantNav: NavItem[] = [
    { to: "/app/explore", labelKey: "nav.explore", icon: Compass },
    { to: "/app/saved", labelKey: "nav.saved", icon: Heart },
    { to: "/app/messages", labelKey: "nav.messages", icon: MessageSquare, badge: 0 },
    { to: "/app/requests", labelKey: "nav.requests", icon: FileText },
    { to: "/app/contracts", labelKey: "nav.contracts", icon: FileText },
    { to: "/app/payments", labelKey: "nav.payments", icon: CreditCard },
    { to: "/app/profile", labelKey: "nav.profile", icon: User },
  ];

  const landlordNav: NavItem[] = [
    { to: "/app/landlord?view=overview", view: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/app/landlord?view=properties", view: "properties", label: "Bất động sản", icon: Building },
    { to: "/app/landlord?view=rooms", view: "rooms", label: "Phòng / Căn hộ", icon: Home },
    { to: "/app/landlord?view=requests", view: "requests", label: "Yêu cầu thuê", icon: FileText },
    { to: "/app/landlord?view=tenants", view: "tenants", label: "Người thuê", icon: User },
    { to: "/app/landlord?view=contracts", view: "contracts", label: "Hợp đồng", icon: FileText },
    { to: "/app/landlord?view=payments", view: "payments", label: "Thanh toán", icon: CreditCard },
    { to: "/app/landlord?view=maintenance", view: "maintenance", label: "Bảo trì", icon: Wrench },
    { to: "/app/landlord?view=settings", view: "settings", label: "Cài đặt", icon: Settings },
  ];

  const currentNav = inLandlordMode ? landlordNav : tenantNav;

  const SidebarInner = (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <Link 
        to={inLandlordMode ? "/app/landlord" : "/app/explore"} 
        className="flex items-center gap-2 px-6 h-20 border-b border-border/60 shrink-0"
      >
        <div className={cn(
          "grid place-items-center h-10 w-10 rounded-xl text-primary-foreground shadow-sm transition-all duration-300",
          inLandlordMode 
            ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/20" 
            : "bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] shadow-primary/20"
        )}>
          {inLandlordMode ? <Building className="h-5 w-5" /> : <Home className="h-5 w-5" />}
        </div>
        <div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground block">
            {t("common.app_name")}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase -mt-0.5 block">
            {inLandlordMode ? "Landlord Console" : "Rental Hub"}
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 select-none">
        {currentNav.map((item) => {
          const active = inLandlordMode
            ? (item.view ? viewParam === item.view : path === item.to)
            : (item.exact ? path === item.to : path.startsWith(item.to));
          return (
            <Link 
              key={item.to} 
              to={item.to as any} 
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border border-transparent",
                active 
                  ? inLandlordMode
                    ? "bg-amber-50 text-amber-700 font-semibold border-amber-100/50 shadow-sm"
                    : "bg-primary-soft text-primary font-semibold border-primary/5 shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5 transition-transform duration-200", active && "scale-105")} />
              <span className="flex-1 text-left">{item.labelKey ? t(item.labelKey) : item.label}</span>
              {!!item.badge && (
                <span className={cn(
                  "text-[10px] font-bold rounded-full px-2 py-0.5 text-white shadow-sm",
                  inLandlordMode ? "bg-amber-600" : "bg-primary"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Dynamic bottom item based on capability */}
        <div className="pt-4 mt-4 border-t border-border/60 space-y-1">
          {inLandlordMode ? (
            <Link 
              to="/app/explore" 
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all"
            >
              <ArrowLeftRight className="h-4.5 w-4.5" />
              <span>Quay lại Khám phá</span>
            </Link>
          ) : isLandlord ? (
            <Link 
              to="/app/landlord" 
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all"
            >
              <Building className="h-4.5 w-4.5 text-amber-500" />
              <span>Kênh chủ nhà</span>
            </Link>
          ) : (
            <Link 
              to="/app/become-landlord" 
              onClick={() => setMobileOpen(false)}
              className="group block rounded-2xl p-4 bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105 transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" /> {t("nav.become_landlord")}
              </div>
              <p className="text-[11px] mt-1 opacity-90 leading-normal">{t("landlord.onboarding.subtitle")}</p>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border/60 bg-surface">
        {SidebarInner}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-foreground/45 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-surface z-50 border-r border-border/80 shadow-2xl">
            {SidebarInner}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="h-full px-6 sm:px-8 flex items-center justify-between gap-6">
            
            {/* Left controls */}
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0 hover:bg-secondary" onClick={() => setMobileOpen((v) => !v)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Premium Search Experience */}
              <div className="flex-1 max-w-xl relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Tìm phòng trọ, căn hộ, quận huyện, trường học..." 
                  className="pl-9 h-11 bg-secondary/40 border-transparent hover:bg-secondary/70 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl text-sm" 
                />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4 shrink-0">
              
              {/* Switch to Landlord/Tenant Button */}
              {isLandlord && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate({ to: inLandlordMode ? "/app/explore" : "/app/landlord" })}
                  className={cn(
                    "hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer border transition-all duration-200",
                    inLandlordMode
                      ? "text-primary border-primary/20 bg-primary-soft/30 hover:bg-primary-soft/60"
                      : "text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-50"
                  )}
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>{inLandlordMode ? "Kênh khách thuê" : "Switch to Landlord"}</span>
                </Button>
              )}

              <LanguageSwitcher />

              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="h-10 w-10 rounded-xl hover:bg-secondary">
                {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
              </Button>

              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary" aria-label="Notifications">
                <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
              </Button>

              {/* Personal Hub dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] hover:scale-105 transition duration-200 grid place-items-center text-primary-foreground text-xs font-bold cursor-pointer shadow-sm relative group overflow-hidden">
                    <span className="relative z-10">{initials}</span>
                    <span className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-2xl shadow-xl ring-1 ring-black/5 mt-1">
                  <DropdownMenuLabel className="font-normal px-3 py-2">
                    <div className="text-sm font-semibold text-foreground leading-none">{user?.fullName || "Trovia User"}</div>
                    <div className="text-xs text-muted-foreground truncate mt-1">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1.5" />
                  
                  {/* Redirect to Personal Hub (Tenant Dashboard) */}
                  <DropdownMenuItem onSelect={() => navigate({ to: "/app/tenant/dashboard" })} className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                    <Laptop className="h-4 w-4 mr-2 text-muted-foreground" />
                    Personal Hub
                  </DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => navigate({ to: "/app/profile" })} className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                    <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                    {t("common.actions")}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1.5" />
                  
                  <DropdownMenuItem onSelect={async () => { await signOut(); navigate({ to: "/" }); }} className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />{t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-6 sm:px-8 lg:px-12 py-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
