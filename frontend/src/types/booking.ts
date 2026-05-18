import { User } from "./user";
import { Property } from "./property";
import { Room } from "./room";

export enum BookingRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface BookingRequest {
  id: string;
  tenantId: string;
  tenant?: User;
  propertyId: string;
  property?: Property;
  roomId: string;
  room?: Room;
  proposedMoveInDate: string;
  note?: string;
  status: BookingRequestStatus;
  createdAt: string;
  updatedAt: string;
}
