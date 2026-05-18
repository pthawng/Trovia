import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/services/auth.service";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: String(search.token ?? ""),
    email: String(search.email ?? ""),
  }),
  component: ResetPage,
});

function ResetPage() {
  const { token, email } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!token || !email) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token, password, email);
      setSuccess(true);
      toast.success("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => navigate({ to: "/login" }), 2500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Thành công!" subtitle="Mật khẩu của bạn đã được cập nhật.">
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-3 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
          <p className="text-sm text-muted-foreground">
            Đang chuyển hướng đến trang đăng nhập…
          </p>
          <Link to="/login" className="text-primary text-sm underline">
            Nhấn đây nếu không tự chuyển
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Chọn mật khẩu mới an toàn cho tài khoản Trovia của bạn."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">Mật khẩu mới</Label>
          <div className="relative">
            <Input
              id="pw"
              type={showPassword ? "text" : "password"}
              className="h-11 pr-10"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-pw">Xác nhận mật khẩu</Label>
          <Input
            id="confirm-pw"
            type="password"
            className="h-11"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Strength hint */}
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= level * 2
                      ? level <= 2
                        ? "bg-red-400"
                        : level === 3
                        ? "bg-yellow-400"
                        : "bg-green-400"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {password.length < 8
                ? "Quá ngắn"
                : password.length < 12
                ? "Đủ dùng"
                : "Mật khẩu mạnh 💪"}
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? "Đang lưu…" : "Cập nhật mật khẩu"}
        </Button>
      </form>
    </AuthLayout>
  );
}
