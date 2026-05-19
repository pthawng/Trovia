import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/register")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      throw redirect({ to: search.redirect || "/app/explore" });
    }
  },
  component: RegisterPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập đầy đủ họ và tên").max(80),
  email: z.string().email("Vui lòng nhập email hợp lệ").max(255),
  password: z.string().min(8, "Mật khẩu phải chứa ít nhất 8 ký tự").max(72),
});

function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message || "Không thể đăng ký tài khoản. Vui lòng thử lại.");
    } else {
      toast.success("Chào mừng bạn gia nhập Trovia!");
      if (redirect) {
        window.location.href = redirect;
      } else {
        navigate({ to: "/app/explore" });
      }
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Tham gia cộng đồng kết nối phòng trọ & căn hộ thông minh hàng đầu."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" search={{ redirect }} className="text-primary font-medium hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <GoogleButton label="Đăng ký với Google" />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> HOẶC <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            className="h-11"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Nguyen Van A"
          />
        </div>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nhap.email@example.com"
          />
        </div>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="h-11 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Mật khẩu tối thiểu 8 ký tự.</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </p>
      </form>
    </AuthLayout>
  );
}
