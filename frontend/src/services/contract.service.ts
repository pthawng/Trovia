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
  depositAmount?: number;
  durationMonths?: number;
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
  depositAmount: number;
  durationMonths: number;
  terms: string;
}

const mapContract = (c: any): Contract => {
  if (!c) return c;
  return {
    ...c,
    deposit: c.deposit !== undefined ? Number(c.deposit) : (c.depositAmount ? Number(c.depositAmount) : 0),
    depositAmount: c.depositAmount !== undefined ? Number(c.depositAmount) : (c.deposit !== undefined ? Number(c.deposit) : 0),
    durationMonths: c.durationMonths !== undefined ? Number(c.durationMonths) : 12,
  };
};

export const ContractService = {
  findAll: async (): Promise<Contract[]> => {
    const response = await api.get("/contracts");
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data.map(mapContract) : [];
  },

  findOne: async (id: string): Promise<Contract> => {
    const response = await api.get(`/contracts/${id}`);
    const data = response.data?.data || response.data;
    return mapContract(data);
  },

  createDraft: async (dto: CreateContractDto): Promise<Contract> => {
    const response = await api.post("/contracts", dto);
    const data = response.data?.data || response.data;
    return mapContract(data);
  },

  sendToTenant: async (id: string): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/send`);
    const data = response.data?.data || response.data;
    return mapContract(data);
  },

  acceptContract: async (id: string): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/accept`);
    const data = response.data?.data || response.data;
    return mapContract(data);
  },

  rejectContract: async (id: string): Promise<Contract> => {
    const response = await api.patch(`/contracts/${id}/reject`);
    const data = response.data?.data || response.data;
    return mapContract(data);
  },
};
