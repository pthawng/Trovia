import { api } from "../lib/axios";

export interface LandlordProfile {
  userId: string;
  status: "NOT_STARTED" | "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
  businessName: string | null;
  businessAddress: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  identityCardNumber: string | null;
  identityCardFrontUrl: string | null;
  identityCardBackUrl: string | null;
  identityVerifiedAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartOnboardingDto {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  identityCardNumber: string;
  identityCardFrontUrl: string;
  identityCardBackUrl: string;
}

export interface UpdateLandlordDto {
  businessName?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
}

export const LandlordService = {
  startOnboarding: async (dto: StartOnboardingDto): Promise<LandlordProfile> => {
    const response = await api.post("/landlords/onboarding/start", dto);
    return response.data?.data || response.data;
  },

  getMe: async (): Promise<LandlordProfile> => {
    const response = await api.get("/landlords/me");
    return response.data?.data || response.data;
  },

  updateMe: async (dto: UpdateLandlordDto): Promise<LandlordProfile> => {
    const response = await api.patch("/landlords/me", dto);
    return response.data?.data || response.data;
  },

  activate: async (targetUserId?: string): Promise<{ message: string; profile: LandlordProfile }> => {
    const response = await api.post("/landlords/activate", {}, {
      params: targetUserId ? { targetUserId } : undefined,
    });
    return response.data?.data || response.data;
  },
};
