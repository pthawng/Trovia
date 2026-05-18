import { api } from "../lib/axios";
import type { User, EmailPreferences } from "./auth.service";

export interface UpdateUserDto {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  occupation?: string;
  dateOfBirth?: string;
  bio?: string;
  preferredDistrict?: string;
  budgetRange?: string;
  moveInTimeline?: string;
  renterType?: string;
  budgetMin?: number;
  budgetMax?: number;
  expectedMoveInDate?: string;
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

  getEmailPreferences: async (): Promise<EmailPreferences> => {
    const response = await api.get("/users/me/preferences");
    return response.data?.data || response.data;
  },

  updateEmailPreferences: async (
    dto: Partial<Omit<EmailPreferences, "userId">>
  ): Promise<EmailPreferences> => {
    const response = await api.patch("/users/me/preferences", dto);
    return response.data?.data || response.data;
  },
};
