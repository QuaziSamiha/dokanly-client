export interface IAddress {
  id: number;
  userId: number;
  type?: string | null;
  street: string;
  city: string;
  state?: string | null;
  zipCode: string;
  country?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
