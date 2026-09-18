export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  roleName: string | null;
  roleDescription?: string | null;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Role = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
};

export type UsersResponse = {
  success: boolean;
  data: User[];
  message?: string;
};

export type UserResponse = {
  success: boolean;
  data: User;
  message?: string;
};

export type RolesResponse = {
  success: boolean;
  data: Role[];
  message?: string;
};