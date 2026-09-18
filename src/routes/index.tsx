import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { getJobs } from "@/services/jobs.service";
import type { Job } from "@/types/jobs";

import "@/styles/jobs.css";

export const Route = createFileRoute("/")({
  component: JobListPage,
});

function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);

        const response = await getJobs();

        console.log("Jobs received from backend:", response.data);

        setJobs(response.data);
      } catch (error) {
        console.error("Failed to load jobs:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load available jobs.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const searchValue = search.trim().toLowerCase().replace(/\s+/g, " ");

    if (!searchValue) {
      return jobs;
    }

    return jobs.filter((job) => {
       return (
      job.title.toLowerCase().includes(searchValue) ||
      job.department.toLowerCase().includes(searchValue) ||
      job.location.toLowerCase().includes(searchValue)
    );
    });
  }, [jobs, search]);

  function formatEmploymentType(type: Job["employmentType"]) {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function handleApply(job: Job) {
  navigate({
    to: "/jobs/$jobId",
    params: {
      jobId: String(job.id),
    },
  });
}

  if (loading) {
    return (
      <main className="jobs-page">
        <div className="jobs-loading">
          <div className="jobs-spinner" />
          <p>Loading available jobs...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="jobs-page">
      <section className="jobs-hero">
        <p className="jobs-eyebrow">CAREER OPPORTUNITIES</p>

        <h1>Current Openings</h1>

        <p className="jobs-subtitle">
          Explore open opportunities and find the role that matches your
          skills and career goals.
        </p>

        <div className="jobs-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by job title, department, or location"
            aria-label="Search available jobs"
          />
        </div>
      </section>

      {error && (
        <div className="jobs-message jobs-error" role="alert">
          <strong>Unable to load jobs.</strong>
          <span>{error}</span>
        </div>
      )}

      {!error && filteredJobs.length === 0 && (
        <div className="jobs-message jobs-empty">
          {jobs.length === 0
            ? "There are no open positions at the moment."
            : "No jobs match your search."}
        </div>
      )}

      {!error && filteredJobs.length > 0 && (
        <section className="jobs-list" aria-label="Available jobs">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-content">
                <div className="job-card-header">
                  <div>
                    <span className="job-department">
                      {job.department}
                    </span>

                    <h2>{job.title}</h2>
                  </div>

                  <span className={`job-priority ${job.priority}`}>
                    {job.priority}
                  </span>
                </div>

                <p className="job-description">
                  {job.description}
                </p>

                <div className="job-meta">
                  <span>
                    <span aria-hidden="true">⌖</span>
                    {job.location}
                  </span>

                  <span>
                    <span aria-hidden="true">◷</span>
                    {formatEmploymentType(job.employmentType)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="apply-button"
                onClick={() => handleApply(job)}
              >
                Apply Now
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}