import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAllApplications,
} from "@/services/applications.service";

import {
  getJobs,
} from "@/services/jobs.service";

import {
  getApplicationInterview,
  type Interview,
} from "@/services/interview.service";

import type {
  Application,
  ApplicationStatus,
} from "@/types/applications";

import "@/styles/admin-dashboard.css";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

type DashboardStats = {
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedCandidates: number;
  interviews: number;
  hiredCandidates: number;
};

type TrendPoint = {
  label: string;
  value: number;
};

type InterviewRecord = {
  application: Application;
  interview: Interview;
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  shortlisted: "Shortlisted",
  on_hold: "On Hold",
  interview: "Interview",
  hiring_decision: "Hiring Decision",
  ready_for_hire: "Ready for Hire",
  hired: "Hired",
};

const PIPELINE_STATUSES: ApplicationStatus[] = [
  "pending",
  "approved",
  "shortlisted",
  "interview",
  "hiring_decision",
  "ready_for_hire",
  "hired",
];

function AdminDashboardPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [interviews, setInterviews] =
    useState<InterviewRecord[]>([]);

  const [activeJobs, setActiveJobs] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [period, setPeriod] =
    useState<"7" | "30" | "90">("30");

  const loadDashboard =
    useCallback(async () => {
      try {
        setError("");

        const [
          applicationsResponse,
          jobsResponse,
        ] = await Promise.all([
          getAllApplications(),
          getJobs(),
        ]);

        const loadedApplications =
          applicationsResponse.data ?? [];

        setApplications(
          loadedApplications,
        );

        setActiveJobs(
          jobsResponse.data?.length ?? 0,
        );

        /*
         * The current interview API is
         * application-based, so we only request
         * interviews for applications that reached
         * the interview stage.
         */
        const interviewCandidates =
          loadedApplications.filter(
            (application) =>
              application.status === "interview" ||
              application.status === "hiring_decision" ||
              application.status === "ready_for_hire" ||
              application.status === "hired",
          );

        const interviewResults =
          await Promise.all(
            interviewCandidates.map(
              async (application) => {
                try {
                  const interview =
                    await getApplicationInterview(
                      application.id,
                    );

                  if (!interview) {
                    return null;
                  }

                  return {
                    application,
                    interview,
                  };
                } catch {
                  return null;
                }
              },
            ),
          );

        setInterviews(
          interviewResults.filter(
            (
              item,
            ): item is InterviewRecord =>
              item !== null,
          ),
        );
      } catch (loadError) {
        console.error(
          "Failed to load admin dashboard:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
  }

  const stats = useMemo<DashboardStats>(() => {
    return {
      activeJobs,

      totalApplications:
        applications.length,

      pendingApplications:
        applications.filter(
          (application) =>
            application.status === "pending",
        ).length,

      shortlistedCandidates:
        applications.filter(
          (application) =>
            application.status === "shortlisted",
        ).length,

      interviews:
        applications.filter(
          (application) =>
            application.status === "interview" ||
            application.status === "hiring_decision",
        ).length,

      hiredCandidates:
        applications.filter(
          (application) =>
            application.status === "hired",
        ).length,
    };
  }, [activeJobs, applications]);

  const statusCounts =
    useMemo(() => {
      const counts =
        {} as Record<
          ApplicationStatus,
          number
        >;

      for (
        const status of Object.keys(
          STATUS_LABELS,
        ) as ApplicationStatus[]
      ) {
        counts[status] = 0;
      }

      for (const application of applications) {
        counts[application.status] += 1;
      }

      return counts;
    }, [applications]);

  const pipelineData =
    useMemo(() => {
      return PIPELINE_STATUSES.map(
        (status) => ({
          status,
          label: STATUS_LABELS[status],
          value:
            statusCounts[status] ?? 0,
        }),
      );
    }, [statusCounts]);

  const maxPipelineValue =
    Math.max(
      ...pipelineData.map(
        (item) => item.value,
      ),
      1,
    );

  const trendData =
    useMemo<TrendPoint[]>(() => {
      const days = Number(period);
      const today = new Date();

      const points: TrendPoint[] = [];

      for (
        let index = days - 1;
        index >= 0;
        index -= 1
      ) {
        const date = new Date(today);

        date.setHours(
          0,
          0,
          0,
          0,
        );

        date.setDate(
          today.getDate() - index,
        );

        const nextDate =
          new Date(date);

        nextDate.setDate(
          date.getDate() + 1,
        );

        const count =
          applications.filter(
            (application) => {
              const createdAt =
                new Date(
                  application.createdAt,
                );

              return (
                createdAt >= date &&
                createdAt < nextDate
              );
            },
          ).length;

        let label: string;

        if (days <= 7) {
          label =
            date.toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              },
            );
        } else {
          label =
            date.toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              },
            );
        }

        points.push({
          label,
          value: count,
        });
      }

      if (days > 7) {
        const step =
          days === 30 ? 5 : 15;

        return points.filter(
          (_, index) =>
            index % step === 0 ||
            index ===
              points.length - 1,
        );
      }

      return points;
    }, [applications, period]);

  const trendMax =
    Math.max(
      ...trendData.map(
        (point) => point.value,
      ),
      1,
    );

  const totalForDistribution =
    applications.length || 1;

  const distribution =
    useMemo(() => {
      const statuses:
        ApplicationStatus[] = [
        "pending",
        "approved",
        "shortlisted",
        "interview",
        "hiring_decision",
        "ready_for_hire",
        "hired",
        "on_hold",
        "rejected",
      ];

      return statuses
        .map((status) => ({
          status,
          label:
            STATUS_LABELS[status],
          value:
            statusCounts[status] ?? 0,
          percentage:
            Math.round(
              ((statusCounts[status] ??
                0) /
                totalForDistribution) *
                100,
            ),
        }))
        .filter(
          (item) => item.value > 0,
        );
    }, [
      statusCounts,
      totalForDistribution,
    ]);

  const upcomingInterviews =
    useMemo(() => {
      const now = new Date();

      return [...interviews]
        .filter(
          ({ interview }) =>
            interview.status ===
              "scheduled" &&
            new Date(
              interview.scheduledAt,
            ) >= now,
        )
        .sort(
          (a, b) =>
            new Date(
              a.interview.scheduledAt,
            ).getTime() -
            new Date(
              b.interview.scheduledAt,
            ).getTime(),
        )
        .slice(0, 5);
    }, [interviews]);

  const interviewCompletionRate =
    useMemo(() => {
      if (interviews.length === 0) {
        return 0;
      }

      const completed =
        interviews.filter(
          ({ interview }) =>
            interview.status ===
            "completed",
        ).length;

      return Math.round(
        (completed /
          interviews.length) *
          100,
      );
    }, [interviews]);

  const shortlistRate =
    applications.length === 0
      ? 0
      : Math.round(
          (stats.shortlistedCandidates /
            applications.length) *
            100,
        );

  const hireRate =
    applications.length === 0
      ? 0
      : Math.round(
          (stats.hiredCandidates /
            applications.length) *
            100,
        );

  function getCandidateName(
    application: Application,
  ) {
    if (
      application.candidateFirstName ||
      application.candidateLastName
    ) {
      return [
        application.candidateFirstName,
        application.candidateLastName,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return application.fullName;
  }

  function getInitials(
    application: Application,
  ) {
    const name =
      getCandidateName(
        application,
      );

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0),
      )
      .join("")
      .toUpperCase();
  }

  function formatInterviewDate(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      },
    );
  }

  if (loading) {
    return (
      <main className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />

          <p>
            Loading recruitment dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <div className="dashboard-page-header">
        <div>
          <p className="dashboard-eyebrow">
            ADMINISTRATION
          </p>

          <h1>
            Recruitment Dashboard
          </h1>

          <p className="dashboard-description">
            Monitor recruitment activity,
            candidate progress, interviews,
            and hiring performance from
            one place.
          </p>
        </div>

        <div className="dashboard-header-actions">
        
          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "refresh-icon refresh-spinning"
                  : "refresh-icon"
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="dashboard-error"
          role="alert"
        >
          <strong>
            Unable to load dashboard data.
          </strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={handleRefresh}
          >
            Try again
          </button>
        </div>
      )}

      {/* KPI CARDS */}

      <section className="dashboard-stats">
        <article className="stat-card">
          <div className="stat-icon stat-icon-jobs">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M4 7h16v13H4zM8 7V4h8v3M8 12h8M8 16h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <span className="stat-label">
              Active Jobs
            </span>

            <strong className="stat-value">
              {stats.activeJobs}
            </strong>

            <span className="stat-helper">
              Currently published
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-applications">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <span className="stat-label">
              Applications
            </span>

            <strong className="stat-value">
              {stats.totalApplications}
            </strong>

            <span className="stat-helper">
              All submitted applications
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-shortlist">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="m12 4 2.5 5.1 5.5.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.5-.8z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <span className="stat-label">
              Shortlisted
            </span>

            <strong className="stat-value">
              {stats.shortlistedCandidates}
            </strong>

            <span className="stat-helper">
              Candidates progressing
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-hired">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="m5 12 4 4 10-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <span className="stat-label">
              Hired
            </span>

            <strong className="stat-value">
              {stats.hiredCandidates}
            </strong>

            <span className="stat-helper">
              Successfully hired
            </span>
          </div>
        </article>
      </section>

      {/* APPLICATION TREND + PIPELINE */}

      <section className="dashboard-grid-main">
        <article className="dashboard-card trend-card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">
                APPLICATION ACTIVITY
              </p>

              <h2>
                Applications Over Time
              </h2>

              <p className="card-description">
                New applications received
                during the selected period.
              </p>
            </div>

            <select
              className="period-select"
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value as
                    | "7"
                    | "30"
                    | "90",
                )
              }
              aria-label="Application period"
            >
              <option value="7">
                Last 7 days
              </option>

              <option value="30">
                Last 30 days
              </option>

              <option value="90">
                Last 90 days
              </option>
            </select>
          </div>

          <div className="trend-chart">
            {trendData.length === 0 ? (
              <div className="chart-empty">
                No application activity yet.
              </div>
            ) : (
              <>
                <div className="chart-y-axis">
                  <span>
                    {trendMax}
                  </span>

                  <span>
                    {Math.round(
                      trendMax / 2,
                    )}
                  </span>

                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="chart-grid-lines">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="trend-bars">
                    {trendData.map(
                      (
                        point,
                        index,
                      ) => {
                        const height =
                          point.value === 0
                            ? 3
                            : Math.max(
                                8,
                                (point.value /
                                  trendMax) *
                                  100,
                              );

                        return (
                          <div
                            className="trend-column"
                            key={`${point.label}-${index}`}
                            title={`${point.label}: ${point.value} applications`}
                          >
                            <div className="trend-value">
                              {point.value}
                            </div>

                            <div
                              className="trend-bar"
                              style={{
                                height: `${height}%`,
                              }}
                            />

                            <span className="trend-label">
                              {point.label}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </article>

        <article className="dashboard-card pipeline-card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">
                RECRUITMENT PIPELINE
              </p>

              <h2>
                Candidate Progress
              </h2>

              <p className="card-description">
                Current candidate distribution
                across the hiring process.
              </p>
            </div>
          </div>

          <div className="pipeline-list">
            {pipelineData.map(
              (item) => (
                <div
                  className="pipeline-row"
                  key={item.status}
                >
                  <div className="pipeline-label">
                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value}
                    </strong>
                  </div>

                  <div className="pipeline-track">
                    <div
                      className={`pipeline-fill pipeline-${item.status}`}
                      style={{
                        width: `${
                          (item.value /
                            maxPipelineValue) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </section>

      {/* PERFORMANCE */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">
              PERFORMANCE
            </p>

            <h2>
              Recruitment Performance
            </h2>
          </div>
        </div>

        <div className="performance-grid">
          <article className="performance-card">
            <span>
              Shortlist Rate
            </span>

            <strong>
              {shortlistRate}%
            </strong>

            <div className="performance-track">
              <div
                style={{
                  width: `${shortlistRate}%`,
                }}
              />
            </div>

            <small>
              Applications reaching shortlist
            </small>
          </article>

          <article className="performance-card">
            <span>
              Interview Completion
            </span>

            <strong>
              {interviewCompletionRate}%
            </strong>

            <div className="performance-track">
              <div
                style={{
                  width: `${interviewCompletionRate}%`,
                }}
              />
            </div>

            <small>
              Scheduled interviews completed
            </small>
          </article>

          <article className="performance-card">
            <span>
              Hire Rate
            </span>

            <strong>
              {hireRate}%
            </strong>

            <div className="performance-track">
              <div
                style={{
                  width: `${hireRate}%`,
                }}
              />
            </div>

            <small>
              Applications converted to hires
            </small>
          </article>

          <article className="performance-card">
            <span>
              Interviews
            </span>

            <strong>
              {stats.interviews}
            </strong>

            <div className="performance-meta">
              <span>
                {upcomingInterviews.length}
              </span>

              upcoming
            </div>
          </article>
        </div>
      </section>

      {/* STATUS + UPCOMING INTERVIEWS */}

      <section className="dashboard-grid-secondary">
        <article className="dashboard-card distribution-card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">
                APPLICATIONS
              </p>

              <h2>
                Status Distribution
              </h2>
            </div>

            <Link
              to="/admin/applications"
              className="card-link"
            >
              View applications
            </Link>
          </div>

          {distribution.length === 0 ? (
            <div className="chart-empty">
              No applications available.
            </div>
          ) : (
            <div className="distribution-content">
              <div className="distribution-ring">
                <div>
                  <strong>
                    {applications.length}
                  </strong>

                  <span>
                    Applications
                  </span>
                </div>
              </div>

              <div className="distribution-legend">
                {distribution.map(
                  (item) => (
                    <div
                      className="legend-item"
                      key={item.status}
                    >
                      <div className="legend-label">
                        <span
                          className={`legend-dot legend-${item.status}`}
                        />

                        <span>
                          {item.label}
                        </span>
                      </div>

                      <strong>
                        {item.value}
                      </strong>

                      <small>
                        {item.percentage}%
                      </small>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </article>

        <article className="dashboard-card interviews-card">
          <div className="card-header">
            <div>
              <p className="section-eyebrow">
                INTERVIEWS
              </p>

              <h2>
                Upcoming Interviews
              </h2>
            </div>

            <Link
              to="/admin/applications"
              className="card-link"
            >
              View applications
            </Link>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="dashboard-empty-small">
              <div className="empty-icon">
                —
              </div>

              <strong>
                No upcoming interviews
              </strong>

              <span>
                Scheduled interviews will
                appear here.
              </span>
            </div>
          ) : (
            <div className="interview-list">
              {upcomingInterviews.map(
                ({
                  application,
                  interview,
                }) => (
                  <Link
                    key={interview.id}
                    to="/admin/applications/$applicationId"
                    params={{
                      applicationId:
                        String(
                          application.id,
                        ),
                    }}
                    className="interview-item"
                  >
                    <div className="interview-avatar">
                      {getInitials(
                        application,
                      )}
                    </div>

                    <div className="interview-info">
                      <strong>
                        {getCandidateName(
                          application,
                        )}
                      </strong>

                      <span>
                        {application.jobTitle ??
                          "Position"}
                      </span>

                      <small>
                        {formatInterviewDate(
                          interview.scheduledAt,
                        )}
                      </small>
                    </div>

                    <span className="interview-arrow">
                      →
                    </span>
                  </Link>
                ),
              )}
            </div>
          )}
        </article>
      </section>

      {/* QUICK ACTIONS */}

      <section className="dashboard-section quick-actions-section">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">
              MANAGEMENT
            </p>

            <h2>
              Quick Actions
            </h2>
          </div>
        </div>

        <div className="quick-actions-grid">
          <Link
            to="/admin/jobs"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              +
            </span>

            <div>
              <strong>
                Create Job
              </strong>

              <span>
                Publish a new job opening
              </span>
            </div>

            <span className="quick-action-arrow">
              →
            </span>
          </Link>

          <Link
            to="/admin/applications"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              ▣
            </span>

            <div>
              <strong>
                Applications
              </strong>

              <span>
                Review candidate applications
              </span>
            </div>

            <span className="quick-action-arrow">
              →
            </span>
          </Link>

          <Link
            to="/admin/candidates"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              ♙
            </span>

            <div>
              <strong>
                Candidates
              </strong>

              <span>
                Manage candidate profiles
              </span>
            </div>

            <span className="quick-action-arrow">
              →
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              ♟
            </span>

            <div>
              <strong>
                User Management
              </strong>

              <span>
                Manage recruiters and users
              </span>
            </div>

            <span className="quick-action-arrow">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}