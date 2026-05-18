import { api } from "../lib/axios";
import type { Room } from "./property.service";

export interface CreateRoomDto {
  title: string;
  description?: string;
  price: number;
  area: number;
  deposit: number;
  capacity: number;
  isAvailable?: boolean;
  amenities?: string[];
  roomNumber?: string;
  floor?: number;
  genderRestriction?: string;
  status?: string;
}

export interface UpdateRoomDto {
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  deposit?: number;
  capacity?: number;
  isAvailable?: boolean;
  amenities?: string[];
  roomNumber?: string;
  floor?: number;
  genderRestriction?: string;
  status?: string;
}

export const RoomService = {
  findAllByProperty: async (propertyId: string): Promise<Room[]> => {
    const response = await api.get(`/properties/${propertyId}/rooms`);
    return response.data?.data || response.data;
  },

  create: async (propertyId: string, dto: CreateRoomDto): Promise<Room> => {
    const response = await api.post(`/properties/${propertyId}/rooms`, dto);
    return response.data?.data || response.data;
  },

  update: async (id: string, dto: UpdateRoomDto): Promise<Room> => {
    const response = await api.patch(`/rooms/${id}`, dto);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data?.data || response.data;
  },
};
