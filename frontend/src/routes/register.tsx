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
import { useTranslation } from "react-i18next";

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

const getSchema = (t: any) => z.object({
  fullName: z.string().trim().min(2, t("validation.name_required")).max(80),
  email: z.string().email(t("validation.email_invalid")).max(255),
  password: z.string().min(8, t("validation.password_len")).max(72),
});

function RegisterPage() {
  const { t } = useTranslation();
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
    const schema = getSchema(t);
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(error.message || t("auth.register_error"));
    } else {
      toast.success(t("auth.register_success"));
      if (redirect) {
        window.location.href = redirect;
      } else {
        navigate({ to: "/app/explore" });
      }
    }
  };

  return (
    <AuthLayout
      title={t("auth.register_title")}
      subtitle={t("auth.register_desc")}
      footer={
        <>
          {t("auth.has_account")}{" "}
          <Link to="/login" search={{ redirect }} className="text-primary font-medium hover:underline">
            {t("auth.login_btn")}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <GoogleButton label={t("auth.register_google")} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> {t("common.or")} <div className="h-px flex-1 bg-border" />
        </div>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="name">{t("auth.full_name")}</Label>
          <Input
            id="name"
            className="h-11"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder={t("auth.full_name_placeholder")}
          />
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
          <Label htmlFor="password">{t("auth.password")}</Label>
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
          <p className="text-[11px] text-muted-foreground">{t("auth.password_hint")}</p>
        </div>
        <Button type="submit" disabled={loading} className="w-full h-11">
          {loading ? t("auth.registering") : t("auth.register_btn")}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          {t("auth.terms_agreement")}
        </p>
      </form>
    </AuthLayout>
  );
}
