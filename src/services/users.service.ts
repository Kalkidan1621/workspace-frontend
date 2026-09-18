import type {
  CreateUserPayload,
  Role,
  RolesResponse,
  UpdateUserPayload,
  User,
  UserResponse,
  UsersResponse,
} from "@/types/users";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ?? "Something went wrong.",
    );
  }

  return data as T;
}

export async function getUsers(
  search = "",
): Promise<UsersResponse> {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  const response = await fetch(
    `${API_URL}/admin/users${query ? `?${query}` : ""}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return handleResponse<UsersResponse>(response);
}

export async function getUserById(
  userId: number,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return handleResponse<UserResponse>(response);
}

export async function getRoles(): Promise<RolesResponse> {
  const response = await fetch(
    `${API_URL}/admin/users/roles`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return handleResponse<RolesResponse>(response);
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return handleResponse<UserResponse>(response);
}

export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return handleResponse<UserResponse>(response);
}

export async function updateUserStatus(
  userId: number,
  isActive: boolean,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive,
      }),
    },
  );

  return handleResponse<UserResponse>(response);
}

export async function updateUserRole(
  userId: number,
  roleId: number,
): Promise<UserResponse> {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/role`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId,
      }),
    },
  );

  return handleResponse<UserResponse>(response);
}

export async function deleteUser(
  userId: number,
): Promise<{
  success: boolean;
  message: string;
}> {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  return handleResponse(response);
}