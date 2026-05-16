import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/profile")({ component: Profile });

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", city: "", occupation: "", bio: "" });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({
        full_name: data.full_name ?? "", phone: data.phone ?? "",
        city: data.city ?? "", occupation: data.occupation ?? "", bio: data.bio ?? "",
      });
    });
  }, [user]);

  const onSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...form, updated_at: new Date().toISOString() });
    setLoading(false);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  const initials = (form.full_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-muted-foreground mt-1">Landlords see this when you apply for a place.</p>
      </div>

      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-primary-foreground font-semibold text-lg">{initials}</div>
        <div>
          <div className="font-semibold text-lg">{form.full_name || "Add your name"}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5"><Label>Full name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="h-11" /></div>
          <div className="space-y-1.5"><Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11" /></div>
          <div className="space-y-1.5"><Label>City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-11" /></div>
          <div className="space-y-1.5"><Label>Occupation</Label>
            <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="h-11" placeholder="e.g. Design student" /></div>
        </div>
        <div className="space-y-1.5"><Label>About you</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} placeholder="A short intro for landlords." /></div>
        <Button onClick={onSave} disabled={loading} className="h-11">{loading ? "Saving…" : "Save changes"}</Button>
      </div>
    </div>
  );
}
