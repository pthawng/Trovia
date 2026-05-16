import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/messages")({ component: Messages });

const threads = [
  { id: "t1", name: "Trang Bui", last: "Sure, you can move in next week.", time: "2m", unread: true, initials: "TB" },
  { id: "t2", name: "Minh Tran", last: "I attached the lease draft.", time: "1h", unread: true, initials: "MT" },
  { id: "t3", name: "Hoa Pham", last: "Thanks for the tour today!", time: "Yesterday", unread: false, initials: "HP" },
  { id: "t4", name: "Linh Vu", last: "Available from Aug 1.", time: "Mon", unread: false, initials: "LV" },
];

const messages = [
  { from: "them", text: "Hi! Saw your interest in the studio." },
  { from: "me", text: "Yes — is it still available for August?" },
  { from: "them", text: "It is. Want to schedule a tour this weekend?" },
  { from: "me", text: "Sounds great. Saturday afternoon?" },
  { from: "them", text: "Sure, you can move in next week." },
];

function Messages() {
  const [active, setActive] = useState("t1");
  return (
    <div className="max-w-7xl h-[calc(100vh-10rem)] grid lg:grid-cols-[320px_1fr] gap-5">
      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations" className="pl-9 h-10 bg-secondary border-transparent" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={cn("w-full flex items-center gap-3 p-4 hover:bg-secondary/60 transition text-left border-b border-border",
                active === t.id && "bg-primary-soft/40")}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-semibold">{t.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.time}</div>
                </div>
                <div className={cn("text-xs truncate", t.unread ? "text-foreground font-medium" : "text-muted-foreground")}>{t.last}</div>
              </div>
              {t.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-semibold">TB</div>
          <div>
            <div className="font-medium">Trang Bui</div>
            <div className="text-xs text-emerald-600">● Online</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-md px-4 py-2.5 rounded-2xl text-sm",
                m.from === "me" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm")}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex items-center gap-2">
          <Input placeholder="Write a message…" className="h-11 bg-secondary border-transparent" />
          <button className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center hover:bg-primary/90 transition">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
