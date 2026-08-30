import { z } from "zod";

export const UserRoleSchema = z.object({
  id: z.string(),
  roleName: z.string(),
  description: z.string().nullable().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(UserRoleSchema).optional(),
});

export const UsersListDataSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const UsersApiResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: UsersListDataSchema,
});

export const CatalogRoleSchema = z.object({
  id: z.string().optional(),
  roleName: z.string(),
  description: z.string().nullable().optional(),
  permissionCodes: z.array(z.string()).default([]),
});

export const RolesCatalogResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: z.array(CatalogRoleSchema),
});

export const PermissionSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

export const PermissionsResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: z.array(PermissionSchema),
});

export const UserResponseSchema = z.object({
  status: z.string().optional(),
  statusCode: z.number().optional(),
  data: UserSchema,
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type UsersListData = z.infer<typeof UsersListDataSchema>;
export type UsersApiResponse = z.infer<typeof UsersApiResponseSchema>;
export type CatalogRole = z.infer<typeof CatalogRoleSchema>;
export type RolesCatalogResponse = z.infer<typeof RolesCatalogResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type PermissionsResponse = z.infer<typeof PermissionsResponseSchema>;
