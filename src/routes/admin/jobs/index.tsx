import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useState } from "react";

import { getJobs } from "@/services/jobs.service";

import type { Job } from "@/types/jobs";

import "@/styles/admin-jobs.css";

export const Route = createFileRoute(
  "/admin/jobs/",
)({
  component: AdminJobsPage,
});

function AdminJobsPage() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError(null);

        const response = await getJobs();

        setJobs(response.data);
      } catch (err) {
        console.error(
          "Failed to load jobs:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load jobs.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadJobs();
  }, []);

  function handleCreateJob() {
    navigate({
      to: "/admin/jobs/create",
    });
  }

  function handleOpenJob(jobId: number) {
    navigate({
      to: "/admin/jobs/$jobId",
      params: {
        jobId: String(jobId),
      },
    });
  }

  function formatEmploymentType(
    type: Job["employmentType"],
  ) {
    return type
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }

  if (loading) {
    return (
      <main className="admin-jobs-page">
        <section className="admin-jobs-container">
          <div className="admin-jobs-loading">
            <div className="admin-jobs-spinner" />

            <p>Loading jobs...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-jobs-page">
      <section className="admin-jobs-container">

        {/* HEADER */}

        <header className="admin-jobs-header">
          <div>
            <p className="admin-jobs-eyebrow">
              ADMINISTRATION
            </p>

            <h1>Job Management</h1>

            <p className="admin-jobs-subtitle">
              Create and manage recruitment
              job positions.
            </p>
          </div>

          <button
            type="button"
            className="admin-create-job-button"
            onClick={handleCreateJob}
          >
            <span aria-hidden="true">+</span>

            Create New Job
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div
            className="admin-jobs-message admin-jobs-error"
            role="alert"
          >
            <strong>
              Unable to load jobs.
            </strong>

            <span>{error}</span>
          </div>
        )}

        {/* EMPTY */}

        {!error && jobs.length === 0 && (
          <div className="admin-jobs-empty">

            <div className="admin-jobs-empty-icon">
              +
            </div>

            <h2>
              No jobs available
            </h2>

            <p>
              You have not created any job
              positions yet.
            </p>

            <button
              type="button"
              className="admin-create-job-button"
              onClick={handleCreateJob}
            >
              Create Your First Job
            </button>

          </div>
        )}

        {/* JOB LIST */}

        {!error && jobs.length > 0 && (
          <section
            className="admin-jobs-list"
            aria-label="Job positions"
          >

            <div className="admin-jobs-list-header">
              <div>
                <h2>
                  Open Positions
                </h2>

                <p>
                  {jobs.length}{" "}
                  {jobs.length === 1
                    ? "position"
                    : "positions"}
                </p>
              </div>
            </div>

            <div className="admin-job-table-wrapper">

              <table className="admin-job-table">

                <thead>
                  <tr>
                    <th>
                      Position
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Employment Type
                    </th>

                    <th>
                      Priority
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="admin-job-row"
                      onClick={() =>
                        handleOpenJob(job.id)
                      }
                    >

                      {/* POSITION */}

                      <td>
                        <button
                          type="button"
                          className="admin-job-title-button"
                          onClick={(event) => {
                            event.stopPropagation();

                            handleOpenJob(
                              job.id,
                            );
                          }}
                        >
                          <span className="admin-job-title">
                            <strong>
                              {job.title}
                            </strong>

                            
                          </span>
                        </button>
                      </td>

                      {/* DEPARTMENT */}

                      <td>
                        <span className="admin-job-department">
                          {job.department}
                        </span>
                      </td>

                      {/* LOCATION */}

                      <td>
                        <span className="admin-job-location">

                          <span aria-hidden="true">
                            ⌖
                          </span>

                          {job.location}

                        </span>
                      </td>

                      {/* EMPLOYMENT TYPE */}

                      <td>
                        {formatEmploymentType(
                          job.employmentType,
                        )}
                      </td>

                      {/* PRIORITY */}

                      <td>
                        <span
                          className={`admin-job-priority admin-job-priority-${job.priority}`}
                        >
                          {job.priority}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}

      </section>
    </main>
  );
}