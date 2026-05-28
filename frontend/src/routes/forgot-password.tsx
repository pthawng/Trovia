import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/services/auth.service";
import { Mail, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPage });

function ForgotPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
      // Always show success — backend never reveals if email exists
      setSent(true);
    } catch {
      // Even on error, show generic success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.forgot_password_title")}
      subtitle={t("auth.forgot_password_subtitle")}
      footer={
        <>
          {t("auth.remember_password")}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("auth.login_btn")}
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            <p className="text-sm font-medium">{t("auth.instructions_sent")}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("auth.forgot_email_sent_info", { email })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("auth.no_email_received")}
            <button
              onClick={() => { setSent(false); }}
              className="text-primary underline"
            >
              {t("auth.try_again_lowercase")}
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                className="h-11 pl-10"
                placeholder={t("auth.email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? t("auth.sending") : t("auth.send_recovery_email")}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
