import { api } from "../lib/axios";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  occupation?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  preferredDistrict?: string | null;
  budgetRange?: string | null;
  moveInTimeline?: string | null;
  renterType?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  expectedMoveInDate?: string | null;
  roles: string[];
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDto {
  email: string;
  passwordHash?: string;
  password?: string;
  fullName: string;
  phone?: string;
  city?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface EmailPreferences {
  userId: string;
  authEmailsEnabled: boolean;
  rentalEmailsEnabled: boolean;
  contractEmailsEnabled: boolean;
  paymentEmailsEnabled: boolean;
  maintenanceEmailsEnabled: boolean;
  marketingEmailsEnabled: boolean;
}

export const AuthService = {
  register: async (dto: RegisterDto): Promise<User> => {
    const response = await api.post("/auth/register", {
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
      phone: dto.phone,
      city: dto.city,
    });
    return response.data?.data || response.data;
  },

  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", dto);
    const data = response.data?.data || response.data;
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
    }
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh");
    const data = response.data?.data || response.data;
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    return data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data?.data || response.data;
  },

  /** POST /auth/forgot-password — always returns generic message */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data?.data || response.data;
  },

  /** POST /auth/reset-password?email=... */
  resetPassword: async (
    token: string,
    newPassword: string,
    email: string,
  ): Promise<{ message: string }> => {
    const response = await api.post(
      `/auth/reset-password?email=${encodeURIComponent(email)}`,
      { token, newPassword },
    );
    return response.data?.data || response.data;
  },

  /** POST /auth/verify-email?email=... */
  verifyEmail: async (
    token: string,
    email: string,
  ): Promise<{ message: string }> => {
    const response = await api.post(
      `/auth/verify-email?email=${encodeURIComponent(email)}`,
      { token },
    );
    return response.data?.data || response.data;
  },

  /** POST /auth/resend-verification (authenticated) */
  resendVerification: async (): Promise<{ message: string }> => {
    const response = await api.post("/auth/resend-verification");
    return response.data?.data || response.data;
  },
};
