import { api } from "../lib/axios";

export type ContractStatus = "DRAFT" | "SENT" | "ACTIVE" | "EXPIRED" | "TERMINATED" | "REJECTED";

export interface Contract {
  id: string;
  rentalRequestId: string;
  landlordId: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  terms: string;
  status: ContractStatus;
  sentAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    title: string;
    address: string;
    city: string;
    district: string;
    images: Array<{ url: string }>;
  };
  room: {
    title: string;
    area: number;
  };
  landlord: {
    fullName: string;
    email: string;
  };
  tenant: {
    fullName: string;
    email: string;
  };
}

export interface CreateContractDto {
  rentalRequestId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  terms: string;
}

export const ContractService = {
  findAll: async (): Promise<Contract[]> => {
    const response = await api.get("/contracts");
    return response.data?.data || response.data;
  },

  findOne: async (id: string): Promise<Contract> => {
    const response = await api.get(`/contracts/${id}`);
    return response.data?.data || response.data;
  },

  createDraft: async (dto: CreateContractDto): Promise<Contract> => {
    const response = await api.post("/contracts", dto);
    return response.data?.data || response.data;
  },

  sendToTenant: async (id: string): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/send`);
    return response.data?.data || response.data;
  },

  acceptContract: async (id: string): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/accept`);
    return response.data?.data || response.data;
  },

  rejectContract: async (id: string): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/reject`);
    return response.data?.data || response.data;
  },
};
