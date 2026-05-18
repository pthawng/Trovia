import { api } from "../lib/axios";

export interface Tenancy {
  id: string;
  contractId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  roomId: string;
  startedAt: string;
  endedAt: string | null;
  status: "ACTIVE" | "ENDED" | "CANCELLED";
  moveOutRequested: boolean;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    address: string;
    images?: Array<{ url: string }>;
  };
  room: {
    id: string;
    title: string;
    roomNumber: string | null;
  };
  tenant: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string;
  };
  landlord: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string;
  };
}

export const TenancyService = {
  findForLandlord: async (): Promise<Tenancy[]> => {
    const response = await api.get("/landlords/tenancies");
    return response.data?.data || response.data;
  },

  findForTenant: async (): Promise<Tenancy[]> => {
    const response = await api.get("/tenancies/me");
    return response.data?.data || response.data;
  },

  findOne: async (id: string): Promise<Tenancy> => {
    const response = await api.get(`/tenancies/${id}`);
    return response.data?.data || response.data;
  },

  requestMoveOut: async (id: string): Promise<Tenancy> => {
    const response = await api.post(`/tenancies/${id}/request-move-out`);
    return response.data?.data || response.data;
  },

  approveMoveOut: async (id: string): Promise<Tenancy> => {
    const response = await api.post(`/tenancies/${id}/approve-move-out`);
    return response.data?.data || response.data;
  },
};
