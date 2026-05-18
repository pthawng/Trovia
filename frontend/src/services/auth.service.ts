import { api } from "../lib/axios";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  roles: string[];
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDto {
  email: string;
  passwordHash?: string; // mapped from password
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
};
