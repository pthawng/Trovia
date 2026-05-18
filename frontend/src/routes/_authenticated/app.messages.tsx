import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Send, Search, MessageSquare, Calendar, ShieldCheck, User as UserIcon, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationService } from "@/services/conversation.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/messages")({ component: Messages });

function Messages() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getMe,
  });

  // 2. Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: ConversationService.findAll,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Set active thread if not set
  useEffect(() => {
    if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // 3. Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => (activeId ? ConversationService.findMessages(activeId) : Promise.resolve([])),
    enabled: !!activeId,
    refetchInterval: 3000, // Poll active chat every 3 seconds for snappy interaction
  });

  // Scroll to bottom when messages load/change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Mark read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => ConversationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Automatically mark as read when selecting thread
  useEffect(() => {
    if (activeId) {
      markReadMutation.mutate(activeId);
    }
  }, [activeId]);

  // 5. Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      ConversationService.sendMessage(id, content, "TEXT"),
    onSuccess: () => {
      setInputText("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send message.");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeId) return;

    sendMessageMutation.mutate({
      id: activeId,
      content: inputText.trim(),
    });
  };

  // Filter conversations
  const filteredThreads = conversations.filter((c) => {
    const participantName =
      currentUser?.id === c.tenantId
        ? c.landlord?.fullName
        : c.tenant?.fullName;
    return participantName?.toLowerCase().includes(searchText.toLowerCase());
  });

  const activeThread = conversations.find((c) => c.id === activeId);
  const otherParticipant = activeThread
    ? currentUser?.id === activeThread.tenantId
      ? activeThread.landlord
      : activeThread.tenant
    : null;

  return (
    <div className="max-w-7xl h-[calc(100vh-10rem)] grid lg:grid-cols-[320px_1fr] gap-5">
      {/* LEFT PANE: Conversations list */}
      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm liên hệ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 h-11 bg-secondary border-transparent rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-xs">Không có cuộc hội thoại nào.</p>
            </div>
          ) : (
            filteredThreads.map((t) => {
              const otherUser = currentUser?.id === t.tenantId ? t.landlord : t.tenant;
              const hasUnread = t.lastMessage && t.lastMessage.senderId !== currentUser?.id && !t.lastMessage.readAt;
              const initials = otherUser?.fullName?.slice(0, 2).toUpperCase() || "TR";

              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-secondary/60 transition text-left border-b border-border cursor-pointer",
                    activeId === t.id && "bg-primary-soft/30"
                  )}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-semibold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs truncate text-foreground">
                        {otherUser?.fullName || "User"}
                      </div>
                      <div className="text-[9px] text-muted-foreground shrink-0">
                        {t.lastMessage ? new Date(t.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </div>
                    </div>
                    <div className={cn("text-[11px] truncate mt-0.5", hasUnread ? "text-foreground font-semibold" : "text-muted-foreground")}>
                      {t.lastMessage ? t.lastMessage.content : "Bắt đầu cuộc trò chuyện"}
                    </div>
                  </div>
                  {hasUnread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Chat box */}
      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border flex flex-col overflow-hidden">
        {activeThread && otherParticipant ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-semibold">
                  {otherParticipant.fullName?.slice(0, 2).toUpperCase() || "TR"}
                </div>
                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    {otherParticipant.fullName}
                    {currentUser?.id === activeThread.tenantId && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <ShieldCheck className="h-3 w-3" /> Chủ nhà
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Building className="h-3 w-3 text-primary" /> {activeThread.property.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-muted-foreground animate-pulse">Đang tải tin nhắn...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40" />
                  <p className="text-xs">Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser?.id;

                  if (m.type === "SYSTEM") {
                    return (
                      <div key={m.id} className="flex justify-center my-4">
                        <div className="max-w-md bg-secondary/50 border border-border/80 rounded-2xl px-4 py-3 text-center space-y-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Thông báo hệ thống</span>
                          <p className="text-xs text-foreground leading-relaxed font-medium">{m.content}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm font-medium"
                            : "bg-secondary rounded-bl-sm text-foreground border border-border/20"
                        )}
                      >
                        {m.content}
                        <div className="text-[8px] text-right mt-1 opacity-70">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat footer input form */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex items-center gap-2 bg-secondary/10">
              <Input
                placeholder="Nhập nội dung tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="h-11 bg-background border-border/80 rounded-xl text-xs px-4"
              />
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !inputText.trim()}
                className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center hover:bg-primary/90 transition shadow-[var(--shadow-glow)] shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-base font-semibold text-foreground">Trò chuyện trực tiếp</h3>
            <p className="text-xs max-w-xs leading-relaxed">
              Chọn một cuộc hội thoại ở danh sách bên trái để trao đổi thông tin phòng trọ, hẹn lịch xem nhà, hoặc thương thảo điều khoản hợp đồng.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
