import type {
  Application,
  ApplicationResponse,
  ApplicationsResponse,
  ApplicationStatsResponse,
  ApplicationStatus,
  CreateApplicationData,
} from "@/types/applications";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


// ========================================
// CREATE APPLICATION
// Candidate submits application
// ========================================

export async function createApplication(
  data: CreateApplicationData,
): Promise<ApplicationResponse> {
  const formData = new FormData();

  formData.append(
    "jobId",
    String(data.jobId),
  );

  formData.append(
    "fullName",
    data.fullName,
  );

  formData.append(
    "email",
    data.email,
  );

  formData.append(
    "phone",
    data.phone,
  );

  formData.append(
    "resume",
    data.resume,
  );

  const response = await fetch(
    `${API_URL}/applications`,
    {
      method: "POST",

      credentials: "include",

      body: formData,
    },
  );

  let result: ApplicationResponse | {
    success?: boolean;
    message?: string;
    errors?: unknown;
  };

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server.",
    );
  }

  if (!response.ok) {
    console.error(
      "Application API error:",
      result,
    );

    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "Failed to submit application.",
    );
  }

  return result as ApplicationResponse;
}

// ========================================
// GET ALL APPLICATIONS
// Admin / Recruiter / Hiring Manager
// ========================================

export async function getAllApplications(): Promise<ApplicationsResponse> {
  const response = await fetch(
    `${API_URL}/applications`,
    {
      method: "GET",

      credentials: "include",
    },
  );

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server.",
    );
  }

  if (!response.ok) {
    const errorData = result as {
      message?: string;
    };

    throw new Error(
      errorData.message ||
        "Failed to load applications.",
    );
  }

  return result as ApplicationsResponse;
}

// ========================================
// GET APPLICATION BY ID
// ========================================

export async function getApplicationById(
  applicationId: number,
): Promise<Application> {
  if (
    !Number.isInteger(applicationId) ||
    applicationId <= 0
  ) {
    throw new Error(
      "Invalid application ID.",
    );
  }

  const response = await fetch(
    `${API_URL}/applications/${applicationId}`,
    {
      method: "GET",

      credentials: "include",
    },
  );

  let result: ApplicationResponse | {
    success?: boolean;
    message?: string;
  };

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server.",
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to load application.",
    );
  }

  if (
    !("data" in result) ||
    !result.data
  ) {
    throw new Error(
      "Application data was not returned.",
    );
  }

  return result.data;
}

// ========================================
// UPDATE APPLICATION STATUS
// ========================================

/**
 * Candidate gets own applications
 */
export async function getMyApplications(): Promise<
  ApplicationsResponse
> {
  const response = await fetch(
    `${API_URL}/applications/candidate/me`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message =
      "Failed to load your applications.";

    try {
      const errorData =
        await response.json();

      if (
        errorData &&
        typeof errorData.message ===
          "string"
      ) {
        message = errorData.message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getCandidateApplicationInterview(
  applicationId: number,
) {
  const response = await fetch(
    `${API_URL}/applications/candidate/me/${applicationId}/interview`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load interview details.",
    );
  }

  return data.data ?? null;
}

export async function updateApplicationStatus(
  applicationId: number,
  status: ApplicationStatus,
): Promise<ApplicationResponse> {
  if (
    !Number.isInteger(applicationId) ||
    applicationId <= 0
  ) {
    throw new Error(
      "Invalid application ID.",
    );
  }

  const response = await fetch(
    `${API_URL}/applications/${applicationId}/status`,
    {
      method: "PATCH",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        status,
      }),
    },
  );

  let result: ApplicationResponse | {
    success?: boolean;
    message?: string;
  };

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server.",
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update application status.",
    );
  }

  return result as ApplicationResponse;
}

// ========================================
// GET APPLICATIONS BY JOB
// ========================================

export async function getApplicationsByJobId(
  jobId: number,
): Promise<ApplicationsResponse> {
  if (
    !Number.isInteger(jobId) ||
    jobId <= 0
  ) {
    throw new Error(
      "Invalid job ID.",
    );
  }

  const response = await fetch(
    `${API_URL}/applications/job/${jobId}`,
    {
      method: "GET",

      credentials: "include",
    },
  );

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server.",
    );
  }

  if (!response.ok) {
    const errorData = result as {
      message?: string;
    };

    throw new Error(
      errorData.message ||
        "Failed to load applications.",
    );
  }

  return result as ApplicationsResponse;
}

// ========================================
// GET APPLICATION STATISTICS
// ========================================

export async function getApplicationStats(): Promise<ApplicationStatsResponse> {
  const response = await fetch(
    `${API_URL}/applications/stats`,
    {
      method: "GET",

      credentials: "include",
    },
  );

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      "Invalid response from server.",
    );
  }

  if (!response.ok) {
    const errorData = result as {
      message?: string;
    };

    throw new Error(
      errorData.message ||
        "Failed to load application statistics.",
    );
  }

  return result as ApplicationStatsResponse;
}