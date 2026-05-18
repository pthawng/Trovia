import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth.service";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: String(search.token ?? ""),
    email: String(search.email ?? ""),
  }),
  component: VerifyEmailPage,
});

type State = "loading" | "success" | "error" | "idle";

function VerifyEmailPage() {
  const { token, email } = Route.useSearch();
  const navigate = useNavigate();
  const [state, setState] = useState<State>(token && email ? "loading" : "idle");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setState("idle");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await AuthService.verifyEmail(token, email);
        if (!cancelled) {
          setState("success");
          toast.success("Email xác minh thành công!");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => { cancelled = true; };
  }, [token, email]);

  const handleResend = async () => {
    setResending(true);
    try {
      await AuthService.resendVerification();
      toast.success("Đã gửi lại email xác minh!");
    } catch {
      toast.error("Không thể gửi lại. Vui lòng thử lại sau.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Xác minh email"
      subtitle="Kiểm tra hộp thư của bạn để hoàn tất đăng ký Trovia."
    >
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác minh email…</p>
        </div>
      )}

      {state === "success" && (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="font-semibold text-foreground">Email đã được xác minh! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">
              Bạn có thể đăng nhập và bắt đầu sử dụng Trovia.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate({ to: "/login" })}
          >
            Đăng nhập ngay
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <p className="font-semibold text-foreground">Xác minh thất bại</p>
            <p className="text-sm text-muted-foreground mt-1">
              Liên kết không hợp lệ hoặc đã hết hạn (24 giờ).
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang gửi…</>
            ) : (
              <><Mail className="h-4 w-4 mr-2" /> Gửi lại email xác minh</>
            )}
          </Button>
        </div>
      )}

      {state === "idle" && (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="font-semibold text-foreground">Kiểm tra hộp thư</p>
            <p className="text-sm text-muted-foreground mt-1">
              Chúng tôi đã gửi email xác minh khi bạn đăng ký.
              Kiểm tra hộp thư (kể cả spam).
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang gửi…</>
            ) : (
              "Gửi lại email xác minh"
            )}
          </Button>
        </div>
      )}

      <div className="text-center mt-4">
        <Link to="/login" className="text-sm text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    </AuthLayout>
  );
}
