import { api } from "../lib/axios";

export interface Tenancy {
  id: string;
  contractId: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED" | "TERMINATED";
  createdAt: string;
  updatedAt: string;
  property: {
    title: string;
    address: string;
  };
  room: {
    title: string;
    roomNumber: string | null;
  };
  tenant: {
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
};
