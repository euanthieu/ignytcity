export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  DEVELOPER: "DEVELOPER",
  ADMIN: "ADMIN",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  SELLER: "SELLER",
  BUYER: "BUYER",
} as const;

export type RoleName = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export interface UserRole {
  id: string;
  roleName: RoleName | string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  avatarFileId: string | null;
  accountStatus: string;
  isEmailVerified: boolean;
  isOnBoarding: boolean;
  countryCode: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: UserRole[];
}

export interface UsersListData {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
