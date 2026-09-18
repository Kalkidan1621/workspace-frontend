export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "shortlisted"
  | "on_hold"
  | "interview"
  | "hiring_decision"
  | "ready_for_hire"
  | "hired";
  
export type Application = {
  id: number;

  candidateId: number | null;

  candidateFirstName: string | null;
  candidateLastName: string | null;
  candidateEmail: string | null;

  jobId: number;
  jobTitle: string | null;

  fullName: string;
  email: string;
  phone: string;

  resumeName: string;
  resumeUrl: string | null;

  status: ApplicationStatus;

  createdAt: string;
  updatedAt: string;
};

export type ApplicationsResponse = {
  success: boolean;
  message?: string;
  data: Application[];
};

export type ApplicationResponse = {
  success: boolean;
  message: string;
  data: Application;
};

export type ApplicationStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type ApplicationStatsResponse = {
  success: boolean;
  data: ApplicationStats;
};

export type CreateApplicationData = {
  jobId: number;
  fullName: string;
  email: string;
  phone: string;
  resume: File;
};