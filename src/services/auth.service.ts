const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  role: string;
  profileImageUrl: string | null;
  isActive: boolean;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    expiresAt: string;
  };
};

export type CurrentUserResponse = {
  success: boolean;
  message?: string;
  data?: AuthUser;
};

// ================================
// LOGIN
// ================================

export async function login(
  data: LoginInput,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Login failed.",
    );
  }

  return result;
}

// ================================
// CURRENT USER
// ================================

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Authentication required.",
    );
  }

  return data;
}

// ================================
// LOGOUT
// ================================

export async function logout(): Promise<void> {
  const response = await fetch(
    `${API_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const result = await response.json();

    throw new Error(
      result.message ||
        "Logout failed.",
    );
  }
}
export type CandidateRegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function registerCandidate(
  data: CandidateRegisterInput,
) {
  const response =
    await fetch(
      `${API_URL}/auth/candidate/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        body: JSON.stringify(data),
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Registration failed.",
    );
  }

  return result;
}
// ================================
// UPDATE PROFILE PHOTO
// ================================

export async function updateProfilePhoto(
  file: File,
) {
  const formData =
    new FormData();

  formData.append(
    "file",
    file,
  );

  const response =
    await fetch(
      `${API_URL}/auth/profile/photo`,
      {
        method: "POST",

        credentials: "include",

        body: formData,
      },
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update profile photo.",
    );
  }

  return result;
}
// ================================
// UPDATE PROFILE
// ================================

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function updateProfile(
  data: UpdateProfileInput,
) {
  const response = await fetch(
    `${API_URL}/auth/profile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update profile.",
    );
  }

  return result;
}

// ================================
// CHANGE PASSWORD
// ================================

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export async function changePassword(
  data: ChangePasswordInput,
) {
  const response = await fetch(
    `${API_URL}/auth/profile/password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to change password.",
    );
  }

  return result;
}
