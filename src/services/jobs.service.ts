import type {
  CreateJobData,
  JobResponse,
  JobsResponse,
} from "@/types/jobs";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";



async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const errorData =
      await response.json();

    if (
      errorData &&
      typeof errorData === "object" &&
      "message" in errorData &&
      typeof errorData.message === "string"
    ) {
      return errorData.message;
    }

  } catch {
    // The response body was not valid JSON.
  }

  return (
    `Request failed with status ` +
    `${response.status}.`
  );
}


// Get all active jobs
export async function getJobs():
  Promise<JobsResponse> {

  const response =
    await fetch(
      `${API_URL}/jobs`,
      {
        method: "GET",
        credentials: "include",
      }
    );

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
      );

    console.error(
      "Failed to fetch jobs:",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        message,
      },
    );

    throw new Error(
      message,
    );
  }

  return response.json();
}


// Get one job by ID
export async function getJobById(
  jobId: number,
): Promise<JobResponse> {

  const response =
    await fetch(
      `${API_URL}/jobs/${jobId}`,
      {
       method: "GET",
       credentials: "include",
      }
    );

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
      );

    console.error(
      "Failed to fetch job:",
      {
        jobId,

        status:
          response.status,

        statusText:
          response.statusText,

        message,
      },
    );

    throw new Error(
      message,
    );
  }

  return response.json();
}


// Create a new job
export async function createJob(
  data: CreateJobData,
): Promise<JobResponse> {

  const response =
    await fetch(
      `${API_URL}/jobs`,
      {
        method:
          "POST",
        credentials:"include",
        
        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            data,
          ),
      },
    );


  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
      );

    console.error(
      "Failed to create job:",
      {
        status:
          response.status,

        statusText:
          response.statusText,

        message,
      },
    );

    throw new Error(
      message,
    );
  }


  return response.json();
}