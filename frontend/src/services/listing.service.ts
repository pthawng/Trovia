import { api } from "../lib/axios";
import type { Property, PropertyType } from "./property.service";

export interface SearchListingsFilters {
  city?: string;
  district?: string;
  ward?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchListingsResponse {
  listings: Property[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const ListingService = {
  search: async (filters: SearchListingsFilters): Promise<SearchListingsResponse> => {
    const response = await api.get("/listings", { params: filters });
    return response.data?.data || response.data;
  },
};
