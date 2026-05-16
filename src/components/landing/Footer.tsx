import { Home, Github, Twitter, Instagram } from "lucide-react";

const cols = [
  { title: "Product", links: ["Explore", "For Tenants", "For Landlords", "Pricing"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Support", links: ["Help center", "Trust & safety", "Cancellation", "Report a listing"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-lg">Trovia</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            A modern rental platform for students, professionals, and landlords who care about trust.
          </p>
          <div className="flex gap-2 mt-5">
            {[Twitter, Instagram, Github].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-secondary transition" aria-label="social">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold mb-4">{c.title}</h4>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="text-sm font-semibold mb-4">Stay in the loop</h4>
          <p className="text-sm text-muted-foreground mb-4">Monthly product updates, no spam.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 min-w-0 rounded-lg border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/30"
            />
            <button className="rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Trovia. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
