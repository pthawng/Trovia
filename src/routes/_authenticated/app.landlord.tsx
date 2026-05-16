import { createFileRoute } from "@tanstack/react-router";
import { DashboardPreview } from "@/components/landing/DashboardPreview";

export const Route = createFileRoute("/_authenticated/app/landlord")({ component: LandlordDash });

function LandlordDash() {
  return (
    <div className="max-w-7xl space-y-8">
      <div>
        <div className="text-sm font-medium text-primary mb-2">Landlord mode</div>
        <h1 className="text-3xl font-semibold tracking-tight">Your portfolio</h1>
        <p className="text-muted-foreground mt-1">Everything you own, at a single calm glance.</p>
      </div>
      <div className="-mx-4 sm:-mx-6 lg:-mx-10">
        <DashboardPreview />
      </div>
    </div>
  );
}
