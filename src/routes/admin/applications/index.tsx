import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAllApplications,
  getApplicationStats,
} from "@/services/applications.service";

import type {
  Application,
  ApplicationStatsResponse,
} from "@/types/applications";

import "@/styles/admin-applications.css";

export const Route = createFileRoute(
  "/admin/applications/",
)({
  component: AdminApplicationsPage,
});

function AdminApplicationsPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [stats, setStats] =
    useState<ApplicationStatsResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  useEffect(() => {
    void loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const [
        applicationsResult,
        statsResult,
      ] = await Promise.all([
        getAllApplications(),
        getApplicationStats(),
      ]);

      setApplications(
        applicationsResult.data ?? [],
      );

      setStats(statsResult);
    } catch (error) {
      console.error(
        "Failed to load applications:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load applications.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return applications.filter(
        (application) => {
          const matchesSearch =
            !query ||
            application.fullName
              .toLowerCase()
              .includes(query) ||
            (
              application.jobTitle ?? ""
            )
              .toLowerCase()
              .includes(query) ||
            application.email
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            application.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      applications,
      search,
      statusFilter,
    ]);

  function formatStatus(
    status: string,
  ) {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  function formatDate(
    date: string,
  ) {
    return new Date(
      date,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="admin-applications-page">
        <div className="admin-applications-state">
          <div className="admin-job-spinner" />

          <h2>
            Loading applications...
          </h2>

          <p>
            Please wait while applications
            are loading.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-applications-page">

      <div className="admin-applications-container">

        {/* HEADER */}

        <header className="admin-applications-header">

          <div>
            <p className="admin-page-eyebrow">
              RECRUITMENT MANAGEMENT
            </p>

            <h1>
              Applications
            </h1>

            <p>
              Review and manage candidate
              applications.
            </p>
          </div>

        </header>

        {/* ERROR */}

        {error && (
          <div
            className="application-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* =========================================
            STATISTICS
        ========================================== */}

        <section className="application-stats">

          <div className="application-stat-card">
            <span>
              Total Applications
            </span>

            <strong>
              {stats?.data.total ??
                applications.length}
            </strong>
          </div>

          <div className="application-stat-card">
            <span>
              Pending
            </span>

            <strong>
              {stats?.data.pending ?? 0}
            </strong>
          </div>

          <div className="application-stat-card">
            <span>
              Approved
            </span>

            <strong>
              {stats?.data.approved ?? 0}
            </strong>
          </div>

          <div className="application-stat-card">
            <span>
              Rejected
            </span>

            <strong>
              {stats?.data.rejected ?? 0}
            </strong>
          </div>

        </section>

        {/* =========================================
            FILTER TOOLBAR
        ========================================== */}

        <section className="applications-toolbar">

          <div className="applications-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search candidate, email or job..."
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className="applications-status-filter"
          >
            <option value="all">
              All Status
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="shortlisted">
              Shortlisted
            </option>

            <option value="interview">
              Interview
            </option>

            <option value="hiring_decision">
              Hiring Decision
            </option>

            <option value="ready_for_hire">
              Ready for Hire
            </option>

            <option value="hired">
              Hired
            </option>
          </select>

        </section>

        {/* =========================================
            APPLICATION TABLE
        ========================================== */}

        <section className="applications-table-card">

          <div className="applications-table-wrapper">

            <table className="applications-table">

              <thead>
                <tr>

                  <th>
                    Candidate
                  </th>

                  <th>
                    Position
                  </th>

                  <th>
                    Applied
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredApplications.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="applications-empty"
                    >
                      <strong>
                        No applications found
                      </strong>

                      <span>
                        Try changing your
                        search or filter.
                      </span>
                    </td>

                  </tr>

                ) : (

                  filteredApplications.map(
                    (application) => (

                      <tr
                        key={
                          application.id
                        }
                      >

                        {/* =================================
                            CANDIDATE
                        ================================== */}

                        <td>

                          <div className="candidate-cell">

                            <div className="candidate-avatar">
                              {application.fullName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="candidate-cell-info">

                              {/* 
                                IMPORTANT:
                                Candidate name is now a Link
                                to Application Details.
                              */}

                              <Link
                                to="/admin/applications/$applicationId"
                                params={{
                                  applicationId:
                                    String(
                                      application.id,
                                    ),
                                }}
                                className="candidate-name-link"
                              >
                                {
                                  application.fullName
                                }
                              </Link>

                              <span>
                                {
                                  application.email
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* =================================
                            POSITION
                        ================================== */}

                        <td>
                          {application.jobTitle ??
                            `Job #${application.jobId}`}
                        </td>

                        {/* =================================
                            APPLIED DATE
                        ================================== */}

                        <td>
                          {formatDate(
                            application.createdAt,
                          )}
                        </td>

                        {/* =================================
                            STATUS
                        ================================== */}

                        <td>

                          <span
                            className={`application-status ${application.status}`}
                          >
                            {formatStatus(
                              application.status,
                            )}
                          </span>

                        </td>

                        {/* =================================
                            ACTION
                        ================================== */}

                        <td>

                          <Link
                            to="/admin/applications/$applicationId"
                            params={{
                              applicationId:
                                String(
                                  application.id,
                                ),
                            }}
                            className="application-view-button"
                          >
                            View
                          </Link>

                        </td>

                      </tr>

                    ),
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

    </main>
  );
}