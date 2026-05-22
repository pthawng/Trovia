import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login",
        search: {
          redirect: window.location.pathname + window.location.search,
        },
      });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background space-y-4">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <div className="absolute h-10 w-10 text-primary rounded-full border border-primary/20 animate-ping" />
        </div>
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/80 animate-pulse">
          ĐANG XÁC THỰC PHÂN HỆ TROVIA...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
