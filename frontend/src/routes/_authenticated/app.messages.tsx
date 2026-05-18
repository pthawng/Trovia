import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Send, Search, MessageSquare, Calendar, ShieldCheck, User as UserIcon, 
  Building, FileText, CreditCard, Image as ImageIcon, Paperclip, 
  Sparkles, Check, DollarSign, Clock, FilePlus, ChevronRight 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ConversationService } from "@/services/conversation.service";
import { AuthService } from "@/services/auth.service";
import { useConversationSocket } from "@/hooks/useConversationSocket";

export const Route = createFileRoute("/_authenticated/app/messages")({ component: Messages });

export function Messages() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "LANDLORD" | "TENANT">("ALL");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Action triggers for Landlords
  const [showActions, setShowActions] = useState(false);

  // 1. Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getMe,
  });

  // 2. Fetch conversations (No polling/refetch interval!)
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: ConversationService.findAll,
  });

  const locationState = useRouterState({ select: (s) => s.location });
  const urlActiveId = (locationState.search as any)?.activeId;

  // Set active thread if not set or specified by search params
  useEffect(() => {
    if (urlActiveId) {
      setActiveId(urlActiveId);
    } else if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId, urlActiveId]);

  // 3. Fetch messages for active conversation (No polling/refetch interval!)
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => (activeId ? ConversationService.findMessages(activeId) : Promise.resolve([])),
    enabled: !!activeId && !!currentUser,
  });

  // 4. Hook up real-time socket communication
  const {
    isPeerTyping,
    sendTypingStatus,
    sendMessage: socketSendMessage,
    markRead: socketMarkRead,
    isConnected,
  // @ts-ignore
  } = useConversationSocket(activeId, currentUser?.id);

  // Scroll to bottom when messages load/change or when peer starts typing
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPeerTyping]);

  // Handle key input typing triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Start typing socket notification
    sendTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000); // Reset typing status after 2 seconds of inactivity
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeId) return;

    // Send via real-time WebSocket connection
    socketSendMessage(inputText.trim(), "TEXT");
    setInputText("");
    
    // Explicitly notify typing stopped on send
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTypingStatus(false);
  };

  // Quick message builders for unified rental lifecycle actions
  const sendAppointment = () => {
    if (!activeId) return;
    socketSendMessage(
      "Xin chào! Mình muốn hẹn lịch xem phòng vào cuối tuần này. Nhờ bạn xác nhận lịch nhé!",
      "APPOINTMENT",
      {
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PENDING"
      }
    );
    setShowActions(false);
  };

  const sendPaymentRequest = () => {
    if (!activeId) return;
    socketSendMessage(
      "Yêu cầu thanh toán tiền đặt cọc giữ chỗ để hoàn thiện hồ sơ thuê phòng.",
      "PAYMENT",
      {
        amount: 2500000,
        status: "PENDING"
      }
    );
    setShowActions(false);
  };

  const sendContractInvitation = () => {
    if (!activeId) return;
    socketSendMessage(
      "Hợp đồng thuê nhà điện tử đã được khởi tạo thành công. Vui lòng xem kỹ điều khoản và thực hiện ký e-Sign.",
      "CONTRACT",
      {
        status: "DRAFT"
      }
    );
    setShowActions(false);
  };

  const sendMockImage = () => {
    if (!activeId) return;
    socketSendMessage(
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "IMAGE"
    );
    setShowActions(false);
  };

  const sendMockFile = () => {
    if (!activeId) return;
    socketSendMessage(
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      "FILE",
      {
        fileName: "Ban_Thao_Hop_Dong_Nha.pdf",
        fileSize: "142 KB"
      }
    );
    setShowActions(false);
  };

  // Filter conversations by tab and search
  const filteredThreads = conversations.filter((c) => {
    // 1. Tab check
    if (activeTab === "LANDLORD") {
      if (c.landlordId !== currentUser?.id) return false;
    } else if (activeTab === "TENANT") {
      if (c.tenantId !== currentUser?.id) return false;
    }

    // 2. Search check
    const otherUser = currentUser?.id === c.tenantId ? c.landlord : c.tenant;
    return otherUser?.fullName?.toLowerCase().includes(searchText.toLowerCase());
  });

  const activeThread = conversations.find((c) => c.id === activeId);
  const otherParticipant = activeThread
    ? currentUser?.id === activeThread.tenantId
      ? activeThread.landlord
      : activeThread.tenant
    : null;

  const isCurrentUserLandlordInActiveThread = activeThread?.landlordId === currentUser?.id;

  return (
    <div className="max-w-7xl h-[calc(100vh-10rem)] grid lg:grid-cols-[340px_1fr] gap-5 select-none">
      {/* LEFT PANE: Unified conversation threads */}
      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border flex flex-col overflow-hidden shadow-sm">
        {/* Thread header */}
        <div className="p-4 border-b border-border bg-secondary/10 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm liên hệ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9 h-10 bg-background border-border/80 focus-visible:ring-primary/20 rounded-xl text-xs"
            />
          </div>

          {/* Dynamic Tab Filter Switchers */}
          <div className="flex p-0.5 bg-secondary/40 rounded-lg text-[10px] font-bold">
            <button
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "flex-1 py-1.5 rounded-md transition cursor-pointer text-center",
                activeTab === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("TENANT")}
              className={cn(
                "flex-1 py-1.5 rounded-md transition cursor-pointer text-center",
                activeTab === "TENANT" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Với chủ nhà
            </button>
            <button
              onClick={() => setActiveTab("LANDLORD")}
              className={cn(
                "flex-1 py-1.5 rounded-md transition cursor-pointer text-center",
                activeTab === "LANDLORD" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Với người thuê
            </button>
          </div>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto divided-y divide-border">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 animate-bounce" />
              <p className="text-xs font-medium">Không tìm thấy cuộc hội thoại nào.</p>
            </div>
          ) : (
            filteredThreads.map((t) => {
              const otherUser = currentUser?.id === t.tenantId ? t.landlord : t.tenant;
              const isTenantRole = currentUser?.id === t.tenantId;
              const hasUnread = t.lastMessage && t.lastMessage.senderId !== currentUser?.id && !t.lastMessage.readAt;
              const initials = otherUser?.fullName?.slice(0, 2).toUpperCase() || "TR";

              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 p-4 hover:bg-secondary/40 transition text-left border-b border-border/50 cursor-pointer relative",
                    activeId === t.id && "bg-primary-soft/20 dark:bg-primary-soft/10 border-l-3 border-l-primary"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-bold shadow-sm">
                      {initials}
                    </div>
                    {/* Glowing Online Status Indicator placeholder */}
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" title="Đang trực tuyến" />
                    
                    {isTenantRole ? (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white ring-2 ring-background font-bold" title="Vai trò: Khách thuê">
                        T
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] text-white ring-2 ring-background font-bold" title="Vai trò: Chủ nhà">
                        L
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs truncate text-foreground flex items-center gap-1.5">
                        {otherUser?.fullName || "Người liên hệ"}
                      </div>
                      <div className="text-[9px] text-muted-foreground shrink-0 font-medium">
                        {t.lastMessage ? new Date(t.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </div>
                    </div>
                    
                    {/* Render preview of custom card types in sidebar */}
                    <div className={cn("text-[11px] truncate mt-1", hasUnread ? "text-foreground font-semibold" : "text-muted-foreground")}>
                      {t.lastMessage ? (
                        t.lastMessage.type === "CONTRACT" ? "📄 Gửi lời mời ký hợp đồng" :
                        t.lastMessage.type === "PAYMENT" ? "💳 Yêu cầu thanh toán mới" :
                        t.lastMessage.type === "APPOINTMENT" ? "📅 Hẹn lịch xem phòng" :
                        t.lastMessage.type === "IMAGE" ? "📷 [Hình ảnh]" :
                        t.lastMessage.type === "FILE" ? "📎 [Tệp đính kèm]" :
                        t.lastMessage.content
                      ) : "Chưa có tin nhắn"}
                    </div>
                  </div>
                  {hasUnread && <span className="h-2 w-2 rounded-full bg-primary shrink-0 absolute right-4 top-1/2 -translate-y-1/2" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Chat box viewport */}
      <div className="rounded-2xl bg-surface-elevated ring-1 ring-border flex flex-col overflow-hidden shadow-sm">
        {activeThread && otherParticipant ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/15">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.2_285)] grid place-items-center text-white text-xs font-bold shadow-sm">
                    {otherParticipant.fullName?.slice(0, 2).toUpperCase() || "TR"}
                  </div>
                  {/* Glowing online indicator */}
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {otherParticipant.fullName}
                    {currentUser?.id === activeThread.tenantId ? (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" /> CHỦ NHÀ
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <UserIcon className="h-2.5 w-2.5" /> KHÁCH THUÊ
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đang hoạt động</span>
                    </span>
                    <span className="text-border">|</span>
                    <Building className="h-3 w-3 text-primary shrink-0" /> 
                    <span>{activeThread.property?.title || "Bất động sản"}</span>
                    {activeThread.room && (
                      <>
                        <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        <span className="text-foreground font-semibold">Phòng {activeThread.room.roomNumber || activeThread.room.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                {isConnected ? (
                  <span className="text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-950/30">
                    ● Realtime Connected
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                    ▲ Reconnecting...
                  </span>
                )}
              </div>
            </div>

            {/* Message bubbles viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/5">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-muted-foreground animate-pulse">Đang tải tin nhắn...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 animate-pulse" />
                  <p className="text-xs">Chưa có tin nhắn nào. Bắt đầu câu chuyện ngay!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser?.id;
                  
                  // Parse metadata securely
                  let metadata: any = {};
                  try {
                    metadata = typeof m.metadata === "string" ? JSON.parse(m.metadata) : (m.metadata || {});
                  } catch (e) {
                    metadata = {};
                  }

                  // 1. SYSTEM Message Card
                  if (m.type === "SYSTEM" || m.senderRoleContext === "SYSTEM") {
                    return (
                      <div key={m.id} className="flex justify-center my-4">
                        <div className="max-w-md bg-secondary/50 border border-border/80 rounded-2xl px-5 py-4 text-center shadow-xs space-y-1.5 backdrop-blur-xs">
                          <span className="text-[10px] font-bold text-primary tracking-widest uppercase block">Thông báo hệ thống</span>
                          <p className="text-xs text-foreground font-semibold leading-relaxed">{m.content}</p>
                        </div>
                      </div>
                    );
                  }

                  // 2. APPOINTMENT Viewing Invite Card
                  if (m.type === "APPOINTMENT") {
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start", "my-2")}>
                        <div className={cn(
                          "max-w-sm rounded-2xl border p-4 shadow-md backdrop-blur-xs relative overflow-hidden",
                          isMe 
                            ? "bg-blue-500/5 border-blue-500/20 text-foreground" 
                            : "bg-surface border-border text-foreground"
                        )}>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                          <div className="flex items-start gap-3 mt-1">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 shrink-0">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                Lịch Hẹn Xem Nhà
                              </h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {m.content}
                              </p>
                              {metadata?.appointmentDate && (
                                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/5 py-1 px-2 rounded-md border border-blue-500/10 inline-block">
                                  Thời gian: {new Date(metadata.appointmentDate).toLocaleString("vi-VN")}
                                </div>
                              )}
                              <div className="pt-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate({ to: "/app/requests" as any })}
                                  className="h-8 text-[10px] font-bold rounded-lg px-3 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                >
                                  Quản lý lịch hẹn
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 3. LEASE CONTRACT Invitation Card
                  if (m.type === "CONTRACT") {
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start", "my-2")}>
                        <div className={cn(
                          "max-w-sm rounded-2xl border p-4 shadow-md backdrop-blur-xs relative overflow-hidden",
                          isMe 
                            ? "bg-amber-500/5 border-amber-500/20 text-foreground" 
                            : "bg-surface border-border text-foreground"
                        )}>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
                          <div className="flex items-start gap-3 mt-1">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                Ký Hợp Đồng Thuê Nhà
                              </h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {m.content}
                              </p>
                              <div className="pt-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate({ to: isCurrentUserLandlordInActiveThread ? "/app/landlord?view=contracts" as any : "/app/contracts" as any })}
                                  className="h-8 text-[10px] font-bold rounded-lg px-3 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                >
                                  Ký Hợp Đồng e-Sign
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 4. PAYMENT Request Card
                  if (m.type === "PAYMENT") {
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start", "my-2")}>
                        <div className={cn(
                          "max-w-sm rounded-2xl border p-4 shadow-md backdrop-blur-xs relative overflow-hidden",
                          isMe 
                            ? "bg-emerald-500/5 border-emerald-500/20 text-foreground" 
                            : "bg-surface border-border text-foreground"
                        )}>
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                          <div className="flex items-start gap-3 mt-1">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shrink-0">
                              <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                Yêu Cầu Thanh Toán
                              </h4>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {m.content}
                              </p>
                              {metadata?.amount && (
                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                  Số tiền: {Number(metadata.amount).toLocaleString("vi-VN")} đ
                                </div>
                              )}
                              <div className="pt-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => navigate({ to: isCurrentUserLandlordInActiveThread ? "/app/landlord?view=payments" as any : "/app/payments" as any })}
                                  className="h-8 text-[10px] font-bold rounded-lg px-3 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                >
                                  Thanh Toán Ngay
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 5. IMAGE Attachment Card
                  if (m.type === "IMAGE") {
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start", "my-2")}>
                        <div className="max-w-xs rounded-2xl overflow-hidden shadow-xs border border-border/80 bg-surface group relative cursor-pointer">
                          <img src={m.content} alt="Attachment" className="w-full h-auto max-h-56 object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 grid place-items-center">
                            <ImageIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 6. FILE Document Attachment Card
                  if (m.type === "FILE") {
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start", "my-2")}>
                        <div className="max-w-sm rounded-2xl border p-4 bg-surface border-border flex items-center gap-3 shadow-xs">
                          <div className="p-2.5 rounded-xl bg-secondary text-foreground shrink-0">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold truncate text-foreground">
                              {metadata?.fileName || "Hop_Dong_Lien_Quan.pdf"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {metadata?.fileSize || "1.2 MB"}
                            </div>
                            <a 
                              href={m.content} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] font-bold text-primary hover:underline mt-1 block"
                            >
                              Tải tài liệu đính kèm
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 7. Standard TEXT bubble
                  return (
                    <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-md px-4.5 py-3 rounded-2xl text-xs leading-relaxed shadow-xs relative group",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm font-semibold"
                            : "bg-surface text-foreground border border-border/50 rounded-bl-sm font-medium"
                        )}
                      >
                        {m.content}
                        
                        {/* Real-time message read state */}
                        <div className={cn(
                          "text-[8px] text-right mt-1.5 opacity-70 font-semibold flex items-center justify-end gap-1 select-none",
                          isMe ? "text-primary-foreground" : "text-muted-foreground"
                        )}>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            m.readAt ? (
                              <span className="text-emerald-300 dark:text-emerald-400 flex items-center gap-0.5">
                                <Check className="h-2 w-2 stroke-[4px]" /> Đã xem
                              </span>
                            ) : (
                              <span className="opacity-60 flex items-center gap-0.5">
                                <Check className="h-2 w-2 stroke-[3px]" /> Đã gửi
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Animated Typing Indicator inside viewport */}
              {isPeerTyping && (
                <div className="flex justify-start items-center gap-2.5 text-xs text-muted-foreground/90 bg-secondary/20 py-2 px-4 rounded-xl border border-border/30 w-fit animate-pulse">
                  <span className="font-bold">{otherParticipant?.fullName} đang nhập</span>
                  <span className="flex gap-1 items-center h-2">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick action menu for landlords & attachments */}
            {showActions && (
              <div className="px-6 py-4 bg-surface border-t border-border grid grid-cols-2 md:grid-cols-5 gap-3 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button 
                  onClick={sendAppointment}
                  className="flex flex-col items-center gap-2 p-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 rounded-xl transition text-center cursor-pointer"
                >
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-700">Hẹn Xem Nhà</span>
                </button>

                <button 
                  onClick={sendMockImage}
                  className="flex flex-col items-center gap-2 p-3 bg-secondary/50 hover:bg-secondary border border-border/10 rounded-xl transition text-center cursor-pointer"
                >
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground">Gửi Ảnh</span>
                </button>

                <button 
                  onClick={sendMockFile}
                  className="flex flex-col items-center gap-2 p-3 bg-secondary/50 hover:bg-secondary border border-border/10 rounded-xl transition text-center cursor-pointer"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground">Gửi Tài Liệu</span>
                </button>

                {isCurrentUserLandlordInActiveThread && (
                  <>
                    <button 
                      onClick={sendPaymentRequest}
                      className="flex flex-col items-center gap-2 p-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 rounded-xl transition text-center cursor-pointer"
                    >
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">Y/C Thanh Toán</span>
                    </button>

                    <button 
                      onClick={sendContractInvitation}
                      className="flex flex-col items-center gap-2 p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 rounded-xl transition text-center cursor-pointer"
                    >
                      <FilePlus className="h-5 w-5 text-amber-600" />
                      <span className="text-[10px] font-bold text-amber-700">Lập Hợp Đồng</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Chat footer input panel */}
            <form onSubmit={handleSend} className="p-4 border-t border-border flex items-center gap-2 bg-secondary/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowActions((v) => !v)}
                className={cn(
                  "h-11 w-11 rounded-xl grid place-items-center transition cursor-pointer border-border shrink-0 hover:bg-secondary",
                  showActions && "bg-secondary text-primary"
                )}
                title="Tính năng nhanh & Tài liệu đính kèm"
              >
                <Paperclip className="h-4.5 w-4.5 text-muted-foreground" />
              </Button>

              <Input
                placeholder="Nhập nội dung tin nhắn..."
                value={inputText}
                onChange={handleInputChange}
                className="h-11 bg-background border-border rounded-xl text-xs px-4"
              />

              <Button
                type="submit"
                disabled={!inputText.trim()}
                className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center hover:bg-primary/95 transition shadow-sm shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-3">
            <div className="relative">
              <MessageSquare className="h-14 w-14 text-muted-foreground/20" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-foreground">Hộp Thư Phân Hệ</h3>
            <p className="text-xs max-w-xs leading-relaxed text-muted-foreground">
              Vui lòng chọn một cuộc hội thoại ở danh sách bên trái để kiểm tra lịch sử nhắn tin, gửi tệp đính kèm, lập lịch xem nhà hoặc giao dịch thanh toán đặt cọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
