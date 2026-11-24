export interface IDeliveryPricing {
  id: number;
  sid: string;
  region: string;
  deliveryMethod: string;
  baseCharge: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
