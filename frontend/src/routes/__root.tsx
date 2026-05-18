import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { SocketProvider } from "@/lib/socket.provider";
import { Toaster } from "@/components/ui/sonner";
import "@/lib/i18n";
import appCss from "../styles.css?url";

import { AlertTriangle, Home, Compass, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

function NotFoundComponent() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between w-full">
      <div>
        <Navbar />

        {/* 404 Visual Content Section */}
        <section className="relative pt-40 pb-24 px-4 sm:px-6 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(oklch(0.42_0.19_268/0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

          <div className="relative mx-auto max-w-lg space-y-8 z-10">
            {/* Glow Gradient Behind 404 */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/10 blur-[80px] -z-10" />

            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive border border-destructive/20 shadow-sm mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-3">
              <h1 className="text-7xl sm:text-8xl font-black tracking-tighter text-foreground">
                404
              </h1>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Không tìm thấy trang
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                Có thể đường dẫn đã thay đổi hoặc trang không còn tồn tại. Hãy quay về trang chủ hoặc tiếp tục hành trình khám phá chỗ ở.
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 px-6 py-3.5 text-sm font-semibold transition"
              >
                <Home className="h-4.5 w-4.5" />
                Về trang chủ
              </Link>
              <Link
                to="/app/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition"
              >
                <Compass className="h-4.5 w-4.5" />
                Khám phá phòng trọ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Trovia" },
      { name: "description", content: "Find verified student housing and manage rentals with confidence." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAxMDAgMTAwJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJScgeTE9JzAlJyB4Mj0nMTAwJScgeTI9JzEwMCUnPjxzdG9wIG9mZnNldD0nMCUnIHN0b3AtY29sb3I9JyMwMDY2RkYnLz48c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9JyM4MDAwRkYnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgcng9JzI4JyBmaWxsPSd1cmwoI2cpJy8+PHBhdGggZD0nTTUwIDIyIEwyMiA0NyBMMjIgNzggTDQwIDc4IEw0MCA1NiBMNjAgNTYgTDYwIDc4IEw3OCA3OCBMNzggNDcgWicgZmlsbD0nI0ZGRkZGRicvPjwvc3ZnPg==",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Outlet />
            <Toaster />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
