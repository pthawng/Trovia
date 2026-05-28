import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      toast.error(t("validation.password_len"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("validation.confirm_password_match"));
      return;
    }

    if (!token || !email) {
      toast.error(t("auth.invalid_reset_link"));
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token, password, email);
      setSuccess(true);
      toast.success(t("auth.reset_password_success_toast"));
      setTimeout(() => navigate({ to: "/login" }), 2500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("auth.reset_password_link_expired");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title={t("common.success")} subtitle={t("auth.password_updated_desc")}>
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-3 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {t("auth.redirecting_to_login")}
          </p>
          <Link to="/login" className="text-primary text-sm underline">
            {t("auth.click_here_if_no_redirect")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("auth.reset_password_title")}
      subtitle={t("auth.reset_password_subtitle")}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pw">{t("auth.new_password")}</Label>
          <div className="relative">
            <Input
              id="pw"
              type={showPassword ? "text" : "password"}
              className="h-11 pr-10"
              placeholder={t("auth.password_hint")}
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
          <Label htmlFor="confirm-pw">{t("auth.confirm_password")}</Label>
          <Input
            id="confirm-pw"
            type="password"
            className="h-11"
            placeholder={t("auth.confirm_password_placeholder")}
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
                ? t("auth.pw_strength_short")
                : password.length < 12
                ? t("auth.pw_strength_fair")
                : t("auth.pw_strength_strong")}
            </p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? t("auth.saving") : t("auth.update_password_btn")}
        </Button>
      </form>
    </AuthLayout>
  );
}
