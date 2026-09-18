export type UserRole =
  | "CANDIDATE"
  | "RECRUITER"
  | "HIRING_MANAGER"
  | "ADMIN"
  | "SUPER_ADMIN";

export type NavigationItem = {
  label: string;
  to: string;
};

export const navigationByRole: Record<
  UserRole,
  NavigationItem[]
> = {
  // Candidate side — keep existing functionality
  CANDIDATE: [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "Jobs",
      to: "/jobs",
    },
    {
      label: "My Applications",
      to: "/candidate/applications",
    },
    {
      label: "My Profile",
      to: "/candidate/profile",
    },
  ],

  // Recruiter side — keep existing functionality
  RECRUITER: [
    {
      label: "Dashboard",
      to: "/recruiter",
    },
    {
      label: "Jobs",
      to: "/jobs",
    },
    {
      label: "Candidates",
      to: "/recruiter/candidates",
    },
    {
      label: "Applications",
      to: "/admin/applications",
    },
    {
      label: "Screening",
      to: "/admin/screening",
    },
  ],

  // Hiring Manager side — keep existing functionality
  HIRING_MANAGER: [
    {
      label: "Dashboard",
      to: "/hiring-manager",
    },
    {
      label: "Candidates",
      to: "/hiring-manager/candidates",
    },
    {
      label: "Applications",
      to: "/admin/applications",
    },
    {
      label: "Screening",
      to: "/admin/screening",
    },
  ],

  // ========================================
  // ADMIN SIDE
  // ========================================

  ADMIN: [
    {
      label: "Dashboard",
      to: "/admin",
    },
    {
      label: "Jobs",
      to: "/admin/jobs",
    },
    {
      label: "Candidates",
      to: "/admin/candidates",
    },
    {
      label: "Employers",
      to: "/admin/employers",
    },
    {
      label: "Users",
      to: "/admin/users",
    },
  ],

  // ========================================
  // SUPER ADMIN
  // ========================================

  SUPER_ADMIN: [
    {
      label: "Dashboard",
      to: "/admin",
    },
    {
      label: "Jobs",
      to: "/admin/jobs",
    },
    {
      label: "Candidates",
      to: "/admin/candidates",
    },
    {
      label: "Employers",
      to: "/admin/employers",
    },
    {
      label: "Users",
      to: "/admin/users",
    },
  ],
};