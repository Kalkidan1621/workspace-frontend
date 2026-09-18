import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  getMyApplications,
  getCandidateApplicationInterview,
} from "@/services/applications.service";

import type {
  Application,
} from "@/types/applications";

import "@/styles/candidate-applications.css";

export const Route = createFileRoute(
  "/candidate/applications",
)({
  component:
    CandidateApplicationsPage,
});

type InterviewStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

type CandidateInterview = {
  id: number;
  applicationId: number;
  interviewType: string;
  scheduledAt: string;
  location: string | null;
  notes: string | null;
  status: InterviewStatus;
  interviewerId: number | null;
  interviewerFirstName: string | null;
  interviewerLastName: string | null;
};

const progressSteps = [
  {
    key: "applied",
    label: "Applied",
  },
  {
    key: "screening",
    label: "Screening",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
  },
  {
    key: "interview",
    label: "Interview",
  },
  {
    key: "hiring_decision",
    label: "Hiring Decision",
  },
  {
    key: "hired",
    label: "Hired",
  },
] as const;

function CandidateApplicationsPage() {
  const [
    applications,
    setApplications,
  ] = useState<Application[]>([]);

  const [
    interviews,
    setInterviews,
  ] = useState<
    Record<number, CandidateInterview | null>
  >({});

  const [
    expandedApplication,
    setExpandedApplication,
  ] = useState<number | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    interviewLoading,
    setInterviewLoading,
  ] = useState<number | null>(null);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getMyApplications();

      setApplications(
        response.data ?? [],
      );
    } catch (error) {
      console.error(
        "Failed to load applications:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your applications.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(
    application: Application,
  ) {
    const applicationId =
      application.id;

    if (
      expandedApplication ===
      applicationId
    ) {
      setExpandedApplication(null);
      return;
    }

    setExpandedApplication(
      applicationId,
    );

    /*
     * Only load interview information
     * when the candidate opens details.
     *
     * This avoids unnecessary requests
     * for every application.
     */
    if (
      application.status !== "interview" &&
      application.status !== "hiring_decision" &&
      application.status !== "ready_for_hire" &&
      application.status !== "hired"
    ) {
      return;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        interviews,
        applicationId,
      )
    ) {
      return;
    }

    try {
      setInterviewLoading(
        applicationId,
      );

      const interview =
        await getCandidateApplicationInterview(
          applicationId,
        );

      setInterviews(
        (current) => ({
          ...current,
          [applicationId]:
            interview,
        }),
      );
    } catch (error) {
      console.error(
        "Failed to load interview:",
        error,
      );

      setInterviews(
        (current) => ({
          ...current,
          [applicationId]:
            null,
        }),
      );
    } finally {
      setInterviewLoading(null);
    }
  }

  function formatStatus(
    status: string,
  ) {
    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }

  function formatDate(
    date: string,
  ) {
    return new Date(
      date,
    ).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );
  }

  function formatInterviewDate(
    date: string,
  ) {
    return new Date(
      date,
    ).toLocaleString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      },
    );
  }

  function getProgressIndex(
    status: Application["status"],
  ) {
    switch (status) {
      case "pending":
      case "approved":
      case "rejected":
        return status === "rejected"
          ? 1
          : 0;

      case "shortlisted":
        return 2;

      case "interview":
        return 3;

      case "hiring_decision":
      case "ready_for_hire":
        return 4;

      case "hired":
        return 5;

      default:
        return 0;
    }
  }

  function getInterviewerName(
    interview: CandidateInterview,
  ) {
    const name = [
      interview.interviewerFirstName,
      interview.interviewerLastName,
    ]
      .filter(Boolean)
      .join(" ");

    return name || "Assigned interviewer";
  }

  function getInterviewStatusLabel(
    status: InterviewStatus,
  ) {
    return formatStatus(status);
  }

  if (loading) {
    return (
      <main className="candidate-applications-page">
        <section className="candidate-applications-container">
          <div className="candidate-loading">
            <div className="candidate-spinner" />

            <p>
              Loading your applications...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="candidate-applications-page">
      <section className="candidate-applications-container">

        {/* PAGE HEADER */}

        <header className="candidate-applications-header">
          <div>
            <p className="candidate-eyebrow">
              CANDIDATE PORTAL
            </p>

            <h1>
              My Applications
            </h1>

            <p>
              Track the progress of your
              applications and view
              interview details.
            </p>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div
            className="candidate-error"
            role="alert"
          >
            <strong>
              Unable to load applications
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={loadApplications}
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          applications.length === 0 && (
            <div className="candidate-empty">
              <div className="candidate-empty-icon">
                📄
              </div>

              <h2>
                No applications yet
              </h2>

              <p>
                You have not submitted
                any job applications yet.
              </p>

              
            </div>
          )}

        {/* APPLICATIONS */}

        {applications.length > 0 && (
          <div className="candidate-applications-list">

            {applications.map(
              (application) => {
                const isExpanded =
                  expandedApplication ===
                  application.id;

                const progressIndex =
                  getProgressIndex(
                    application.status,
                  );

                const interview =
                  interviews[
                    application.id
                  ];

                const isInterviewLoading =
                  interviewLoading ===
                  application.id;

                return (
                  <article
                    key={application.id}
                    className={`candidate-application-card ${
                      isExpanded
                        ? "expanded"
                        : ""
                    }`}
                  >

                    {/* APPLICATION HEADER */}

                    <div className="candidate-application-main">

                      <div className="candidate-application-icon">
                        {(
                          application.jobTitle ??
                          "J"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="candidate-application-info">

                        <h2>
                          {application.jobTitle ??
                            `Job #${application.jobId}`}
                        </h2>

                        <p>
                          Application submitted
                        </p>

                        <span>
                          {formatDate(
                            application.createdAt,
                          )}
                        </span>

                      </div>

                      <span
                        className={`candidate-status-badge ${application.status}`}
                      >
                        {formatStatus(
                          application.status,
                        )}
                      </span>

                    </div>

                    {/* APPLICATION SUMMARY */}

                    <div className="candidate-application-details">

                      <div>
                        <span>
                          Application Date
                        </span>

                        <strong>
                          {formatDate(
                            application.createdAt,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Current Status
                        </span>

                        <strong>
                          {formatStatus(
                            application.status,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Resume
                        </span>

                        <strong>
                          {application.resumeName}
                        </strong>
                      </div>

                    </div>

                    {/* PROGRESS */}

                    <div className="candidate-progress-section">

                     <div className="candidate-progress-header">
                        <span>Application Progress</span>
                     </div>

                      <div className="candidate-progress">

                        {progressSteps.map(
                          (
                            step,
                            index,
                          ) => {
                            const completed =
                              index <=
                              progressIndex;

                            return (
                              <div
                                key={
                                  step.key
                                }
                                className={`candidate-progress-step ${
                                  completed
                                    ? "completed"
                                    : ""
                                } ${
                                  index ===
                                  progressIndex
                                    ? "current"
                                    : ""
                                }`}
                              >
                                <div className="candidate-progress-dot">
                                  {completed
                                    ? "✓"
                                    : ""}
                                </div>

                                <span>
                                  {step.label}
                                </span>
                              </div>
                            );
                          },
                        )}

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="candidate-application-actions">

                      {application.resumeUrl && (
                        <a
                          href={
                            application.resumeUrl
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="candidate-view-cv"
                        >
                          View CV
                        </a>
                      )}

                      <button
                        type="button"
                        className="candidate-view-details"
                        onClick={() =>
                          handleViewDetails(
                            application,
                          )
                        }
                      >
                        {isExpanded
                          ? "Hide Details"
                          : "View Details"}

                        <span>
                          {isExpanded
                            ? "↑"
                            : "→"}
                        </span>
                      </button>

                    </div>

                    {/* DETAILS */}

                    {isExpanded && (
                      <div className="candidate-application-expanded">

                        {/* APPLICATION INFORMATION */}

                        <section className="candidate-detail-section">

                          <div className="candidate-detail-section-heading">
                            <div>
                              <p>
                                APPLICATION
                              </p>

                              <h3>
                                Application Details
                              </h3>
                            </div>
                          </div>

                          <div className="candidate-detail-grid">

                            <div>
                              <span>
                                Position
                              </span>

                              <strong>
                                {application.jobTitle ??
                                  `Job #${application.jobId}`}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Application Date
                              </span>

                              <strong>
                                {formatDate(
                                  application.createdAt,
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Email
                              </span>

                              <strong>
                                {application.email}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Phone
                              </span>

                              <strong>
                                {application.phone}
                              </strong>
                            </div>

                          </div>

                        </section>

                        {/* INTERVIEW */}

                        {(application.status ===
                          "interview" ||
                          application.status ===
                            "hiring_decision" ||
                          application.status ===
                            "ready_for_hire" ||
                          application.status ===
                            "hired") && (
                          <section className="candidate-interview-section">

                            <div className="candidate-detail-section-heading">
                              <div>
                                <p>
                                  INTERVIEW
                                </p>

                                <h3>
                                  Interview Details
                                </h3>
                              </div>

                              {interview && (
                                <span
                                  className={`candidate-interview-status ${interview.status}`}
                                >
                                  {getInterviewStatusLabel(
                                    interview.status,
                                  )}
                                </span>
                              )}
                            </div>

                            {isInterviewLoading && (
                              <div className="candidate-interview-loading">
                                <div className="candidate-spinner" />

                                <span>
                                  Loading interview
                                  details...
                                </span>
                              </div>
                            )}

                            {!isInterviewLoading &&
                              interview && (
                                <div className="candidate-interview-card">

                                  <div className="candidate-interview-grid">

                                    <div className="candidate-interview-item">
                                      <span>
                                        Interview Type
                                      </span>

                                      <strong>
                                        {
                                          interview.interviewType
                                        }
                                      </strong>
                                    </div>

                                    <div className="candidate-interview-item">
                                      <span>
                                        Date & Time
                                      </span>

                                      <strong>
                                        {formatInterviewDate(
                                          interview.scheduledAt,
                                        )}
                                      </strong>
                                    </div>

                                    <div className="candidate-interview-item">
                                      <span>
                                        Location
                                      </span>

                                      <strong>
                                        {interview.location ||
                                          "Location will be provided"}
                                      </strong>
                                    </div>

                                    <div className="candidate-interview-item">
                                      <span>
                                        Interviewer
                                      </span>

                                      <strong>
                                        {getInterviewerName(
                                          interview,
                                        )}
                                      </strong>
                                    </div>

                                    <div className="candidate-interview-item">
                                      <span>
                                        Status
                                      </span>

                                      <strong>
                                        {getInterviewStatusLabel(
                                          interview.status,
                                        )}
                                      </strong>
                                    </div>

                                  </div>

                                  {interview.notes && (
                                    <div className="candidate-interview-notes">

                                      <span>
                                        Notes
                                      </span>

                                      <p>
                                        {
                                          interview.notes
                                        }
                                      </p>

                                    </div>
                                  )}

                                </div>
                              )}

                            {!isInterviewLoading &&
                              !interview && (
                                <div className="candidate-interview-empty">
                                  <strong>
                                    Interview information
                                    is not available yet.
                                  </strong>

                                  <p>
                                    If an interview has
                                    been scheduled,
                                    the details will
                                    appear here.
                                  </p>
                                </div>
                              )}

                          </section>
                        )}

                      </div>
                    )}

                  </article>
                );
              },
            )}

          </div>
        )}

      </section>
    </main>
  );
}