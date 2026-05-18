import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/")({
  beforeLoad: async () => {
    throw redirect({ to: "/app/explore" });
  },
  component: () => null,
});
