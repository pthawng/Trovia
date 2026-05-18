import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { UserService } from "@/services/user.service";

export const Route = createFileRoute("/_authenticated/app/profile")({ component: Profile });

function Profile() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", city: "" });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        city: user.city ?? "",
      });
    }
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await UserService.updateProfile({
        fullName: form.fullName,
        phone: form.phone,
        city: form.city,
      });
      await refreshProfile();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const initials = (form.fullName || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground mt-1">Landlords see this when you apply for a place.</p>
      </div>

      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-primary-foreground font-semibold text-lg">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-lg">{form.fullName || "Add your name"}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input 
              value={form.fullName} 
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
              className="h-11" 
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              className="h-11" 
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input 
              value={form.city} 
              onChange={(e) => setForm({ ...form, city: e.target.value })} 
              className="h-11" 
            />
          </div>
        </div>
        
        <Button onClick={onSave} disabled={loading} className="h-11">
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
