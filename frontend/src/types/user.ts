export enum Role {
  TENANT = "TENANT",
  LANDLORD = "LANDLORD",
  ADMIN = "ADMIN",
}

export enum LandlordStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export interface LandlordProfile {
  id: string;
  userId: string;
  businessName?: string;
  phoneNumber?: string;
  identityCardNumber?: string;
  bankAccountNumber?: string;
  bankName?: string;
  status: LandlordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: Role[];
  landlordProfile?: LandlordProfile;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
