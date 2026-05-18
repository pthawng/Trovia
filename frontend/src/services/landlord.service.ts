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

  publicName?: string | null;
  supportEmail?: string | null;
  contactPhone?: string | null;
  logoUrl?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  vietQrNoteTemplate?: string | null;
  defaultDepositMonths?: number | null;
  defaultContractDurationMonths?: number | null;
  defaultPaymentDueDay?: number | null;
  defaultHouseRules?: string | null;
  notificationPreferences?: any;
  publishingPreferences?: any;
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
  publicName?: string;
  supportEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  vietQrNoteTemplate?: string;
  defaultDepositMonths?: number;
  defaultContractDurationMonths?: number;
  defaultPaymentDueDay?: number;
  defaultHouseRules?: string;
  notificationPreferences?: any;
  publishingPreferences?: any;
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

  updateSettings: async (dto: UpdateLandlordDto): Promise<LandlordProfile> => {
    const response = await api.patch("/landlords/settings", dto);
    return response.data?.data || response.data;
  },

  activate: async (targetUserId?: string): Promise<{ message: string; profile: LandlordProfile }> => {
    const response = await api.post("/landlords/activate", {}, {
      params: targetUserId ? { targetUserId } : undefined,
    });
    return response.data?.data || response.data;
  },
};
