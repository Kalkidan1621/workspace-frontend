export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";

export type JobPriority =
  | "low"
  | "medium"
  | "high";

export type JobStatus =
  | "active"
  | "inactive";


export interface Job {
  id: number;

  title: string;

  employer: string | null;

  department: string;

  location: string;

  employmentType: EmploymentType;

  workingTime: string | null;

  experience: string | null;

  educationalQualification:
    | string
    | null;

  openingDate: string | null;

  closingDate: string | null;

  salary: string | null;

  priority: JobPriority;

  description: string;

  status: JobStatus;

  createdAt: string;

  updatedAt: string;
}


export interface CreateJobData {
  title: string;

  employer: string;

  department: string;

  location: string;

  employmentType: EmploymentType;

  workingTime: string;

  experience: string;

  educationalQualification: string;

  openingDate: string;

  closingDate: string;

  salary: string;

  priority: JobPriority;

  description: string;

  status?: JobStatus;
}


export interface JobsResponse {
  data: Job[];
}


export interface JobResponse {
  data: Job;
}