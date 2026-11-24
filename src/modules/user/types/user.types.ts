export interface IUser {
  id: number;
  sid: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  authProvider: "EMAIL" | "GOOGLE" | "FACEBOOK" | "APPLE";
  providerId?: string | null;
  emailVerified: boolean;
  profileImageName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  assignedIp?: string | null;
  status:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "ARCHIVED"
    | "PENDING_VERIFICATION";
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  loginAttempts: number;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerifiedAt?: string | null;
}
