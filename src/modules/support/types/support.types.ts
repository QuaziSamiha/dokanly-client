export interface IAdmin {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export type SupportPolicyType =
  | "TERMS_CONDITION"
  | "SHIPPING_DELIVERY"
  | "RETURN_EXCHANGE"
  | "PRIVACY_POLICY";

export interface ISupport {
  id: number;
  sid: string;
  type: SupportPolicyType;
  status: "ACTIVE" | "INACTIVE";
  description: string;
  createdAt: string;
  updatedAt?: string;
  createdBy: IAdmin;
  updatedBy?: IAdmin;
}
