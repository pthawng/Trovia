import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          toast.success(t("auth.email_verified_success_toast"));
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => { cancelled = true; };
  }, [token, email, t]);

  const handleResend = async () => {
    setResending(true);
    try {
      await AuthService.resendVerification();
      toast.success(t("auth.resend_verify_email_success_toast"));
    } catch {
      toast.error(t("auth.resend_verify_email_error_toast"));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.verify_email_title")}
      subtitle={t("auth.verify_email_subtitle")}
    >
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("auth.verifying_email")}</p>
        </div>
      )}

      {state === "success" && (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <p className="font-semibold text-foreground">{t("auth.email_verified_title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.email_verified_desc")}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate({ to: "/login" })}
          >
            {t("auth.login_now_btn")}
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <p className="font-semibold text-foreground">{t("auth.verify_email_failed_title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.verify_email_failed_desc")}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("auth.sending")}</>
            ) : (
              <><Mail className="h-4 w-4 mr-2" /> {t("auth.resend_verify_email_btn")}</>
            )}
          </Button>
        </div>
      )}

      {state === "idle" && (
        <div className="rounded-2xl border border-border bg-secondary/50 p-6 space-y-4 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="font-semibold text-foreground">{t("auth.check_inbox_title")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("auth.check_inbox_desc")}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            disabled={resending}
            onClick={handleResend}
          >
            {resending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("auth.sending")}</>
            ) : (
              t("auth.resend_verify_email_btn")
            )}
          </Button>
        </div>
      )}

      <div className="text-center mt-4">
        <Link to="/login" className="text-sm text-primary hover:underline">
          {t("auth.back_to_login")}
        </Link>
      </div>
    </AuthLayout>
  );
}
