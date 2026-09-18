import { createFileRoute, Link, } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  getAllApplications,
  getApplicationStats,
  updateApplicationStatus,
} from "@/services/applications.service";

import type {
  Application,
  ApplicationStatus,
  ApplicationStats,
} from "@/types/applications";

import "@/styles/admin-screening.css";
import "@/styles/screening.css";

export const Route = createFileRoute(
  "/admin/candidates/",
)({
  component: AdminScreeningPage,
});

function AdminScreeningPage() {
  const [applications, setApplications] =
    useState<Application[]>([]);

  const [stats, setStats] =
    useState<ApplicationStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionError, setActionError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | ApplicationStatus>("all");

    const [rejectingApplication, setRejectingApplication] =
  useState<Application | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        applicationsResponse,
        statsResponse,
      ] = await Promise.all([
        getAllApplications(),
        getApplicationStats(),
      ]);

      setApplications(
        applicationsResponse.data,
      );

      setStats(
        statsResponse.data,
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
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

  async function handleStatusUpdate(
    applicationId: number,
    status: "approved" | "rejected",
  ) {
    try {
      setUpdatingId(applicationId);
      setActionError("");

      const response =
        await updateApplicationStatus(
          applicationId,
          status,
        );

      setApplications(
        (currentApplications) =>
          currentApplications.map(
            (application) =>
              application.id ===
              applicationId
                ? response.data
                : application,
          ),
      );

      const statsResponse =
        await getApplicationStats();

      setStats(
        statsResponse.data,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to update application status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredApplications =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return applications.filter(
        (application) => {
          const matchesSearch =
            normalizedSearch === "" ||
            application.fullName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            application.email
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            application.phone
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              application.jobTitle ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

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
      searchTerm,
      statusFilter,
    ]);

  function formatStatus(
    status: ApplicationStatus,
  ) {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  if (loading) {
    return (
      <main className="admin-screening-page">
        <div className="admin-loading">
          <div className="admin-spinner" />

          <p>
            Loading applications...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-screening-page">
      <section className="admin-screening-container">

        <header className="admin-screening-header">
          <div>
            <p className="admin-eyebrow">
              ADMIN DASHBOARD
            </p>

            <h1>
              Candidate Screening
            </h1>

            <p>
              Review incoming applications
              and approve or reject
              candidates.
            </p>
          </div>


 <div className="admin-screening-header-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadDashboard}
          >
            Refresh
          </button>
          </div>
        </header>

        {stats && (
          <section className="admin-stats-grid">

            <article className="admin-stat-card">
              <span>
                Total Applications
              </span>

              <strong>
                {stats.total}
              </strong>
            </article>

            <article className="admin-stat-card">
              <span>
                Pending
              </span>

              <strong>
                {stats.pending}
              </strong>
            </article>

            <article className="admin-stat-card">
              <span>
                Approved
              </span>

              <strong>
                {stats.approved}
              </strong>
            </article>

            <article className="admin-stat-card">
              <span>
                Rejected
              </span>

              <strong>
                {stats.rejected}
              </strong>
            </article>

          </section>
        )}

        <section className="admin-filters">

          <div className="admin-search-box">

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="
                Search by name, email, phone, or job title..."
              aria-label="
                Search applications
              "
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                Clear
              </button>
            )}

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | "all"
                  | ApplicationStatus,
              )
            }
            aria-label="
              Filter by application status
            "
          >
            <option value="all">
              All Statuses
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

          </select>

        </section>

        <p className="admin-results-count">

          Showing{" "}

          <strong>
            {
              filteredApplications
                .length
            }
          </strong>

          {" "}of{" "}

          <strong>
            {
              applications.length
            }
          </strong>

          {" "}applications

        </p>

        {error && (
          <div
            className="admin-error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        {actionError && (
          <div
            className="admin-action-error"
            role="alert"
          >
            {actionError}
          </div>
        )}

        {applications.length === 0 ? (

          <div className="admin-empty-state">

            <h2>
              No applications yet
            </h2>

            <p>
              Candidate applications
              will appear here after
              they are submitted.
            </p>

          </div>

        ) : filteredApplications
            .length === 0 ? (

          <div className="admin-empty-state">

            <h2>
              No matching applications
            </h2>

            <p>
              Try changing your search
              text or status filter.
            </p>

            <button
              type="button"
              className="admin-reset-filter"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Candidate
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Position
                  </th>

                  <th>
                    Resume
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  filteredApplications.map(
                    (application) => (

                      <tr
                        key={
                          application.id
                        }
                      >

                        <td>

                          <Link
                            to="/admin/applications/$applicationId"
                             params={{
                             applicationId: String(
                             application.id,
                           ),
                          }}
                            className="candidate-link"
                          >
                            {application.fullName}
                         </Link>

                        </td>

                        <td>

                          <div className="admin-contact">

                            <span>
                              {
                                application
                                  .email
                              }
                            </span>

                            <span>
                              {
                                application
                                  .phone
                              }
                            </span>

                          </div>

                        </td>

                        <td>

                          {
                            application
                              .jobTitle ??
                            "Unknown Job"
                          }

                        </td>

                        <td>

                          <span className="resume-name">

                            {
                              application
                                .resumeName
                            }

                          </span>

                        </td>

                        <td>

                          <span
                            className={
                              `status-badge ${application.status}`
                            }
                          >

                            {
                              formatStatus(
                                application
                                  .status,
                              )
                            }

                          </span>

                        </td>

                        <td>

                          <div className="admin-actions">

                            <button
                              type="button"
                              className="approve-button"
                              disabled={
                                updatingId ===
                                application.id
                              }
                              onClick={() =>
                                handleStatusUpdate(
                                  application.id,
                                  "approved",
                                )
                              }
                            >

                              {
                                updatingId ===
                                application.id
                                  ? "Updating..."
                                  : "Approve"
                              }

                            </button>
<button
  type="button"
  className="reject-button"
  disabled={
    updatingId === application.id
  }
  onClick={() =>
    setRejectingApplication(application)
  }
>
  Reject
</button>

                          </div>

                        </td>

                      </tr>

                    ),
                  )
                }

              </tbody>

            </table>

          </div>

        )}

      </section>
      {rejectingApplication && (
  <div
    className="confirmation-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="reject-title"
  >
    <div className="confirmation-modal">

      <div className="confirmation-icon">
        !
      </div>

      <h2 id="reject-title">
        Reject Candidate?
      </h2>

      <p>
        Are you sure you want to reject{" "}
        <strong>
          {rejectingApplication.fullName}
        </strong>
        ?
      </p>

      <p className="confirmation-warning">
        This action will update the
        application status to Rejected.
      </p>

      <div className="confirmation-actions">

        <button
          type="button"
          className="confirmation-cancel"
          onClick={() =>
            setRejectingApplication(null)
          }
          disabled={
            updatingId ===
            rejectingApplication.id
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="confirmation-reject"
          disabled={
            updatingId ===
            rejectingApplication.id
          }
          onClick={async () => {

            await handleStatusUpdate(
              rejectingApplication.id,
              "rejected",
            );

            setRejectingApplication(null);

          }}
        >
          {updatingId ===
          rejectingApplication.id
            ? "Rejecting..."
            : "Reject Candidate"}
        </button>

      </div>

    </div>
  </div>
)}
    </main>
  );
}