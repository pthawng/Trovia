import { api } from "../lib/axios";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH";
export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  propertyId: string;
  roomId: string | null;
  title: string;
  description: string;
  images: string[];
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
  };
  room: {
    id: string;
    title: string;
  } | null;
  tenant: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    phone: string | null;
  };
}

export interface CreateMaintenanceDto {
  title: string;
  description: string;
  propertyId: string;
  roomId?: string;
  priority?: MaintenancePriority;
  images?: string[];
}

export const MaintenanceService = {
  create: async (dto: CreateMaintenanceDto): Promise<MaintenanceRequest> => {
    const response = await api.post("/maintenance", dto);
    return response.data?.data || response.data;
  },

  findForLandlord: async (): Promise<MaintenanceRequest[]> => {
    const response = await api.get("/landlords/maintenance");
    return response.data?.data || response.data;
  },

  findForTenant: async (): Promise<MaintenanceRequest[]> => {
    const response = await api.get("/maintenance/tenant");
    return response.data?.data || response.data;
  },

  updateStatus: async (id: string, status: MaintenanceStatus): Promise<MaintenanceRequest> => {
    const response = await api.patch(`/maintenance/${id}/status`, { status });
    return response.data?.data || response.data;
  },

  updateDetails: async (
    id: string,
    data: { status?: MaintenanceStatus; assignedTo?: string; comment?: string }
  ): Promise<MaintenanceRequest> => {
    const response = await api.patch(`/maintenance/${id}`, data);
    return response.data?.data || response.data;
  },
};
