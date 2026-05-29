import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Home, Compass, Heart, MessageSquare, FileText, User, Sparkles,
  Search, Settings, Menu, X, LayoutDashboard,
  CreditCard, ArrowLeftRight, Building, Wrench
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SavedPropertyService } from "@/services/saved-property.service";
import { useAuth } from "@/lib/auth-context";
import { ConversationService } from "@/services/conversation.service";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { UserBar } from "@/components/app/UserBar";

type NavItem = { to: string; labelKey?: string; label?: string; view?: string; icon: any; exact?: boolean; badge?: number };

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  // Desktop sidebar collapse state persisting in localStorage (default to true / collapsed)
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("sidebar-collapsed");
      return stored !== null ? stored === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed ? "true" : "false");
  }, [collapsed]);

  // Fetch live saved count for real-time sidebar updates
  const { data: savedCountData } = useQuery({
    queryKey: ["savedCount"],
    queryFn: () => SavedPropertyService.getCount(),
    enabled: !!user,
  });
  const savedCount = savedCountData?.count || 0;

  // Fetch initial unread count on mount/auth-state change
  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await ConversationService.getUnreadCount();
        setUnreadCount(res.count);
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    };
    fetchUnread();
  }, [user]);

  // Real-time unread count socket updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleUnreadUpdate = (data: { userId: string; count: number }) => {
      if (data.userId === user.id) {
        setUnreadCount(data.count);
      }
    };

    socket.on("unreadCountUpdated", handleUnreadUpdate);
    return () => {
      socket.off("unreadCountUpdated", handleUnreadUpdate);
    };
  }, [socket, user]);

  const isLandlord = user?.roles?.includes("LANDLORD");
  const inLandlordMode = path.startsWith("/app/landlord");

  const locationState = useRouterState({ select: (s) => s.location });
  const viewParam = (locationState.search as any)?.view || "overview";

  // Dynamic sidebars depending on current role context
  const tenantNavTop: NavItem[] = [
    { to: "/app/explore", labelKey: "nav.explore", icon: Compass },
    { to: "/app/saved", labelKey: "nav.saved", icon: Heart, badge: savedCount },
    { to: "/app/messages", labelKey: "nav.messages", icon: MessageSquare, badge: unreadCount },
    { to: "/app/requests", labelKey: "nav.requests", icon: FileText },
  ];

  const tenantNavCurrentStay: NavItem[] = [
    { to: "/app/contracts", labelKey: "nav.contracts", icon: FileText },
    { to: "/app/payments", labelKey: "nav.payments", icon: CreditCard },
  ];

  const tenantNavBottom: NavItem[] = [
    { to: "/app/profile", labelKey: "nav.profile", icon: User },
  ];

  const landlordNav: NavItem[] = [
    { to: "/app/landlord?view=overview", view: "overview", labelKey: "dashboard.nav.overview", icon: LayoutDashboard },
    { to: "/app/landlord?view=properties", view: "properties", labelKey: "dashboard.nav.properties", icon: Building },
    { to: "/app/landlord?view=rooms", view: "rooms", labelKey: "dashboard.nav.rooms", icon: Home },
    { to: "/app/landlord?view=requests", view: "requests", labelKey: "dashboard.nav.requests", icon: FileText },
    { to: "/app/landlord?view=messages", view: "messages", labelKey: "dashboard.nav.messages", icon: MessageSquare, badge: unreadCount },
    { to: "/app/landlord?view=tenants", view: "tenants", labelKey: "dashboard.nav.tenants", icon: User },
    { to: "/app/landlord?view=contracts", view: "contracts", labelKey: "dashboard.nav.contracts", icon: FileText },
    { to: "/app/landlord?view=payments", view: "payments", labelKey: "dashboard.nav.payments", icon: CreditCard },
    { to: "/app/landlord?view=maintenance", view: "maintenance", labelKey: "dashboard.nav.maintenance", icon: Wrench },
    { to: "/app/landlord?view=settings", view: "settings", labelKey: "dashboard.nav.settings", icon: Settings },
  ];

  const SidebarInner = (isMobileView = false) => {
    // When in mobile view, we never render the sidebar collapsed
    const isCollapsed = !isMobileView && collapsed;
    
    return (
      <div className="flex h-full flex-col">
        {/* Brand Header */}
        <Link 
          to="/explore"
          className={cn(
            "flex items-center gap-2 h-20 border-b border-border/60 shrink-0 transition-all duration-300",
            isCollapsed ? "px-0 justify-center" : "px-6"
          )}
        >
          <div className={cn(
            "grid place-items-center h-10 w-10 rounded-xl text-primary-foreground shadow-sm transition-all duration-300 shrink-0",
            inLandlordMode 
              ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/20" 
              : "bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] shadow-primary/20"
          )}>
            {inLandlordMode ? <Building className="h-5 w-5" /> : <Home className="h-5 w-5" />}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left">
              <span className="font-display font-bold text-lg tracking-tight text-foreground block">
                {t("common.app_name")}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase -mt-0.5 block">
                {inLandlordMode ? "Landlord Console" : "Rental Hub"}
              </span>
            </div>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 select-none scrollbar-none">
          {!inLandlordMode ? (
            <>
              {/* Top section */}
              {tenantNavTop.map((item) => {
                const active = item.exact ? path === item.to : path.startsWith(item.to);
                return (
                  <Link 
                    key={item.to} 
                    to={item.to as any} 
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? (item.labelKey ? t(item.labelKey) : item.label) : undefined}
                    className={cn(
                      "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 border border-transparent relative",
                      isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4",
                      active 
                        ? "bg-primary-soft text-primary font-semibold border-primary/5 shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200", active && "scale-105")} />
                    {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{item.labelKey ? t(item.labelKey) : item.label}</span>}
                    {!!item.badge && (
                      isCollapsed ? (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                      ) : (
                        <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white shadow-sm bg-primary">
                          {item.badge}
                        </span>
                      )
                    )}
                  </Link>
                );
              })}

              {/* Separator and Current Stay section */}
              <div className={cn("pt-4 mt-4 border-t border-border/60", isCollapsed && "px-0")}>
                {!isCollapsed ? (
                  <div className="px-4 mb-2 text-[10px] font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                    <span>{t("nav.current_stay")}</span>
                  </div>
                ) : (
                  <div className="w-6 h-px bg-border/60 mx-auto mb-2" />
                )}
                {tenantNavCurrentStay.map((item) => {
                  const active = item.exact ? path === item.to : path.startsWith(item.to);
                  return (
                    <Link 
                      key={item.to} 
                      to={item.to as any} 
                      onClick={() => setMobileOpen(false)}
                      title={isCollapsed ? (item.labelKey ? t(item.labelKey) : item.label) : undefined}
                      className={cn(
                        "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 border border-transparent relative",
                        isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4",
                        active 
                          ? "bg-primary-soft text-primary font-semibold border-primary/5 shadow-sm"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200", active && "scale-105")} />
                      {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{item.labelKey ? t(item.labelKey) : item.label}</span>}
                      {!!item.badge && (
                        isCollapsed ? (
                          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                        ) : (
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white shadow-sm bg-primary">
                            {item.badge}
                          </span>
                        )
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom section (Trang cá nhân) */}
              <div className="pt-4 mt-4 border-t border-border/60">
                {tenantNavBottom.map((item) => {
                  const active = item.exact ? path === item.to : path.startsWith(item.to);
                  return (
                    <Link 
                      key={item.to} 
                      to={item.to as any} 
                      onClick={() => setMobileOpen(false)}
                      title={isCollapsed ? (item.labelKey ? t(item.labelKey) : item.label) : undefined}
                      className={cn(
                        "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 border border-transparent relative",
                        isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4",
                        active 
                          ? "bg-primary-soft text-primary font-semibold border-primary/5 shadow-sm"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200", active && "scale-105")} />
                      {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{item.labelKey ? t(item.labelKey) : item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            landlordNav.map((item) => {
              const active = item.view ? viewParam === item.view : path === item.to;
              return (
                <Link 
                  key={item.to} 
                  to={item.to as any} 
                  onClick={() => setMobileOpen(false)}
                  title={isCollapsed ? (item.labelKey ? t(item.labelKey) : item.label) : undefined}
                  className={cn(
                    "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 border border-transparent relative",
                    isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4",
                    active 
                      ? "bg-amber-50 text-amber-700 font-semibold border-amber-100/50 shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200", active && "scale-105")} />
                  {!isCollapsed && <span className="flex-1 text-left whitespace-nowrap">{item.labelKey ? t(item.labelKey) : item.label}</span>}
                  {!!item.badge && (
                    isCollapsed ? (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-600" />
                    ) : (
                      <span className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white shadow-sm bg-amber-600">
                        {item.badge}
                      </span>
                    )
                  )}
                </Link>
              );
            })
          )}

          {/* Dynamic bottom item based on capability */}
          <div className="pt-4 mt-4 border-t border-border/60 space-y-1">
            {inLandlordMode ? (
              <Link 
                to="/app/explore" 
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? t("property.back_to_explore") : undefined}
                className={cn(
                  "flex items-center rounded-xl py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all",
                  isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4"
                )}
              >
                <ArrowLeftRight className="h-4.5 w-4.5 shrink-0" />
                {!isCollapsed && <span>{t("property.back_to_explore")}</span>}
              </Link>
            ) : isLandlord ? (
              <Link 
                to={"/app/landlord" as any} 
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? t("nav.landlord_dashboard") : undefined}
                className={cn(
                  "flex items-center rounded-xl py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all",
                  isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4"
                )}
              >
                <Building className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                {!isCollapsed && <span>{t("nav.landlord_dashboard")}</span>}
              </Link>
            ) : (
              isCollapsed ? (
                <Link 
                  to="/app/become-landlord" 
                  onClick={() => setMobileOpen(false)}
                  title={t("nav.become_landlord")}
                  className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground flex items-center justify-center mx-auto hover:brightness-105 transition-all shadow-sm"
                >
                  <Sparkles className="h-4.5 w-4.5" />
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
                  <p className="text-[11px] mt-1 opacity-90 leading-normal">{t("dashboard.onboarding.subtitle")}</p>
                </Link>
              )
            )}

            {/* Expand/Collapse desktop toggle button at bottom */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              title={isCollapsed ? t("common.expand_sidebar") : t("common.collapse_sidebar")}
              className={cn(
                "hidden lg:flex items-center rounded-xl py-3 text-sm font-medium text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-all duration-200",
                isCollapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "gap-3 px-4 w-full"
              )}
            >
              <ArrowLeftRight className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-300", isCollapsed && "rotate-180")} />
              {!isCollapsed && <span className="whitespace-nowrap">{t("common.collapse_sidebar")}</span>}
            </button>
          </div>
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className={cn(
        "hidden lg:flex fixed inset-y-0 left-0 border-r border-border/60 bg-surface transition-all duration-300 z-30",
        collapsed ? "w-20" : "w-64"
      )}>
        {SidebarInner(false)}
      </aside>

      {/* Sidebar mobile */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-foreground/45 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-surface z-50 border-r border-border/80 shadow-2xl">
            {SidebarInner(true)}
          </aside>
        </>
      )}

      <div className={cn(
        "transition-all duration-300",
        collapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-20 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="h-full px-6 sm:px-8 flex items-center justify-between gap-6">
            
            {/* Left controls */}
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile menu toggle */}
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0 hover:bg-secondary" onClick={() => setMobileOpen((v) => !v)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Desktop sidebar collapse toggle in header */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="hidden lg:flex shrink-0 hover:bg-secondary h-10 w-10 rounded-xl" 
                onClick={() => setCollapsed((v) => !v)}
                aria-label="Toggle sidebar collapse"
                title={collapsed ? t("common.expand_sidebar") : t("common.collapse_sidebar")}
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              {/* Premium Search Experience */}
              <div className="flex-1 max-w-xl relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder={t("property.search_placeholder")} 
                  className="pl-9 h-11 bg-secondary/40 border-transparent hover:bg-secondary/70 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl text-sm" 
                />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4 shrink-0">
              
              <UserBar showModeSwitch />
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
