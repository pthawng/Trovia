import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/SocialButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: async ({ search }) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token) {
      throw redirect({ to: search.redirect || "/app/explore" });
    }
  },
  component: LoginPage,
});

const getSchema = (t: any) => z.object({
  email: z.string().email(t("validation.email_invalid")).max(255),
  password: z.string().min(6, t("validation.password_min", { count: 6 })).max(72),
});

function LoginPage() {
  const { t } = useTranslation();
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (redirect) {
        window.location.href = redirect;
      } else if (user.roles?.includes("LANDLORD")) {
        navigate({ to: "/app/landlord", search: { view: "overview" } });
      } else {
        navigate({ to: "/app/explore" });
      }
    }
  }, [user, loading, navigate, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = getSchema(t);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoginLoading(true);
    const { error, user: loggedInUser } = await signIn(email, password);
    setLoginLoading(false);
    if (error) {
      toast.error(error.message || t("auth.invalid_credentials"));
    } else {
      toast.success(t("auth.login_success"));
      if (redirect) {
        window.location.href = redirect;
      } else if (loggedInUser?.roles?.includes("LANDLORD")) {
        navigate({ to: "/app/landlord", search: { view: "overview" } });
      } else {
        navigate({ to: "/app/explore" });
      }
    }
  };

  return (
    <AuthLayout
      title={t("auth.login_welcome")}
      subtitle={t("auth.login_desc")}
      footer={
        <>
          {t("auth.no_account")}{" "}
          <Link to="/register" search={{ redirect }} className="text-primary font-medium hover:underline">
            {t("auth.register_now")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <GoogleButton label={t("auth.google_login")} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> {t("common.or")} <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
             id="email"
             type="email"
             autoComplete="email"
             className="h-11"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
             placeholder={t("auth.email_placeholder")}
          />
        </div>
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              {t("auth.forgot_password")}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
        </div>
        <Button type="submit" disabled={loginLoading} className="w-full h-11">
          {loginLoading ? t("auth.logging_in") : t("auth.login_btn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
