import { createFileRoute } from "@tanstack/react-router";
import { ExplorePage } from "@/components/explore/ExplorePage";

export const Route = createFileRoute("/_authenticated/app/explore")({
  component: AppExplore,
});

function AppExplore() {
  return <ExplorePage mode="authenticated" />;
}
