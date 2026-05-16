import { createFileRoute } from "@tanstack/react-router";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/app/requests")({ component: Requests });

const requests = [
  { id: "r1", property: "Sunlit studio near campus", landlord: "Trang Bui", date: "Move-in Aug 1", status: "pending" as const },
  { id: "r2", property: "Modern 1BR with balcony", landlord: "Hoa Pham", date: "Move-in Sep 15", status: "approved" as const },
  { id: "r3", property: "Boarding room with garden", landlord: "Minh Tran", date: "Move-in Jul 20", status: "declined" as const },
];

const badges = {
  pending: { icon: Clock, label: "Pending review", className: "text-amber-700 bg-amber-50" },
  approved: { icon: CheckCircle2, label: "Approved", className: "text-emerald-700 bg-emerald-50" },
  declined: { icon: XCircle, label: "Declined", className: "text-rose-700 bg-rose-50" },
};

function Requests() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Rental requests</h1>
        <p className="text-muted-foreground mt-1">Track every place you've applied to in one calm view.</p>
      </div>
      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border overflow-hidden">
        {requests.map((r, i) => {
          const b = badges[r.status];
          return (
            <div key={r.id} className={`flex items-center gap-4 p-5 ${i !== requests.length - 1 && "border-b border-border"}`}>
              <div className="h-12 w-12 rounded-xl bg-secondary grid place-items-center font-semibold text-sm">{r.landlord.split(" ").map((s) => s[0]).join("")}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{r.property}</div>
                <div className="text-sm text-muted-foreground">{r.landlord} · {r.date}</div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${b.className}`}>
                <b.icon className="h-3 w-3" /> {b.label}
              </span>
              <Button variant="outline" size="sm">View</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
