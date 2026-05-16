import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home, Compass, Heart, MessageSquare, FileText, User, Sparkles,
  Search, Bell, Moon, Sun, LogOut, Settings, Menu, X, LayoutDashboard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app", label: "Dashboard", icon: Home, exact: true },
  { to: "/app/explore", label: "Explore", icon: Compass },
  { to: "/app/saved", label: "Saved", icon: Heart },
  { to: "/app/messages", label: "Messages", icon: MessageSquare, badge: 3 },
  { to: "/app/requests", label: "Rental requests", icon: FileText },
  { to: "/app/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (user?.user_metadata?.full_name || user?.email || "U").slice(0, 2).toUpperCase();

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <Link to="/app" className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground">
          <Home className="h-4 w-4" />
        </div>
        <span className="font-display font-semibold text-lg tracking-tight">Trovia</span>
      </Link>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {nav.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}>
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{item.badge}</span>}
            </Link>
          );
        })}
        <div className="my-3 h-px bg-border" />
        <Link to="/app/landlord" onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            path.startsWith("/app/landlord") ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Landlord dashboard</span>
        </Link>
      </nav>
      <div className="p-3">
        <Link to="/app/become-landlord" onClick={() => setMobileOpen(false)}
          className="group block rounded-2xl p-4 bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground shadow-[var(--shadow-glow)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" /> Become a Landlord
          </div>
          <p className="text-xs mt-1 opacity-90">List your property and start earning in minutes.</p>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-surface">
        {SidebarInner}
      </aside>
      {/* Sidebar mobile */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-foreground/40 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-surface z-50 border-r border-border">
            {SidebarInner}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="h-full px-4 sm:px-6 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search properties, neighborhoods, landlords…" className="pl-9 h-10 bg-secondary border-transparent focus-visible:bg-background" />
            </div>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-primary-foreground text-xs font-semibold cursor-pointer ring-2 ring-transparent hover:ring-primary-soft transition">
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user?.user_metadata?.full_name || "Trovia user"}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/app/profile" })}><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={async () => { await signOut(); navigate({ to: "/" }); }}>
                  <LogOut className="h-4 w-4 mr-2" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="px-4 sm:px-6 lg:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}
