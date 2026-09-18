import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  getCurrentUser,
} from "@/services/auth.service";

import {
  createApplication,
} from "@/services/applications.service";

import "@/styles/job-application.css";

export const Route = createFileRoute(
  "/jobs/$jobId/apply",
)({
  component: ApplyPage,
});

function ApplyPage() {
  const { jobId } = Route.useParams();

  const navigate = useNavigate();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [resume, setResume] =
    useState<File | null>(null);

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    resume?: string;
  }>({});

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // ========================================
  // CHECK CANDIDATE LOGIN
  // ========================================

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response =
          await getCurrentUser();

        const user = response.data;

        if (!user) {
          await navigate({
            to: "/candidate/register",
            search: {
              redirect: `/jobs/${jobId}/apply`,
            },
          });

          return;
        }

        // Only candidates can apply
        if (user.role !== "CANDIDATE") {
          setMessage(
            "Only candidates can submit job applications.",
          );

          return;
        }

        // Automatically fill candidate information
        setFullName(
          `${user.firstName} ${user.lastName}`.trim(),
        );

        setEmail(user.email);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error,
        );

        await navigate({
          to: "/candidate/register",
          search: {
            redirect: `/jobs/${jobId}/apply`,
          },
        });
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, [jobId, navigate]);

  // ========================================
  // VALIDATION
  // ========================================

  function validateForm() {
    const newErrors: {
      fullName?: string;
      email?: string;
      phone?: string;
      resume?: string;
    } = {};

    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    }

    // Email
    if (!email.trim()) {
      newErrors.email =
        "Email is required.";
    } else {
      const emailPattern =
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

      if (
        !emailPattern.test(
          email.trim(),
        )
      ) {
        newErrors.email =
          "Please enter a valid Gmail address. Example: you@gmail.com.";
      }
    }

    // Phone
    if (!phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    } else {
      const phonePattern =
        /^\d{10}$/;

      if (
        !phonePattern.test(
          phone.trim(),
        )
      ) {
        newErrors.phone =
          "Phone number must contain exactly 10 digits.";
      }
    }

    // Resume
    if (!resume) {
      newErrors.resume =
        "Please upload your resume.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  }

  // ========================================
  // SUBMIT APPLICATION
  // ========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");

    const isValid =
      validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);

      await createApplication({
        jobId: Number(jobId),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resume: resume!,
      });

      setMessage(
        "Application submitted successfully!",
      );

      setPhone("");
      setResume(null);
      setErrors({});
    } catch (error) {
      console.error(
        "Application failed:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to submit application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ========================================
  // AUTH CHECK LOADING
  // ========================================

  if (checkingAuth) {
    return (
      <main className="job-application-page">
        <div className="job-application-container">
          <section className="job-application-card">
            <h1>
              Checking your account...
            </h1>

            <p>
              Please wait while we verify
              your candidate account.
            </p>
          </section>
        </div>
      </main>
    );
  }

  // ========================================
  // APPLICATION FORM
  // ========================================

  return (
    <main className="job-application-page">
      <div className="job-application-container">
        <section className="job-application-card">

          <div className="job-application-header">
            <Link
              to="/jobs/$jobId"
              params={{
                jobId: String(jobId),
              }}
              className="back-to-job-link"
            >
              ← Back to Job
            </Link>

            <p className="application-eyebrow">
              CANDIDATE PORTAL
            </p>

            <h1>
              Apply for Job
            </h1>

            <p>
              Complete your application
              and upload your resume.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* Full Name */}

            <div className="application-field">
              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(
                    event.target.value,
                  );

                  if (errors.fullName) {
                    setErrors(
                      (current) => ({
                        ...current,
                        fullName:
                          undefined,
                      }),
                    );
                  }
                }}
                placeholder="Enter your full name"
                autoComplete="name"
                aria-invalid={Boolean(
                  errors.fullName,
                )}
              />

              {errors.fullName && (
                <p className="field-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}

            <div className="application-field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );

                  if (errors.email) {
                    setErrors(
                      (current) => ({
                        ...current,
                        email:
                          undefined,
                      }),
                    );
                  }
                }}
                placeholder="you@gmail.com"
                autoComplete="email"
                aria-invalid={Boolean(
                  errors.email,
                )}
              />

              {errors.email && (
                <p className="field-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}

            <div className="application-field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                maxLength={10}
                inputMode="numeric"
                autoComplete="tel"
                onChange={(event) => {
                  const value =
                    event.target.value.replace(
                      /\D/g,
                      "",
                    );

                  setPhone(value);

                  if (errors.phone) {
                    setErrors(
                      (current) => ({
                        ...current,
                        phone:
                          undefined,
                      }),
                    );
                  }
                }}
                placeholder="0912345678"
                aria-invalid={Boolean(
                  errors.phone,
                )}
              />

              {errors.phone && (
                <p className="field-error">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Resume */}

            <div className="application-field">
              <label htmlFor="resume">
                Resume / CV
              </label>

              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ??
                    null;

                  setResume(file);

                  if (file) {
                    setErrors(
                      (current) => ({
                        ...current,
                        resume:
                          undefined,
                      }),
                    );
                  }
                }}
                aria-invalid={Boolean(
                  errors.resume,
                )}
              />

              {resume && (
                <p className="selected-file">
                  Selected: {resume.name}
                </p>
              )}

              {errors.resume && (
                <p className="field-error">
                  {errors.resume}
                </p>
              )}
            </div>

            {/* Message */}

            {message && (
              <p
                className={
                  message.includes(
                    "successfully",
                  )
                    ? "application-message success"
                    : "application-message error"
                }
                role="alert"
              >
                {message}
              </p>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Application"}
            </button>

          </form>
        </section>
      </div>
    </main>
  );
}

