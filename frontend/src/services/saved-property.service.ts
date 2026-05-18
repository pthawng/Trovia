import { api } from "../lib/axios";
import type { Property } from "./property.service";

export const SavedPropertyService = {
  save: async (propertyId: string): Promise<{ tenantId: string; propertyId: string }> => {
    const response = await api.post(`/saved-properties/${propertyId}`);
    return response.data?.data || response.data;
  },

  unsave: async (propertyId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/saved-properties/${propertyId}`);
    return response.data?.data || response.data;
  },

  getSavedListings: async (): Promise<Property[]> => {
    const response = await api.get("/saved-properties");
    return response.data?.data || response.data;
  },
};
