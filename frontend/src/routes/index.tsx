import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SmartSearch } from "@/components/landing/SmartSearch";
import { Properties } from "@/components/landing/Properties";
import { Features } from "@/components/landing/Features";
import { DualUser } from "@/components/landing/DualUser";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trovia — Trusted rentals for students & young professionals" },
      {
        name: "description",
        content:
          "Trovia helps you find verified student housing, boarding rooms, and affordable apartments — and gives landlords a calm dashboard to manage every property.",
      },
      { property: "og:title", content: "Trovia — Trusted rentals, beautifully managed" },
      { property: "og:description", content: "Find verified rooms and manage rentals with confidence." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <SmartSearch />
      <Properties />
      <Features />
      <DualUser />
      <DashboardPreview />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
