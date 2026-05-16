import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ShieldCheck, Home, CreditCard, Sparkles, ArrowRight, Check, Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/become-landlord")({ component: BecomeLandlord });

const steps = [
  { key: "identity", title: "Identity verification", subtitle: "Confirm who you are", icon: ShieldCheck },
  { key: "property", title: "Add first property", subtitle: "Tell us what you'll list", icon: Home },
  { key: "payment", title: "Setup payments", subtitle: "How you'll get paid", icon: CreditCard },
  { key: "done", title: "Activate landlord mode", subtitle: "You're ready", icon: Sparkles },
] as const;

function BecomeLandlord() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("landlord_onboarding").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      if (data.activated) navigate({ to: "/app/landlord" });
      else if (data.payment_setup) setStep(3);
      else if (data.first_property_added) setStep(2);
      else if (data.identity_verified) setStep(1);
    });
  }, [user, navigate]);

  const progress = ((step + 1) / steps.length) * 100;

  const advance = async (patch: Record<string, boolean>) => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("landlord_onboarding")
      .upsert({ user_id: user.id, ...patch, updated_at: new Date().toISOString() });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setStep((s) => s + 1);
  };

  const finish = async () => {
    if (!user) return;
    setLoading(true);
    await supabase.from("landlord_onboarding").upsert({ user_id: user.id, activated: true, updated_at: new Date().toISOString() });
    await supabase.from("user_roles").insert({ user_id: user.id, role: "landlord" });
    setLoading(false);
    toast.success("Landlord mode activated");
    navigate({ to: "/app/landlord" });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="text-sm font-medium text-primary mb-2 flex items-center justify-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Landlord onboarding</div>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Welcome to the host side of Trovia.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">A few short steps and you'll be ready to list your first property and start hosting.</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Step {step + 1} of {steps.length}</span><span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <div key={s.key} className={cn("flex flex-col items-center text-center p-3 rounded-xl border-2 transition",
            i === step ? "border-primary bg-primary-soft" : i < step ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-surface-elevated")}>
            <div className={cn("h-10 w-10 rounded-xl grid place-items-center mb-2",
              i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground")}>
              {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
            </div>
            <div className="text-xs font-medium hidden sm:block">{s.title}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-surface-elevated ring-1 ring-border p-8 shadow-[var(--shadow-elegant)]">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Verify your identity</h2>
                  <p className="text-muted-foreground mt-1">A quick check keeps Trovia trustworthy for both sides.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button className="rounded-2xl border-2 border-dashed border-border p-8 hover:border-primary hover:bg-primary-soft/40 transition flex flex-col items-center text-center">
                    <Upload className="h-6 w-6 text-primary mb-3" />
                    <div className="text-sm font-medium">Upload ID document</div>
                    <div className="text-xs text-muted-foreground mt-1">Passport, driver's license, or national ID</div>
                  </button>
                  <button className="rounded-2xl border-2 border-dashed border-border p-8 hover:border-primary hover:bg-primary-soft/40 transition flex flex-col items-center text-center">
                    <Camera className="h-6 w-6 text-primary mb-3" />
                    <div className="text-sm font-medium">Take a selfie</div>
                    <div className="text-xs text-muted-foreground mt-1">We'll match it with your ID</div>
                  </button>
                </div>
                <Button onClick={() => advance({ identity_verified: true })} disabled={loading} className="w-full h-12 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Add your first property</h2>
                  <p className="text-muted-foreground mt-1">You can refine and add photos later.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><Label>Property title</Label><Input className="h-11" placeholder="Sunlit studio near campus" /></div>
                  <div className="space-y-1.5"><Label>City</Label><Input className="h-11" placeholder="Ho Chi Minh" /></div>
                  <div className="space-y-1.5"><Label>Monthly rent (USD)</Label><Input type="number" className="h-11" placeholder="420" /></div>
                  <div className="space-y-1.5"><Label>Type</Label><Input className="h-11" placeholder="Studio / Apartment / Room" /></div>
                </div>
                <div className="space-y-1.5"><Label>Short description</Label><Textarea rows={4} placeholder="What makes this place special?" /></div>
                <Button onClick={() => advance({ first_property_added: true })} disabled={loading} className="w-full h-12 gap-2">
                  Save and continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Setup payments</h2>
                  <p className="text-muted-foreground mt-1">Choose where you'd like rent transferred.</p>
                </div>
                <div className="space-y-3">
                  {["Bank transfer", "Stripe Connect", "PayPal"].map((m, i) => (
                    <label key={m} className="flex items-center gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary">
                      <input type="radio" name="pay" defaultChecked={i === 0} className="accent-primary" />
                      <div className="flex-1"><div className="font-medium text-sm">{m}</div><div className="text-xs text-muted-foreground">Instant deposit · No fees during launch</div></div>
                    </label>
                  ))}
                </div>
                <Button onClick={() => advance({ payment_setup: true })} disabled={loading} className="w-full h-12 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            {step === 3 && (
              <div className="text-center space-y-6 py-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground grid place-items-center mx-auto shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">You're all set</h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">Activate landlord mode to access your dashboard, manage tenants, and track revenue.</p>
                </div>
                <Button onClick={finish} disabled={loading} className="h-12 px-8">
                  {loading ? "Activating…" : "Enter landlord dashboard"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
