import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { refreshProfile, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!loading) {
      if (user) {
        toast.success("Đăng nhập bằng Google thành công!");
        if (user.roles?.includes("LANDLORD")) {
          navigate({ to: "/app/landlord", search: { view: "overview" } });
        } else {
          navigate({ to: "/app/explore" });
        }
      } else {
        toast.error("Xác thực Google thất bại. Vui lòng đăng nhập lại.");
        navigate({ to: "/login" });
      }
    }
  }, [loading, user, navigate]);

  return (
    <AuthLayout
      title="Đang xác thực tài khoản"
      subtitle="Đang xử lý đăng nhập Google. Vui lòng đợi trong giây lát..."
    >
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang lấy thông tin hồ sơ của bạn...</p>
      </div>
    </AuthLayout>
  );
}
