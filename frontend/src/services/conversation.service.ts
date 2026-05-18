import { api } from "../lib/axios";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: "TEXT" | "SYSTEM" | "APPOINTMENT" | "CONTRACT" | "PAYMENT";
  content: string;
  metadata: any | null;
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  propertyId: string;
  rentalRequestId: string;
  tenantId: string;
  landlordId: string;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    images: Array<{ url: string }>;
    address: string;
    city: string;
  };
  rentalRequest?: {
    status: string;
    moveInDate: string;
    rentalDurationMonths: number;
  };
  tenant: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  landlord: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  lastMessage?: Message | null;
}

export const ConversationService = {
  findAll: async (): Promise<Conversation[]> => {
    const response = await api.get("/conversations");
    return response.data?.data || response.data;
  },

  findOne: async (id: string): Promise<Conversation> => {
    const response = await api.get(`/conversations/${id}`);
    return response.data?.data || response.data;
  },

  findMessages: async (id: string): Promise<Message[]> => {
    const response = await api.get(`/conversations/${id}/messages`);
    return response.data?.data || response.data;
  },

  sendMessage: async (id: string, content: string, type: "TEXT" | "SYSTEM" | "APPOINTMENT" | "CONTRACT" | "PAYMENT" = "TEXT", metadata?: any): Promise<Message> => {
    const response = await api.post(`/conversations/${id}/messages`, {
      content,
      type,
      metadata,
    });
    return response.data?.data || response.data;
  },

  markRead: async (id: string): Promise<void> => {
    await api.post(`/conversations/${id}/read`);
  },
};
