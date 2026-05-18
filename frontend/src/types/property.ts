import { User } from "./user";
import { Room } from "./room";

export enum PropertyStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface PropertyImage {
  id: string;
  url: string;
  isFeatured: boolean;
}

export interface PropertyAmenity {
  id: string;
  name: string; // e.g. "Wifi", "Parking", "Security"
  icon?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  ward?: string;
  district: string;
  city: string;
  status: PropertyStatus;
  landlordId: string;
  landlord?: User;
  images: PropertyImage[];
  amenities: PropertyAmenity[];
  rooms?: Room[];
  createdAt: string;
  updatedAt: string;
}
