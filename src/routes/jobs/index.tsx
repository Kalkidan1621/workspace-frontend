import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useState,
} from "react";

import {
  getJobs,
} from "@/services/jobs.service";

import type {
  Job,
} from "@/types/jobs";

import "@/styles/jobs.css";


export const Route = createFileRoute(
  "/jobs/",
)({
  component: JobsPage,
});


function JobsPage() {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  useEffect(() => {
    loadJobs();
  }, []);


  async function loadJobs() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getJobs();

      setJobs(
        response.data,
      );

    } catch (error) {
      console.error(
        "Failed to load jobs:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load jobs.",
      );

    } finally {
      setLoading(false);
    }
  }


  function formatEmploymentType(
    employmentType:
      Job["employmentType"],
  ) {
    return employmentType
      .split("-")
      .map(
        (word) =>
          word.charAt(0)
            .toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }


  const filteredJobs =
    jobs.filter(
      (job) => {
        const searchText =
          search
            .trim()
            .toLowerCase();

        if (!searchText) {
          return true;
        }

        return (
          job.title
            .toLowerCase()
            .includes(searchText) ||
          job.location
            .toLowerCase()
            .includes(searchText) ||
          job.description
            .toLowerCase()
            .includes(searchText)
        );
      },
    );


  if (loading) {
    return (
      <main className="jobs-page">

        <div className="jobs-loading">

          <div className="jobs-spinner" />

          <p>
            Loading available jobs...
          </p>

        </div>

      </main>
    );
  }


  if (error) {
    return (
      <main className="jobs-page">

        <div
          className="
            jobs-message
            jobs-error
          "
          role="alert"
        >

          <strong>
            Unable to load jobs
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={
              loadJobs
            }
          >
            Try Again
          </button>

        </div>

      </main>
    );
  }


  return (
    <main className="jobs-page">

      <header className="jobs-hero">

        <p className="jobs-eyebrow">
          CAREER OPPORTUNITIES
        </p>

        <h1>
          Find Your Next Opportunity
        </h1>

        <p className="jobs-subtitle">
          Explore available positions
          and apply for the role that
          matches your skills.
        </p>


        <div className="jobs-search">

          <span>
            🔍
          </span>

          <input
            type="search"
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value,
                )
            }
            placeholder="
              Search by job title,location...
            "
            aria-label="
              Search available jobs
            "
          />

        </div>

      </header>


      {jobs.length === 0 ? (

        <div
          className="
            jobs-message
            jobs-empty
          "
        >

          <h2>
            No jobs available
          </h2>

          <p>
            Please check again later.
          </p>

        </div>

      ) : filteredJobs.length === 0 ? (

        <div
          className="
            jobs-message
            jobs-empty
          "
        >

          <h2>
            No matching jobs
          </h2>

          <p>
            Try a different search
            keyword.
          </p>

        </div>

      ) : (

        <section className="jobs-list">

          {filteredJobs.map(
            (job) => (

              <article
                key={job.id}
                className="job-card"
              >

                <div className="job-card-content">

                  <div
                    className="
                      job-card-header
                    "
                  >

                    <div>

                      <span
                        className="
                          job-department
                        "
                      >
                      <p>{job.department}</p>
                        

                      </span>


                      <h2>
                        {job.title}
                      </h2>

                    </div>

                  </div>


                  <p
                    className="
                      job-description
                    "
                  >

                    {job.description}

                  </p>


                  <div
                    className="
                      job-meta
                    "
                  >

                    <span>

                      <span>
                        📍
                      </span>

                      {job.location}

                    </span>


                    <span>

                      <span>
                        💼
                      </span>

                      {
                        formatEmploymentType(
                          job.employmentType,
                        )
                      }

                    </span>
                    <span>

                     deadline: {job.closingDate}

                    </span>

                  </div>

                </div>


                <a
                  href={
                    `/jobs/${job.id}`
                  }
                  className="
                    apply-button
                  "
                >

                  View details

                  <span>
                    →
                  </span>

                </a>

              </article>

            ),
          )}

        </section>

      )}

    </main>
  );
}