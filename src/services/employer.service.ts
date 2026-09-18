const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type Employer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EmployerResponse = {
  success: boolean;
  message?: string;
  data: Employer;
};

type EmployersResponse = {
  success: boolean;
  message?: string;
  data: Employer[];
};

export type CreateEmployerInput = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
};

export type UpdateEmployerInput =
  Partial<CreateEmployerInput>;

export async function getAllEmployers(): Promise<EmployersResponse> {
  const response = await fetch(`${API_URL}/employers`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load employers.",
    );
  }

  return data;
}

export async function getEmployerById(
  id: number,
): Promise<EmployerResponse> {
  const response = await fetch(
    `${API_URL}/employers/${id}`,
    {
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load employer.",
    );
  }

  return data;
}

export async function createEmployer(
  input: CreateEmployerInput,
): Promise<EmployerResponse> {
  const response = await fetch(
    `${API_URL}/employers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create employer.",
    );
  }

  return data;
}

export async function updateEmployer(
  id: number,
  input: UpdateEmployerInput,
): Promise<EmployerResponse> {
  const response = await fetch(
    `${API_URL}/employers/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update employer.",
    );
  }

  return data;
}

export async function deleteEmployer(
  id: number,
): Promise<{
  success: boolean;
  message?: string;
}> {
  const response = await fetch(
    `${API_URL}/employers/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete employer.",
    );
  }

  return data;
}