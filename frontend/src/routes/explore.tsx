import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ExplorePage } from "@/components/explore/ExplorePage";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore verified rentals | Trovia" },
      {
        name: "description",
        content:
          "Browse verified rooms, studios, boarding houses, and apartments before creating a Trovia account.",
      },
    ],
  }),
  component: PublicExplore,
});

function PublicExplore() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="px-4 sm:px-6 pt-32 pb-20">
        <div className="mx-auto max-w-7xl">
          <ExplorePage mode="public" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
