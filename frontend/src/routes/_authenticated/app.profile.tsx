import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { UserService } from "@/services/user.service";
import { LandlordService, type LandlordProfile } from "@/services/landlord.service";
import { PropertyService } from "@/services/property.service";
import { 
  User as UserIcon, 
  Home, 
  Building, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Clock, 
  Key, 
  Trash2, 
  Settings, 
  Sparkles,
  Info,
  ArrowUpRight,
  Bell,
  Mail,
  FileText,
  CreditCard,
  Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_authenticated/app/profile")({ component: Profile });

type ProfileTab = "personal" | "rental" | "landlord" | "security" | "notifications";

function Profile() {
  const { t } = useTranslation();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [fetchingLandlord, setFetchingLandlord] = useState(false);
  const [landlordProfile, setLandlordProfile] = useState<LandlordProfile | null>(null);
  const [propertyCount, setPropertyCount] = useState<number>(0);
  
  // Use React Query for loading & synchronizing profile
  const { data: me, isLoading: meLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserService.getProfile(),
  });

  // Email Preferences State
  const [emailPrefs, setEmailPrefs] = useState({
    authEmailsEnabled: true,
    rentalEmailsEnabled: true,
    contractEmailsEnabled: true,
    paymentEmailsEnabled: true,
    maintenanceEmailsEnabled: true,
    marketingEmailsEnabled: true,
  });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  useEffect(() => {
    if (activeTab === "notifications") {
      setPrefsLoading(true);
      UserService.getEmailPreferences()
        .then((prefs) => {
          setEmailPrefs({
            authEmailsEnabled: prefs.authEmailsEnabled ?? true,
            rentalEmailsEnabled: prefs.rentalEmailsEnabled ?? true,
            contractEmailsEnabled: prefs.contractEmailsEnabled ?? true,
            paymentEmailsEnabled: prefs.paymentEmailsEnabled ?? true,
            maintenanceEmailsEnabled: prefs.maintenanceEmailsEnabled ?? true,
            marketingEmailsEnabled: prefs.marketingEmailsEnabled ?? true,
          });
        })
        .catch(() => {
          toast.error(t("profile.toasts.notifications_load_error"));
        })
        .finally(() => setPrefsLoading(false));
    }
  }, [activeTab]);

  const savePrefs = async () => {
    setPrefsSaving(true);
    try {
      await UserService.updateEmailPreferences(emailPrefs);
      toast.success(t("profile.toasts.notifications_save_success"));
    } catch {
      toast.error(t("profile.toasts.notifications_save_error"));
    } finally {
      setPrefsSaving(false);
    }
  };

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    avatarUrl: "",
    dateOfBirth: "",
    occupation: "",
    renterType: "",
    preferredDistrict: "",
    budgetMin: "" as string | number,
    budgetMax: "" as string | number,
    expectedMoveInDate: "",
    bio: "",
  });

  const [initialForm, setInitialForm] = useState({ ...form });
  const [isDirty, setIsDirty] = useState(false);

  // Sync profile details
  useEffect(() => {
    if (me) {
      const formattedDob = me.dateOfBirth 
        ? new Date(me.dateOfBirth).toISOString().split('T')[0] 
        : "";
      const formattedExpectedDate = me.expectedMoveInDate
        ? new Date(me.expectedMoveInDate).toISOString().split('T')[0]
        : "";

      const updatedForm = {
        fullName: me.fullName ?? "",
        phone: me.phone ?? "",
        city: me.city ?? "",
        avatarUrl: me.avatarUrl ?? "",
        dateOfBirth: formattedDob,
        occupation: me.occupation ?? "",
        renterType: me.renterType ?? "",
        preferredDistrict: me.preferredDistrict ?? "",
        budgetMin: me.budgetMin ?? "",
        budgetMax: me.budgetMax ?? "",
        expectedMoveInDate: formattedExpectedDate,
        bio: me.bio ?? "",
      };

      setForm(updatedForm);
      setInitialForm(updatedForm);
      setIsDirty(false);
    }
  }, [me]);

  // Track dirty state
  useEffect(() => {
    const changed = JSON.stringify(form) !== JSON.stringify(initialForm);
    setIsDirty(changed);
  }, [form, initialForm]);

  // Fetch landlord details if user has LANDLORD role badge
  const isLandlord = me?.roles?.includes("LANDLORD");
  
  useEffect(() => {
    if (isLandlord && me) {
      setFetchingLandlord(true);
      LandlordService.getMe()
        .then((profile) => {
          setLandlordProfile(profile);
          PropertyService.findMyProperties().then((props: any) => {
            setPropertyCount(props.length);
          }).catch(() => {});
        })
        .catch(() => {})
        .finally(() => setFetchingLandlord(false));
    }
  }, [isLandlord, me]);

  // React Query Mutation for profile updating
  const updateProfileMutation = useMutation({
    mutationFn: (dto: any) => UserService.updateProfile(dto),
    onSuccess: async () => {
      toast.success(t("profile.toasts.personal_update_success"));
      await refetch();
      await refreshProfile();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t("profile.toasts.personal_update_error"));
    }
  });

  const onSave = async () => {
    if (!me) return;
    
    // Parse numbers safely
    const parsedMin = form.budgetMin !== "" ? Number(form.budgetMin) : null;
    const parsedMax = form.budgetMax !== "" ? Number(form.budgetMax) : null;

    updateProfileMutation.mutate({
      fullName: form.fullName,
      phone: form.phone,
      city: form.city,
      avatarUrl: form.avatarUrl,
      occupation: form.occupation,
      dateOfBirth: form.dateOfBirth || null,
      bio: form.bio,
      renterType: form.renterType || null,
      preferredDistrict: form.preferredDistrict,
      budgetMin: parsedMin,
      budgetMax: parsedMax,
      expectedMoveInDate: form.expectedMoveInDate || null,
    });
  };

  const onReset = () => {
    setForm(initialForm);
    toast.info(t("profile.toasts.personal_restore_info"));
  };

  const initials = (form.fullName || me?.email || "U").slice(0, 2).toUpperCase();

  // Loading Skeleton State
  if (meLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6 animate-pulse text-left">
        <div className="h-44 bg-surface-elevated rounded-3xl border border-border" />
        <div className="h-96 bg-surface-elevated rounded-3xl border border-border" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground">
        {t("profile.no_profile_found")}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 text-left">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-elevated border border-border p-6 sm:p-8 shadow-xl shadow-black/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary/10 to-transparent rounded-full filter blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {form.avatarUrl ? (
              <img 
                src={form.avatarUrl} 
                alt={form.fullName}
                className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-4 ring-primary/20"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${initials}`;
                }}
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-primary to-[oklch(0.65_0.18_290)] grid place-items-center text-primary-foreground font-bold text-2xl shadow-lg ring-4 ring-primary/20">
                {initials}
              </div>
            )}
            {me.isEmailVerified && (
              <span className="absolute -bottom-2 -right-2 bg-success text-success-foreground p-1.5 rounded-xl border-2 border-surface-elevated shadow-md" title={t("profile.email_verified")}>
                <CheckCircle2 className="h-4.5 w-4.5" />
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{form.fullName || t("profile.user_placeholder")}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
                  {t("profile.tenant_badge", { defaultValue: "Tenant (Người thuê)" })}
                </span>
                {isLandlord && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    {t("profile.landlord_badge", { defaultValue: "Landlord (Chủ nhà)" })}
                  </span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground text-sm flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>{me.email}</span>
              {form.phone && <span className="text-border">|</span>}
              {form.phone && <span>{form.phone}</span>}
              {form.city && <span className="text-border">|</span>}
              {form.city && <span>{form.city}</span>}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="text-muted-foreground">{t("profile.verification_status_label")}</span>
              {me.isEmailVerified ? (
                <span className="text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("profile.email_verified")}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {t("profile.email_unverified")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center overflow-x-auto gap-2 mt-8 border-t border-border pt-6 scrollbar-none">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "personal"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-102"
                : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <UserIcon className="h-4 w-4" />
            {t("profile.tabs.personal")}
          </button>

          <button
            onClick={() => setActiveTab("rental")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "rental"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-102"
                : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <Home className="h-4 w-4" />
            {t("profile.tabs.rental")}
          </button>

          {isLandlord && (
            <button
              onClick={() => setActiveTab("landlord")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === "landlord"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-102"
                  : "text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <Building className="h-4 w-4" />
              {t("profile.tabs.landlord")}
            </button>
          )}

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-102"
                : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <Shield className="h-4 w-4" />
            {t("profile.tabs.security")}
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "notifications"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-102"
                : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            <Bell className="h-4 w-4" />
            {t("profile.tabs.notifications")}
          </button>
        </div>
      </div>

      {/* Settings / Form container */}
      <div className="bg-surface-elevated border border-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5">
        <AnimatePresence mode="wait">
          {activeTab === "personal" && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("profile.personal.title")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("profile.personal.subtitle")}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label>{t("profile.personal.fullname_label")}</Label>
                  <Input 
                    value={form.fullName} 
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                    className="h-11 pl-4"
                    placeholder={t("profile.personal.fullname_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("profile.personal.phone_label")}</Label>
                  <Input 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    className="h-11"
                    placeholder={t("profile.personal.phone_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("profile.personal.city_label")}</Label>
                  <Input 
                    value={form.city} 
                    onChange={(e) => setForm({ ...form, city: e.target.value })} 
                    className="h-11"
                    placeholder={t("profile.personal.city_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("profile.personal.dob_label")}</Label>
                  <Input 
                    type="date"
                    value={form.dateOfBirth} 
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} 
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("profile.personal.occupation_label")}</Label>
                  <Input 
                    value={form.occupation} 
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })} 
                    className="h-11"
                    placeholder={t("profile.personal.occupation_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("profile.personal.avatar_label")}</Label>
                  <Input 
                    value={form.avatarUrl} 
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} 
                    className="h-11"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "rental" && (
            <motion.div
              key="rental"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t("profile.rental.title")}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t("profile.rental.subtitle")}</p>
                </div>
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-muted-foreground" /> {t("profile.rental.renter_type_label")}
                  </Label>
                  <select 
                    value={form.renterType} 
                    onChange={(e) => setForm({ ...form, renterType: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">{t("profile.rental.renter_type_select")}</option>
                    <option value="STUDENT">{t("profile.rental.types.STUDENT")}</option>
                    <option value="OFFICE_WORKER">{t("profile.rental.types.OFFICE_WORKER")}</option>
                    <option value="FREELANCER">{t("profile.rental.types.FREELANCER")}</option>
                    <option value="FAMILY">{t("profile.rental.types.FAMILY")}</option>
                    <option value="OTHER">{t("profile.rental.types.OTHER")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" /> {t("profile.rental.district_label")}
                  </Label>
                  <Input 
                    value={form.preferredDistrict} 
                    onChange={(e) => setForm({ ...form, preferredDistrict: e.target.value })} 
                    className="h-11"
                    placeholder={t("profile.rental.district_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" /> {t("profile.rental.budget_min_label")}
                  </Label>
                  <Input 
                    type="number"
                    value={form.budgetMin} 
                    onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} 
                    className="h-11"
                    placeholder={t("profile.rental.budget_min_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-muted-foreground" /> {t("profile.rental.budget_max_label")}
                  </Label>
                  <Input 
                    type="number"
                    value={form.budgetMax} 
                    onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} 
                    className="h-11"
                    placeholder={t("profile.rental.budget_max_placeholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" /> {t("profile.rental.move_in_label")}
                  </Label>
                  <Input 
                    type="date"
                    value={form.expectedMoveInDate} 
                    onChange={(e) => setForm({ ...form, expectedMoveInDate: e.target.value })} 
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("profile.rental.bio_label")}</Label>
                <textarea 
                  value={form.bio} 
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                  className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t("profile.rental.bio_placeholder")}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "landlord" && isLandlord && (
            <motion.div
              key="landlord"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("profile.landlord.title")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("profile.landlord.subtitle")}</p>
              </div>

              {fetchingLandlord ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 bg-muted/40 rounded-xl" />
                  <div className="h-10 bg-muted/40 rounded-xl" />
                </div>
              ) : landlordProfile ? (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-1">
                      <span className="text-xs text-muted-foreground">{t("profile.landlord.business_name_label")}</span>
                      <div className="font-semibold text-foreground">{landlordProfile.businessName || t("profile.landlord.none")}</div>
                    </div>
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-1">
                      <span className="text-xs text-muted-foreground">{t("profile.landlord.public_name_label")}</span>
                      <div className="font-semibold text-foreground">{landlordProfile.publicName || t("profile.landlord.none")}</div>
                    </div>
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-1">
                      <span className="text-xs text-muted-foreground">{t("profile.landlord.managed_count")}</span>
                      <div className="font-semibold text-foreground">{t("profile.landlord.property_count", { count: propertyCount })}</div>
                    </div>
                    <div className="p-4 bg-muted/20 border border-border rounded-2xl space-y-1">
                      <span className="text-xs text-muted-foreground">{t("profile.landlord.status_label")}</span>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          landlordProfile.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                        }`} />
                        {landlordProfile.status === "ACTIVE" ? t("profile.landlord.status_active") : t("profile.landlord.status_pending", { status: landlordProfile.status })}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="font-semibold text-foreground text-sm">{t("profile.landlord.settings_section_title")}</div>
                      <div>{t("profile.landlord.settings_section_desc")}</div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => navigate({ to: "/app/landlord", search: { view: "settings" } })}
                    className="flex items-center gap-2 h-11 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
                  >
                    <Settings className="h-4 w-4" />
                    {t("profile.landlord.open_settings_btn")}
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  {t("profile.landlord.no_profile")}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("profile.security.title")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("profile.security.subtitle")}</p>
              </div>

              {/* Password update simulated */}
              <div className="p-5 border border-border rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Key className="h-4 w-4 text-primary" /> {t("profile.security.change_password_title")}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("profile.security.current_password_label")}</Label>
                    <Input type="password" placeholder="••••••••" className="h-11" disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("profile.security.new_password_label")}</Label>
                    <Input type="password" placeholder="••••••••" className="h-11" disabled />
                  </div>
                </div>
                <Button variant="outline" disabled className="h-10 text-xs rounded-xl">{t("profile.security.update_password_btn")}</Button>
              </div>

              {/* Active Sessions */}
              <div className="p-5 border border-border rounded-2xl space-y-3">
                <div className="text-foreground font-semibold text-sm">{t("profile.security.active_sessions_title")}</div>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <div className="flex justify-between items-center p-3 bg-muted/20 border border-border rounded-xl">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">{t("profile.security.this_device")}</div>
                      <div>{t("profile.security.this_device_desc")}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-success/10 text-success rounded-lg font-medium">{t("profile.security.current_badge")}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/20 border border-border rounded-xl opacity-75">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">{t("profile.security.other_device")}</div>
                      <div>{t("profile.security.other_device_desc")}</div>
                    </div>
                    <Button variant="ghost" disabled size="sm" className="h-8 text-xs hover:text-destructive">{t("profile.security.logout_btn")}</Button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-5 border border-destructive/20 bg-destructive/5 rounded-2xl space-y-3">
                <div className="text-destructive font-bold text-sm flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> {t("profile.security.danger_zone_title")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("profile.security.danger_zone_desc")}
                </p>
                <Button variant="destructive" disabled className="h-10 text-xs rounded-xl">
                  {t("profile.security.delete_account_btn")}
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("profile.notifications.title")}</h2>
                <p className="text-sm text-muted-foreground mt-1">{t("profile.notifications.subtitle")}</p>
              </div>

              {prefsLoading ? (
                <div className="space-y-3 py-6 animate-pulse">
                  <div className="h-14 bg-muted/40 rounded-2xl" />
                  <div className="h-14 bg-muted/40 rounded-2xl" />
                  <div className="h-14 bg-muted/40 rounded-2xl" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preferences Checklist */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Item 1: Auth */}
                    <div className="flex items-start justify-between p-5 border border-border bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground">{t("profile.notifications.types.auth_title")}</div>
                          <div className="text-xs text-muted-foreground">{t("profile.notifications.types.auth_desc")}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.authEmailsEnabled}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, authEmailsEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0 mt-1"
                      />
                    </div>

                    {/* Item 2: Rentals */}
                    <div className="flex items-start justify-between p-5 border border-border bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                          <Home className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground">{t("profile.notifications.types.rental_title")}</div>
                          <div className="text-xs text-muted-foreground">{t("profile.notifications.types.rental_desc")}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.rentalEmailsEnabled}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, rentalEmailsEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0 mt-1"
                      />
                    </div>

                    {/* Item 3: Contracts */}
                    <div className="flex items-start justify-between p-5 border border-border bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground">{t("profile.notifications.types.contract_title")}</div>
                          <div className="text-xs text-muted-foreground">{t("profile.notifications.types.contract_desc")}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.contractEmailsEnabled}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, contractEmailsEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0 mt-1"
                      />
                    </div>

                    {/* Item 4: Payments */}
                    <div className="flex items-start justify-between p-5 border border-border bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground">{t("profile.notifications.types.payment_title")}</div>
                          <div className="text-xs text-muted-foreground">{t("profile.notifications.types.payment_desc")}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.paymentEmailsEnabled}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, paymentEmailsEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0 mt-1"
                      />
                    </div>

                    {/* Item 5: Maintenance */}
                    <div className="flex items-start justify-between p-5 border border-border bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground">{t("profile.notifications.types.maintenance_title")}</div>
                          <div className="text-xs text-muted-foreground">{t("profile.notifications.types.maintenance_desc")}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.maintenanceEmailsEnabled}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, maintenanceEmailsEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0 mt-1"
                      />
                    </div>

                    {/* Item 6: Marketing */}
                    <div className="flex items-start justify-between p-5 border border-border bg-secondary/10 rounded-2xl hover:bg-secondary/20 transition-all">
                      <div className="flex gap-3.5 items-start">
                        <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 shrink-0">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="font-semibold text-sm text-foreground">{t("profile.notifications.types.marketing_title")}</div>
                          <div className="text-xs text-muted-foreground">{t("profile.notifications.types.marketing_desc")}</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailPrefs.marketingEmailsEnabled}
                        onChange={(e) => setEmailPrefs({ ...emailPrefs, marketingEmailsEnabled: e.target.checked })}
                        className="h-5 w-5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0 mt-1"
                      />
                    </div>
                  </div>

                  {/* Save button inline for notification settings */}
                  <div className="flex justify-end mt-6 pt-4 border-t border-border">
                    <Button
                      onClick={savePrefs}
                      disabled={prefsSaving}
                      className="h-11 px-8 rounded-xl font-medium shadow-lg shadow-primary/20"
                    >
                      {prefsSaving ? t("profile.notifications.saving_btn") : t("profile.notifications.save_btn")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer actions with dirty and saving states */}
        {activeTab !== "landlord" && activeTab !== "security" && activeTab !== "notifications" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 border-t border-border pt-6">
            <div>
              {isDirty ? (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  {t("profile.footer.dirty_message")}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {t("profile.footer.synced_message")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isDirty && (
                <Button 
                  variant="ghost" 
                  onClick={onReset} 
                  disabled={updateProfileMutation.isPending} 
                  className="h-11 flex-1 sm:flex-none rounded-xl"
                >
                  {t("profile.footer.cancel_btn")}
                </Button>
              )}
              <Button 
                onClick={onSave} 
                disabled={updateProfileMutation.isPending || !isDirty} 
                className="h-11 flex-1 sm:flex-none px-6 font-medium shadow-lg shadow-primary/20 transition-all rounded-xl"
              >
                {updateProfileMutation.isPending ? t("profile.footer.saving_btn") : t("profile.footer.save_btn")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
