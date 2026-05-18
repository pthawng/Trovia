import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./useSocket";
import { type Message } from "@/services/conversation.service";

export function useConversationSocket(conversationId: string | null, currentUserId: string | undefined) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Join/leave rooms dynamically as chat viewport targets shift
  useEffect(() => {
    if (!socket || !conversationId || !isConnected) return;

    // Join room
    socket.emit("joinConversation", conversationId);
    
    // Automatically mark read on entry
    socket.emit("markRead", { conversationId });

    // Typings tracker
    const handleUserTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsPeerTyping(data.isTyping);
      }
    };

    // New messages callback (optimistic query updates)
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        // Optimistically insert message into active message cache list to avoid layout jumps
        queryClient.setQueryData<Message[]>(["messages", conversationId], (old = []) => {
          if (old.some((m) => m.id === message.id)) return old;
          return [...old, message];
        });
        
        // Peer messages are read automatically if conversation is open
        if (message.senderId !== currentUserId) {
          socket.emit("markRead", { conversationId });
        }

        // Instantly invalidate conversation thread listings to update sidebars last message
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    };

    // Read confirmations
    const handleMessageRead = (data: { conversationId: string; readAt: string }) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData<Message[]>(["messages", conversationId], (old = []) => {
          return old.map((m) =>
            m.senderId === currentUserId ? { ...m, readAt: data.readAt } : m
          );
        });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    };

    // Global conversation update notifications (useful for real-time sidebar reordering)
    const handleConversationUpdated = (updatedConv: any) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageRead", handleMessageRead);
    socket.on("conversationUpdated", handleConversationUpdated);

    return () => {
      // Send leave command & unsubscribe event listeners
      socket.emit("leaveConversation", conversationId);
      socket.off("userTyping", handleUserTyping);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageRead", handleMessageRead);
      socket.off("conversationUpdated", handleConversationUpdated);
      setIsPeerTyping(false);
    };
  }, [socket, conversationId, isConnected, currentUserId, queryClient]);

  // Volatile typing updates
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!socket || !conversationId || !isConnected) return;
      socket.emit(isTyping ? "typingStart" : "typingStop", { conversationId });
    },
    [socket, conversationId, isConnected]
  );

  const sendMessage = useCallback(
    (content: string, type = "TEXT", metadata?: any) => {
      if (!socket || !conversationId || !isConnected) return;
      socket.emit("sendMessage", { conversationId, content, type, metadata });
    },
    [socket, conversationId, isConnected]
  );

  const markRead = useCallback(
    () => {
      if (!socket || !conversationId || !isConnected) return;
      socket.emit("markRead", { conversationId });
    },
    [socket, conversationId, isConnected]
  );

  return {
    isPeerTyping,
    sendTypingStatus,
    sendMessage,
    markRead,
    isConnected,
  };
}
