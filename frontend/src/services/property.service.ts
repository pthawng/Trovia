import { api } from "../lib/axios";

export type PropertyType = "BOARDING_HOUSE" | "APARTMENT" | "HOUSE" | "STUDIO" | "DORMITORY";
export type PropertyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  order: number;
  createdAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
}

export interface PropertyAmenity {
  propertyId: string;
  amenityId: string;
  amenity: Amenity;
}

export interface Room {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  price: number;
  area: number;
  deposit: number;
  capacity: number;
  isAvailable: boolean;
  roomNumber?: string | null;
  floor?: number | null;
  status?: string | null;
  genderRestriction?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude: number | null;
  longitude: number | null;
  type: PropertyType;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images: PropertyImage[];
  rooms: Room[];
  propertyAmenities?: PropertyAmenity[];
  totalFloors: number;
  totalUnits: number;
  hasParking: boolean;
  utilities: string | null;
  rules: string | null;
  landlord?: {
    status?: string;
    user: {
      fullName: string;
      avatarUrl: string | null;
      phone: string | null;
    };
  };
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude?: number;
  longitude?: number;
  type: PropertyType;
  status?: PropertyStatus;
  images?: string[];
  amenities?: string[];
  totalFloors?: number;
  totalUnits?: number;
  hasParking?: boolean;
  utilities?: string;
  rules?: string;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  type?: PropertyType;
  status?: PropertyStatus;
  images?: string[];
  amenities?: string[];
  totalFloors?: number;
  totalUnits?: number;
  hasParking?: boolean;
  utilities?: string;
  rules?: string;
}

export const PropertyService = {
  create: async (dto: CreatePropertyDto): Promise<Property> => {
    const response = await api.post("/properties", dto);
    return response.data?.data || response.data;
  },

  findAll: async (filters?: { landlordId?: string; status?: PropertyStatus }): Promise<Property[]> => {
    const response = await api.get("/properties", { params: filters });
    return response.data?.data || response.data;
  },

  findMyProperties: async (): Promise<Property[]> => {
    const response = await api.get("/properties/me");
    return response.data?.data || response.data;
  },

  findOne: async (id: string, userId?: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}`, {
      params: userId ? { userId } : undefined,
    });
    return response.data?.data || response.data;
  },

  update: async (id: string, dto: UpdatePropertyDto): Promise<Property> => {
    const response = await api.patch(`/properties/${id}`, dto);
    return response.data?.data || response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/properties/${id}`);
    return response.data?.data || response.data;
  },

  publish: async (id: string): Promise<Property> => {
    const response = await api.post(`/properties/${id}/publish`);
    return response.data?.data || response.data;
  },

  getAmenities: async (): Promise<Amenity[]> => {
    const response = await api.get("/properties/amenities");
    return response.data?.data || response.data;
  },
};
