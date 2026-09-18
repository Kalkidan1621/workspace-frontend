import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  getJobById,
} from "@/services/jobs.service";

import {
  getApplicationsByJobId,
} from "@/services/applications.service";

import type {
  Job,
} from "@/types/jobs";

import type {
  Application,
} from "@/types/applications";

import "@/styles/admin-job-details.css";

import "@/styles/admin-job-details.css";


type JobTab =
  | "overview"
  | "details"
  | "candidates"
  | "employer";


export const Route = createFileRoute(
  "/admin/jobs/$jobId",
)({
  component: AdminJobDetailsPage,
});


function AdminJobDetailsPage() {
  const {
    jobId,
  } = Route.useParams();

  const navigate = useNavigate();

  const numericJobId = Number(jobId);

  const [job, setJob] =
    useState<Job | null>(null);

  const [candidates, setCandidates] =
    useState<Application[]>([]);

  const [activeTab, setActiveTab] =
    useState<JobTab>("overview");

  const [loading, setLoading] =
    useState(true);

  const [candidatesLoading, setCandidatesLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [candidateError, setCandidateError] =
    useState<string | null>(null);


  /*
   * =====================================================
   * LOAD JOB
   * =====================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadJob() {
      try {
        setLoading(true);
        setError(null);

        if (
          !Number.isInteger(numericJobId) ||
          numericJobId <= 0
        ) {
          throw new Error(
            "Invalid job ID.",
          );
        }

        const response =
          await getJobById(
            numericJobId,
          );

        if (!cancelled) {
          setJob(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to load job:",
          error,
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load job.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [numericJobId]);


  /*
   * =====================================================
   * LOAD REAL CANDIDATES
   *
   * Only applications belonging to this job are loaded.
   * =====================================================
   */

  useEffect(() => {
    if (
      activeTab !== "candidates"
    ) {
      return;
    }

    let cancelled = false;

    async function loadCandidates() {
      try {
        setCandidatesLoading(true);
        setCandidateError(null);

        if (
          !Number.isInteger(numericJobId) ||
          numericJobId <= 0
        ) {
          throw new Error(
            "Invalid job ID.",
          );
        }

        const response =
          await getApplicationsByJobId(
            numericJobId,
          );

        if (!cancelled) {
          setCandidates(
            response.data ?? [],
          );
        }
      } catch (error) {
        console.error(
          "Failed to load candidates:",
          error,
        );

        if (!cancelled) {
          setCandidateError(
            error instanceof Error
              ? error.message
              : "Failed to load candidates.",
          );

          setCandidates([]);
        }
      } finally {
        if (!cancelled) {
          setCandidatesLoading(false);
        }
      }
    }

    loadCandidates();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    numericJobId,
  ]);


  /*
   * =====================================================
   * HELPERS
   * =====================================================
   */

  function formatEmploymentType(
    type: Job["employmentType"],
  ) {
    if (!type) {
      return "Not specified";
    }

    return type
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }


  function formatDate(
    value: string | null | undefined,
  ) {
    if (!value) {
      return "Not specified";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Not specified";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  }


  function formatStatus(
    status: string,
  ) {
    return status
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }


  function getStatusClass(
    status: string,
  ) {
    return status
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }


  function getInitials(
    name: string,
  ) {
    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) {
      return "C";
    }

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[1].charAt(0)
    ).toUpperCase();
  }


  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <main className="admin-job-details-page">
        <div className="admin-job-loading">

          <div className="admin-job-spinner" />

          <p>
            Loading job information...
          </p>

        </div>
      </main>
    );
  }


  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (
    error ||
    !job
  ) {
    return (
      <main className="admin-job-details-page">

        <div className="admin-job-error">

          <h2>
            Unable to load job
          </h2>

          <p>
            {error ??
              "Job was not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/admin/jobs",
              })
            }
          >
            Back to Jobs
          </button>

        </div>

      </main>
    );
  }


  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="admin-job-details-page">

      <div className="admin-job-details-container">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/admin/jobs"
          className="admin-job-back-link"
        >
          ← Back to Jobs
        </Link>


        {/* =================================================
            JOB HEADER
        ================================================= */}

        <section className="admin-job-hero">

          <div className="admin-job-hero-icon">
            💼
          </div>

          <div className="admin-job-hero-content">

            <span className="admin-job-eyebrow">
              JOB POSITION
            </span>

            <h1>
              {job.title}
            </h1>

            <p className="admin-job-meta">

              <span>
                {job.department}
              </span>

              <span>
                •
              </span>

              <span>
                {job.location}
              </span>

            </p>

          </div>

          <span
            className={`admin-job-status admin-job-status-${job.status}`}
          >
            {job.status === "active"
              ? "Active"
              : "Inactive"}
          </span>

        </section>


        {/* =================================================
            TABS
        ================================================= */}

        <nav
          className="admin-job-tabs"
          aria-label="Job sections"
        >

          <button
            type="button"
            className={
              activeTab === "overview"
                ? "admin-job-tab active"
                : "admin-job-tab"
            }
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </button>


          <button
            type="button"
            className={
              activeTab === "details"
                ? "admin-job-tab active"
                : "admin-job-tab"
            }
            onClick={() =>
              setActiveTab("details")
            }
          >
            Details
          </button>


          <button
            type="button"
            className={
              activeTab === "candidates"
                ? "admin-job-tab active"
                : "admin-job-tab"
            }
            onClick={() =>
              setActiveTab("candidates")
            }
          >
            Candidates

            <span className="candidate-count">
              {candidates.length}
            </span>

          </button>


          <button
            type="button"
            className={
              activeTab === "employer"
                ? "admin-job-tab active"
                : "admin-job-tab"
            }
            onClick={() =>
              setActiveTab("employer")
            }
          >
            Employer
          </button>

        </nav>

        {/* =================================================
          OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (

          <section className="job-tab-content">

            <div className="job-section-card">

              <div className="job-card-header">

                <div>

                  <span className="admin-job-eyebrow">
                    JOB INFORMATION
                  </span>

                  <h2>
                    Position Details
                  </h2>

                  <p>
                    Complete information
                    about this position.
                  </p>

                </div>

              </div>


              <div className="job-information-grid">

                <div className="job-information-item">
                  <span>
                    Job Title
                  </span>

                  <strong>
                    {job.title}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Department
                  </span>

                  <strong>
                    {job.department}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Location
                  </span>

                  <strong>
                    {job.location}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Employer
                  </span>

                  <strong>
                    {job.employer ??
                      "Not specified"}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Employment Type
                  </span>

                  <strong>
                    {formatEmploymentType(
                      job.employmentType,
                    )}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Working Time
                  </span>

                  <strong>
                    {job.workingTime ??
                      "Not specified"}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Experience
                  </span>

                  <strong>
                    {job.experience ??
                      "Not specified"}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Educational Qualification
                  </span>

                  <strong>
                    {job.educationalQualification ??
                      "Not specified"}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Opening Date
                  </span>

                  <strong>
                    {formatDate(
                      job.openingDate,
                    )}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Closing Date
                  </span>

                  <strong>
                    {formatDate(
                      job.closingDate,
                    )}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Salary
                  </span>

                  <strong>
                    {job.salary ??
                      "Not specified"}
                  </strong>
                </div>


                <div className="job-information-item">
                  <span>
                    Priority
                  </span>

                  <strong className="priority-value">
                    {job.priority ??
                      "Normal"}
                  </strong>
                </div>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            DETAILS
        ================================================= */}

        {activeTab === "details" && (

          <section className="job-tab-content">

            <div className="job-section-card">

              <div className="job-card-header">

                <div>

                  <span className="admin-job-eyebrow">
                    POSITION OVERVIEW
                  </span>

                  <h2>
                    Job Description
                  </h2>

                  <p>
                    Overview of the position
                    and responsibilities.
                  </p>

                </div>

              </div>


              <div className="job-description">

                {job.description ? (
                  <p>
                    {job.description}
                  </p>
                ) : (
                  <p className="empty-text">
                    No job description
                    available.
                  </p>
                )}

              </div>

            </div>


            {/* QUICK SUMMARY */}

            <div className="job-summary-grid">

              <div className="job-summary-item">

                <span>
                  Employment Type
                </span>

                <strong>
                  {formatEmploymentType(
                    job.employmentType,
                  )}
                </strong>

              </div>


              <div className="job-summary-item">

                <span>
                  Experience
                </span>

                <strong>
                  {job.experience ??
                    "Not specified"}
                </strong>

              </div>


              <div className="job-summary-item">

                <span>
                  Salary
                </span>

                <strong>
                  {job.salary ??
                    "Not specified"}
                </strong>

              </div>


              <div className="job-summary-item">

                <span>
                  Location
                </span>

                <strong>
                  {job.location ??
                    "Not specified"}
                </strong>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            CANDIDATES
        ================================================= */}

        {activeTab === "candidates" && (

          <section className="job-tab-content">

            <div className="job-section-card">

              <div className="job-card-header">

                <div>

                  <span className="admin-job-eyebrow">
                    RECRUITMENT PIPELINE
                  </span>

                  <h2>
                    Candidates
                  </h2>

                  <p>
                    Candidates who applied
                    for this position.
                  </p>

                </div>

                <div className="candidate-total">
                  {candidates.length}{" "}
                  {candidates.length === 1
                    ? "Applicant"
                    : "Applicants"}
                </div>

              </div>


              {/* LOADING */}

              {candidatesLoading && (

                <div className="candidate-loading">

                  <div className="admin-job-spinner" />

                  <p>
                    Loading candidates...
                  </p>

                </div>

              )}


              {/* ERROR */}

              {candidateError && (

                <div className="candidate-error">

                  <strong>
                    Unable to load candidates
                  </strong>

                  <p>
                    {candidateError}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        "overview",
                      )
                    }
                  >
                    Back to Overview
                  </button>

                </div>

              )}


              {/* EMPTY */}

              {!candidatesLoading &&
                !candidateError &&
                candidates.length === 0 && (

                  <div className="candidate-empty">

                    <div className="candidate-empty-icon">
                      ♙
                    </div>

                    <h3>
                      No applications yet
                    </h3>

                    <p>
                      No candidate has
                      applied for this
                      position yet.
                    </p>

                  </div>

                )}


              {/* CANDIDATE TABLE */}

              {!candidatesLoading &&
                !candidateError &&
                candidates.length > 0 && (

                  <div className="candidate-table-wrapper">

                    <table className="candidate-table">

                      <thead>

                        <tr>

                          <th>
                            Candidate
                          </th>

                          <th>
                            Contact
                          </th>

                          <th>
                            Resume
                          </th>

                          <th>
                            Status
                          </th>

                          <th>
                            Applied
                          </th>

                          <th>
                            Action
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {candidates.map(
                          (candidate) => (

                            <tr
                              key={
                                candidate.id
                              }
                            >

                              {/* CANDIDATE */}

                              <td>

                                <div className="candidate-name">

                                  <div className="candidate-avatar">

                                    {getInitials(
                                      candidate.fullName,
                                    )}

                                  </div>


                                  <div>

                                    <Link
                                      to="/admin/applications/$applicationId"
                                      params={{
                                        applicationId:
                                          String(
                                            candidate.id,
                                          ),
                                      }}
                                      className="candidate-name-link"
                                    >
                                      {
                                        candidate.fullName
                                      }
                                    </Link>

                                    <span>
                                      Application #
                                      {
                                        candidate.id
                                      }
                                    </span>

                                  </div>

                                </div>

                              </td>


                              {/* CONTACT */}

                              <td>

                                <div className="candidate-contact">

                                  <span>
                                    {
                                      candidate.email
                                    }
                                  </span>

                                  <span>
                                    {
                                      candidate.phone
                                    }
                                  </span>

                                </div>

                              </td>


                              {/* RESUME */}

                              <td>

                                {candidate.resumeUrl ? (

                                  <a
                                    href={
                                      candidate.resumeUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="candidate-resume-link"
                                  >
                                    📄{" "}
                                    {
                                      candidate.resumeName
                                    }
                                  </a>

                                ) : (

                                  <span className="candidate-resume">
                                    No CV
                                  </span>

                                )}

                              </td>


                              {/* STATUS */}

                              <td>

                                <span
                                  className={`candidate-status candidate-status-${getStatusClass(
                                    candidate.status,
                                  )}`}
                                >
                                  {
                                    formatStatus(
                                      candidate.status,
                                    )
                                  }
                                </span>

                              </td>


                              {/* APPLIED */}

                              <td>

                                <span className="candidate-applied-date">

                                  {formatDate(
                                    candidate.createdAt,
                                  )}

                                </span>

                              </td>


                              {/* ACTION */}

                              <td>

                                <Link
                                  to="/admin/applications/$applicationId"
                                  params={{
                                    applicationId:
                                      String(
                                        candidate.id,
                                      ),
                                  }}
                                  className="candidate-view-button"
                                >
                                  View
                                </Link>

                              </td>

                            </tr>

                          ),
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

            </div>

          </section>

        )}


        {/* =================================================
            EMPLOYER
        ================================================= */}

        {activeTab === "employer" && (

          <section className="job-tab-content">

            <div className="job-section-card">

              <div className="job-card-header">

                <div>

                  <span className="admin-job-eyebrow">
                    ORGANIZATION
                  </span>

                  <h2>
                    Employer Information
                  </h2>

                  <p>
                    Information about the
                    organization offering
                    this position.
                  </p>

                </div>

              </div>


              <div className="employer-profile">

                <div className="employer-logo">
                  {getInitials(
                    job.employer ??
                      "Employer",
                  )}
                </div>

                <div>

                  <h2>
                    {job.employer ??
                      "Employer not specified"}
                  </h2>

                  <p>
                    Employer associated
                    with this job position.
                  </p>

                </div>

                {job.employer && (
                  <span className="employer-verified">
                    ✓ Employer
                  </span>
                )}

              </div>


              <div className="employer-information-grid">

                <div>

                  <span>
                    Company Name
                  </span>

                  <strong>
                    {job.employer ??
                      "Not specified"}
                  </strong>

                </div>


                <div>

                  <span>
                    Position
                  </span>

                  <strong>
                    {job.title}
                  </strong>

                </div>


                <div>

                  <span>
                    Department
                  </span>

                  <strong>
                    {job.department}
                  </strong>

                </div>


                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {job.location ??
                      "Not specified"}
                  </strong>

                </div>

              </div>

            </div>

          </section>

        )}

      </div>

    </main>
  );
}