import { api } from "../lib/axios";
import type { Room } from "./property.service";

export type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "IN_DISCUSSION";

export interface BookingRequest {
  id: string;
  tenantId: string;
  roomId: string | null;
  propertyId: string;
  status: BookingStatus;
  message: string | null;
  phone: string | null;
  moveInDate: string;
  rentalDurationMonths: number;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    images: Array<{ url: string }>;
  };
  room?: Room | null;
  conversations?: Array<{ id: string }> | null;
  tenant?: {
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}

export interface CreateBookingRequestDto {
  propertyId: string;
  roomId?: string;
  note?: string;
  proposedMoveInDate: string;
  rentalDurationMonths?: number;
  phone?: string;
}

export const BookingRequestService = {
  create: async (dto: CreateBookingRequestDto): Promise<{ request: BookingRequest; conversationId: string }> => {
    // Maps the old frontend parameters to CreateRentalRequestDto expected by the NestJS backend
    const response = await api.post("/rental-requests", {
      propertyId: dto.propertyId,
      roomId: dto.roomId || undefined,
      moveInDate: dto.proposedMoveInDate,
      rentalDurationMonths: dto.rentalDurationMonths || 12,
      message: dto.note,
      phone: dto.phone,
    });
    return response.data?.data || response.data;
  },

  findAllForTenant: async (): Promise<BookingRequest[]> => {
    const response = await api.get("/rental-requests/me");
    return response.data?.data || response.data;
  },

  findAllForLandlord: async (): Promise<BookingRequest[]> => {
    const response = await api.get("/landlords/rental-requests");
    return response.data?.data || response.data;
  },

  updateStatus: async (id: string, status: BookingStatus): Promise<BookingRequest> => {
    const response = await api.patch(`/rental-requests/${id}/status`, { status });
    return response.data?.data || response.data;
  },
};
