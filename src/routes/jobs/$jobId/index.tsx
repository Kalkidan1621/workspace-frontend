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

import type {
  Job,
} from "@/types/jobs";

import "@/styles/job-details.css";


export const Route = createFileRoute(
  "/jobs/$jobId/",
)({
  component: JobDetailsPage,
});


function JobDetailsPage() {
  const { jobId } =
    Route.useParams();
  const navigate = useNavigate();

  const [job, setJob] =
    useState<Job | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getJobById(
            Number(jobId),
          );

        setJob(
          response.data,
        );

      } catch (error) {
        console.error(
          "Failed to load job:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load job.",
        );

      } finally {
        setLoading(false);
      }
    }

    fetchJob();

  }, [jobId]);


  function formatEmploymentType(
    type:
      Job["employmentType"],
  ) {
    return type
      .split("-")
      .map(
        (word) =>
          word.charAt(0)
            .toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }


  function formatPriority(
    value:
      Job["priority"],
  ) {
    return (
      value.charAt(0)
        .toUpperCase() +
      value.slice(1)
    );
  }


  if (loading) {
    return (
      <main className="job-details-state">

        <div className="job-details-state-card">

          <h1>
            Loading job details...
          </h1>

          <p>
            Please wait while the
            job information loads.
          </p>

        </div>

      </main>
    );
  }


  if (error || !job) {
    return (
      <main className="job-details-state">

        <div className="job-details-state-card">

          <h1>
            Job not available
          </h1>

          <p className="job-details-error">

            {error ??
              "The requested job could not be found."}

          </p>

          <Link
            to="/jobs"
            className="back-to-jobs-button"
          >

            Back to Jobs

          </Link>

        </div>

      </main>
    );
  }


  return (
    <main className="job-details-page">

      <div className="job-details-container">

        <Link
          to="/jobs"
          className="back-to-jobs-link"
        >

          ← Back to Jobs

        </Link>


        <section className="job-details-card">

          <header className="job-details-header">

            <p className="job-details-department">

              {job.department}

            </p>

            <h1>

              {job.title}

            </h1>

            <p className="job-details-employer">

              {job.employer}

            </p>

            <div className="job-details-tags">

              <span>

                {job.location}

              </span>

              <span>

                {formatEmploymentType(
                  job.employmentType,
                )}

              </span>

              <span>

                {formatPriority(
                  job.priority,
                )}

                {" "}
                Priority

              </span>

            </div>

          </header>


          <section className="job-details-section">

            <h2>
              Job Description
            </h2>

            <p>

              {job.description}

            </p>

          </section>


          <section className="job-details-section">

            <h2>
              Job Information
            </h2>

            <div className="job-information-grid">

              <article>

                <span>
                  Salary
                </span>

                <strong>

                  {job.salary}

                </strong>

              </article>


              <article>

                <span>
                  Experience
                </span>

                <strong>

                  {job.experience}

                </strong>

              </article>


              <article>

                <span>
                  Educational
                  Qualification
                </span>

                <strong>

                  {
                    job.educationalQualification
                  }

                </strong>

              </article>


              <article>

                <span>
                  Working Time
                </span>

                <strong>

                  {job.workingTime}

                </strong>

              </article>


              <article>

                <span>
                  Opening Date
                </span>

                <strong>

                  {job.openingDate}

                </strong>

              </article>


              <article>

                <span>
                  Closing Date
                </span>

                <strong>

                  {job.closingDate}

                </strong>

              </article>

            </div>

          </section>


          <section className="job-details-section">

            <h2>
              More Information
            </h2>

            <div className="job-more-information">

              <p>

                <strong>
                  Employer:
                </strong>

                {" "}

                {job.employer}

              </p>

              <p>

                <strong>
                  Department:
                </strong>

                {" "}

                {job.department}

              </p>

              <p>

                <strong>
                  Job Type:
                </strong>

                {" "}

                {formatEmploymentType(
                  job.employmentType,
                )}

              </p>

              <p>

                <strong>
                  Location:
                </strong>

                {" "}

                {job.location}

              </p>

            </div>

          </section>


          <button
  type="button"
  className="apply-now-button"
  onClick={() => {
    navigate({
      to: "/candidate/register",
      search: {
        redirect: `/jobs/${jobId}/apply`,
      },
    });
  }}
>
  Apply Now
</button>
        </section>

      </div>

    </main>
  );
}