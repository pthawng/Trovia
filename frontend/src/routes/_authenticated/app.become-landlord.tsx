import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ShieldCheck, CreditCard, Sparkles, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { LandlordService } from "@/services/landlord.service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/become-landlord")({ component: BecomeLandlord });

const steps = [
  { key: "identity", icon: ShieldCheck },
  { key: "payment", icon: CreditCard },
  { key: "done", icon: Sparkles },
] as const;

function BecomeLandlord() {
  const { t } = useTranslation();
  const { user, refreshProfile, landlordProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form states
  const [licenseNumber, setLicenseNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [identityCardFrontUrl, setIdentityCardFrontUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80");
  const [identityCardBackUrl, setIdentityCardBackUrl] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80");
  const [payeeName, setPayeeName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");

  // Sync user details on load
  useEffect(() => {
    if (user) {
      if (user.email && !businessEmail) setBusinessEmail(user.email);
      // Backend User uses user.phone or user.phoneNumber depending on DTO (User entity has phone)
      const userPhone = user.phone || (user as any).phoneNumber || "";
      if (userPhone && !businessPhone) setBusinessPhone(userPhone);
    }
  }, [user]);

  useEffect(() => {
    if (user?.roles.includes("LANDLORD") && landlordProfile?.status === "ACTIVE") {
      navigate({ to: "/app/landlord" as any });
    }
  }, [user, landlordProfile, navigate]);

  const progress = ((step + 1) / steps.length) * 100;

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber) {
      toast.error(t("dashboard.onboarding.errors.license_required"));
      return;
    }
    if (!businessAddress) {
      toast.error(t("dashboard.onboarding.errors.address_required"));
      return;
    }
    if (!businessEmail) {
      toast.error(t("dashboard.onboarding.errors.email_required"));
      return;
    }
    if (!businessPhone) {
      toast.error(t("dashboard.onboarding.errors.phone_required"));
      return;
    }

    setLoading(true);
    try {
      // Send complete, validated StartOnboardingDto to the NestJS backend
      await LandlordService.startOnboarding({
        businessName: companyName || "Individual Host",
        businessAddress,
        businessEmail,
        businessPhone,
        identityCardNumber: licenseNumber,
        identityCardFrontUrl,
        identityCardBackUrl,
      });
      
      toast.success(t("dashboard.onboarding.success.identity_verified"));
      setStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("dashboard.onboarding.errors.onboarding_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountNumber) {
      toast.error(t("dashboard.onboarding.errors.bank_account_required"));
      return;
    }

    setLoading(true);
    try {
      // Payment details are kept locally for demo simplicity as backend doesn't store cards
      toast.success(t("dashboard.onboarding.success.payment_configured"));
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("dashboard.onboarding.errors.payment_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async () => {
    setLoading(true);
    try {
      await LandlordService.activate();
      await refreshProfile();
      toast.success(t("dashboard.onboarding.success.landlord_activated"));
      navigate({ to: "/app/landlord" as any });
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("dashboard.onboarding.errors.activation_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="text-sm font-medium text-primary mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> {t("dashboard.onboarding.page.onboarding_banner")}
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{t("dashboard.onboarding.page.welcome_title")}</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          {t("dashboard.onboarding.page.welcome_subtitle")}
        </p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{t("dashboard.onboarding.page.step_progress", { current: step + 1, total: steps.length })}</span>
          <span>{t("dashboard.onboarding.page.percent_complete", { percent: Math.round(progress) })}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className={cn(
            "flex flex-col items-center text-center p-3 rounded-xl border-2 transition",
            i === step ? "border-primary bg-primary-soft" : i < step ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-surface-elevated"
          )}>
            <div className={cn(
              "h-10 w-10 rounded-xl grid place-items-center mb-2",
              i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
            </div>
            <div className="text-xs font-medium hidden sm:block">{t(`dashboard.onboarding.steps.${s.key}.title`)}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-surface-elevated ring-1 ring-border p-8 shadow-[var(--shadow-elegant)]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 16 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -16 }} 
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <form onSubmit={handleIdentitySubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{t("dashboard.onboarding.page.verify_identity_title")}</h2>
                  <p className="text-muted-foreground mt-1">{t("dashboard.onboarding.page.verify_identity_subtitle")}</p>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="id-license">{t("dashboard.onboarding.page.label_id_number")}</Label>
                    <Input 
                      id="id-license"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_id_number")} 
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="id-company">{t("dashboard.onboarding.page.label_company_name")}</Label>
                    <Input 
                      id="id-company"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_company_name")} 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="id-email">{t("dashboard.onboarding.page.label_business_email")}</Label>
                    <Input 
                      id="id-email"
                      type="email"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_business_email")} 
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="id-phone">{t("dashboard.onboarding.page.label_business_phone")}</Label>
                    <Input 
                      id="id-phone"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_business_phone")} 
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="id-address">{t("dashboard.onboarding.page.label_business_address")}</Label>
                    <Input 
                      id="id-address"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_business_address")} 
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="id-front">{t("dashboard.onboarding.page.label_id_front")}</Label>
                    <Input 
                      id="id-front"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_id_front")} 
                      value={identityCardFrontUrl}
                      onChange={(e) => setIdentityCardFrontUrl(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="id-back">{t("dashboard.onboarding.page.label_id_back")}</Label>
                    <Input 
                      id="id-back"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_id_back")} 
                      value={identityCardBackUrl}
                      onChange={(e) => setIdentityCardBackUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 gap-2 mt-4">
                  {loading ? t("dashboard.onboarding.page.verifying_loading") : t("dashboard.onboarding.page.verify_and_continue")} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{t("dashboard.onboarding.page.setup_payment_title")}</h2>
                  <p className="text-muted-foreground mt-1">{t("dashboard.onboarding.page.setup_payment_subtitle")}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="pay-name">{t("dashboard.onboarding.page.label_payee_name")}</Label>
                    <Input 
                      id="pay-name"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_payee_name")} 
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pay-bank">{t("dashboard.onboarding.page.label_bank_account")}</Label>
                    <Input 
                      id="pay-bank"
                      className="h-11" 
                      placeholder={t("dashboard.onboarding.page.placeholder_bank_account")} 
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 gap-2 mt-4">
                  {loading ? t("dashboard.onboarding.page.configuring_loading") : t("dashboard.onboarding.page.configure_and_continue")} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="text-center space-y-6 py-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground grid place-items-center mx-auto shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{t("dashboard.onboarding.page.ready_title")}</h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    {t("dashboard.onboarding.page.ready_desc")}
                  </p>
                </div>
                <Button onClick={handleActivation} disabled={loading} className="h-12 px-8">
                  {loading ? t("dashboard.onboarding.page.activating_loading") : t("dashboard.onboarding.page.enter_dashboard")}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
