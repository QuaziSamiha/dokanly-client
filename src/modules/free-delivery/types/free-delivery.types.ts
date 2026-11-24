export type FreeDeliveryStatus = "ACTIVE" | "INACTIVE";

/** One status change, with a snapshot of who made it. */
export interface IChangedHistory {
  status: FreeDeliveryStatus;
  updatedBy: number;
  updatedByName: string;
  updatedByRole: string;
  updatedAt: string;
}

/**
 * A free delivery setting. Guests and customers (GET active-free-delivery)
 * only get id, minOrderAmount and description; admins get every field.
 */
export interface IFreeDelivery {
  id: number;
  sid: string;
  minOrderAmount: number;
  status: FreeDeliveryStatus;
  description?: string | null;
  createdAt: string;
  updatedAt?: string;
  createdById: number | null;
  createdByName: string | null;
  createdByRole: string | null;
  changeHistory?: IChangedHistory[];
}
