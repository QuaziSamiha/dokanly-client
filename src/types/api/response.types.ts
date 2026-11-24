/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IGenericErrorResponse {
  statusCode: number;
  message: string;
  errorMessages: string[] | string;
  timestamp?: string;
  path?: string;
}

export interface ResponseSuccessType {
  statusCode: number;
  success: boolean;
  message: string;
  data: unknown;
  meta?: IMeta;
}

export interface ResponseSuccessType1<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: IMeta;
}



export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorMessages: ValidationError[];
  timestamp: string;
  path: string;
}

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};

// export type IGenericErrorResponse = {
//   statusCode: number;
//   message: string;
//   // errorMessages: IGenericErrorMessage[];
//   errorMessages: string[] | string;
//   timestamp?: string;
//   path?: string;
// };

export interface IMeta {
  // limit: number;
  // page: number;
  // total: number;

  totalItems?: number;
  itemCount?: number;
  itemsPerPage?: number;
  totalPages?: number;
  currentPage?: number;
}

// export type ResponseSuccessType = {
//   data: unknown;
//   meta?: IMeta;
//   statusCode: number;
//   success: boolean;
//   message: string;
// };

export type UserInfoByIdProps = {
  userID: number;
  userSid: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  employeeId: string;
  assignedIp: string;
  role: string;
  profileImageName: unknown;
  profileImageUrl: unknown;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: unknown;
  emailVerified: boolean;
  logoUrl?: string;
};

// Category specific types
export type CategoryResponse = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryCreateResponse = ResponseSuccessType & {
  data: CategoryResponse;
};

export interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta: T | null;
}
