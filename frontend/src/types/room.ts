export enum RoomStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
}

export interface RoomAmenity {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  propertyId: string;
  title: string; // e.g. "Phòng 101"
  description?: string;
  pricePerMonth: number;
  depositAmount: number;
  maxCapacity: number;
  sizeSqM?: number;
  status: RoomStatus;
  amenities: RoomAmenity[];
  createdAt: string;
  updatedAt: string;
}
