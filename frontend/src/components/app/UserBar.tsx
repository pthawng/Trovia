import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftRight,
  Bell,
  Clock,
  Laptop,
  LogOut,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ConversationService, type Conversation } from "@/services/conversation.service";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

type UserBarProps = {
  showModeSwitch?: boolean;
  className?: string;
};

export function UserBar({ showModeSwitch = true, className }: UserBarProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [unreadCount, setUnreadCount] = useState(0);

  const isLandlord = user?.roles?.includes("LANDLORD");
  const inLandlordMode = path.startsWith("/app/landlord");
  const initials = (user?.fullName || user?.email || "U").slice(0, 2).toUpperCase();

  useQuery({
    queryKey: ["headerUnreadCount"],
    queryFn: async () => {
      const res = await ConversationService.getUnreadCount();
      setUnreadCount(res.count);
      return res;
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: ConversationService.findAll,
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!socket || !user) return;

    const handleUnreadUpdate = (data: { userId: string; count: number }) => {
      if (data.userId === user.id) {
        setUnreadCount(data.count);
      }
    };

    socket.on("unreadCountUpdated", handleUnreadUpdate);
    return () => {
      socket.off("unreadCountUpdated", handleUnreadUpdate);
    };
  }, [socket, user]);

  if (!user) {
    return null;
  }

  const openMessages = (activeId?: string) => {
    if (inLandlordMode) {
      navigate({
        to: "/app/landlord" as any,
        search: { view: "messages", activeId } as any,
      });
      return;
    }

    navigate({
      to: "/app/messages",
      search: (activeId ? { activeId } : {}) as any,
    });
  };

  const recentConversations = conversations.slice(0, 5);

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3 shrink-0", className)}>
      {showModeSwitch && isLandlord && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: inLandlordMode ? "/app/explore" : "/app/landlord" })}
          className={cn(
            "hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer border transition-all duration-200",
            inLandlordMode
              ? "text-primary border-primary/20 bg-primary-soft/30 hover:bg-primary-soft/60"
              : "text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-50",
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span>{inLandlordMode ? t("common.switch_to_tenant") : t("common.switch_to_landlord")}</span>
        </Button>
      )}

      <LanguageSwitcher />

      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="h-10 w-10 rounded-xl hover:bg-secondary">
        {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-xl hover:bg-secondary cursor-pointer"
            aria-label="Messages"
          >
            <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm animate-pulse",
                  inLandlordMode ? "bg-amber-600" : "bg-primary",
                )}
              >
                {unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-2rem)] p-2 rounded-2xl shadow-xl ring-1 ring-black/5 mt-1">
          <DropdownMenuLabel className="px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground leading-none">{t("nav.messages")}</div>
                <div className="text-xs font-normal text-muted-foreground mt-1">
                  {unreadCount > 0 ? `${unreadCount} tin chưa đọc` : "Không có tin mới"}
                </div>
              </div>
              <button
                onClick={() => openMessages()}
                className="text-xs font-semibold text-primary hover:underline underline-offset-4"
              >
                Xem tất cả
              </button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />

          {conversationsLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : recentConversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-secondary text-muted-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold text-foreground">Chưa có tin nhắn</div>
              <div className="mt-1 text-xs text-muted-foreground">Hội thoại với chủ nhà sẽ hiển thị tại đây.</div>
            </div>
          ) : (
            <div className="max-h-[22rem] overflow-y-auto pr-1">
              {recentConversations.map((conversation: Conversation) => {
                const otherUser = conversation.tenantId === user.id ? conversation.landlord : conversation.tenant;
                const hasUnread =
                  Boolean(conversation.lastMessage) &&
                  conversation.lastMessage?.senderId !== user.id &&
                  !conversation.lastMessage?.readAt;
                const initials = (otherUser?.fullName || "TR").slice(0, 2).toUpperCase();
                const lastMessage = conversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện";
                const lastTime = conversation.lastMessageAt
                  ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "";

                return (
                  <DropdownMenuItem
                    key={conversation.id}
                    onSelect={() => openMessages(conversation.id)}
                    className="rounded-xl p-3 cursor-pointer items-start gap-3"
                  >
                    <div className="relative mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary text-xs font-bold">
                      {initials}
                      {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-foreground">{otherUser?.fullName || "Trovia User"}</span>
                        {lastTime && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lastTime}
                          </span>
                        )}
                      </div>
                      <div className={cn("mt-1 truncate text-xs", hasUnread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        {lastMessage}
                      </div>
                      {conversation.property?.title && (
                        <div className="mt-1 truncate text-[10px] text-muted-foreground/80">{conversation.property.title}</div>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-secondary cursor-pointer" aria-label="Notifications">
        <Bell className="h-4.5 w-4.5 text-muted-foreground" />
        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-10 w-10 rounded-xl hover:scale-105 transition duration-200 cursor-pointer shadow-sm relative group overflow-hidden">
            <Avatar className="h-full w-full rounded-xl border border-primary/10 bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] text-primary-foreground">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || user.email} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-transparent text-xs font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-2xl shadow-xl ring-1 ring-black/5 mt-1">
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="text-sm font-semibold text-foreground leading-none">{user.fullName || "Trovia User"}</div>
            <div className="text-xs text-muted-foreground truncate mt-1">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem onSelect={() => navigate({ to: "/app/tenant/dashboard" })} className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
            <Laptop className="h-4 w-4 mr-2 text-muted-foreground" />
            {t("common.personal_hub")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => navigate({ to: "/app/profile" })} className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            {t("nav.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
            <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
            {t("common.actions")}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem
            onSelect={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t("common.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
