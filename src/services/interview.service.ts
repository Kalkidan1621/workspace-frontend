const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


export type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export type Interview = {
  id: number;

  applicationId: number;

  interviewType: string;

  scheduledAt: string;

  location: string | null;

  notes: string | null;

  status: InterviewStatus;

  interviewerId: number | null;

  interviewerFirstName:
    | string
    | null;

  interviewerLastName:
    | string
    | null;

  createdAt: string;

  updatedAt: string;
};

export type Interviewer = {
  id: number;

  firstName: string;

  lastName: string;

  email: string;

  roleId: number;

  roleName:
    | "RECRUITER"
    | "HIRING_MANAGER";

  isActive: boolean;
};

export type CreateInterviewInput = {
  interviewType: string;

  scheduledAt: string;

  location?: string;

  interviewerId?: number;

  notes?: string;
};

/**
 * Get available interviewers.
 *
 * Only active Recruiters and Hiring Managers
 * are returned by the backend.
 */
export async function getInterviewers(): Promise<
  Interviewer[]
> {
  const response = await fetch(
    `${API_URL}/admin/users/interviewers`,
    {
      method: "GET",

      credentials: "include",
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load interviewers.",
    );
  }

  return data.data ?? [];
}

/**
 * Get interview for application.
 */
export async function getApplicationInterview(
  applicationId: number,
): Promise<Interview | null> {
  const response = await fetch(
    `${API_URL}/hiring/interviews/application/${applicationId}`,
    {
      method: "GET",

      credentials: "include",
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load interview.",
    );
  }

  return data.data ?? null;
}

/**
 * Create interview.
 */
export async function createInterview(
  applicationId: number,
  input: CreateInterviewInput,
): Promise<Interview> {
  const response = await fetch(
    `${API_URL}/hiring/interviews/application/${applicationId}`,
    {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(input),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to schedule interview.",
    );
  }

  return data.data as Interview;
}

/**
 * Update interview status.
 */
export async function updateInterviewStatus(
  interviewId: number,
  status:
    | "completed"
    | "cancelled"
    | "no_show",
): Promise<Interview> {
  const response = await fetch(
    `${API_URL}/hiring/interviews/${interviewId}/status`,
    {
      method: "PATCH",

      credentials: "include",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    },
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update interview status.",
    );
  }

  return data.data as Interview;
}