import { api } from "../lib/axios";
import type { User } from "./auth.service";

export interface UpdateUserDto {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  city?: string;
}

export const UserService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get("/users/me");
    return response.data?.data || response.data;
  },

  updateProfile: async (dto: UpdateUserDto): Promise<User> => {
    const response = await api.patch("/users/me", dto);
    return response.data?.data || response.data;
  },
};
