import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type FormEvent,
} from "react";

import {
  registerCandidate,
} from "@/services/auth.service";

import "@/styles/login.css";

export const Route = createFileRoute(
  "/candidate/register",
)({
  validateSearch: (
    search: Record<string,unknown>,
  ) => ({
    redirect:
     typeof search.redirect === "string"
     ? search.redirect
     : "/jobs"
  }),
  component: CandidateRegisterPage,
});

function CandidateRegisterPage() {
  const navigate = useNavigate();

  const { redirect } = Route.useSearch();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!firstName.trim()) {
      setError(
        "Please enter your first name.",
      );
      return;
    }

    if (!lastName.trim()) {
      setError(
        "Please enter your last name.",
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter a password.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );
      return;
    }

    try {
      setLoading(true);

      await registerCandidate({
        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        email:
          email.trim(),

        password,
      });

      setSuccess(
        "Account created successfully. Redirecting to login...",
      );

      setTimeout(() => {
        navigate({
          to: "/candidate/login",
          search: {
    redirect,
  },
        });
      }, 1000);
    } catch (error) {
      console.error(
        "Candidate registration error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-header">

          <span className="login-eyebrow">
            CANDIDATE PORTAL
          </span>

          <h1>
            Create your account
          </h1>

          <p>
            Create a candidate account
            to apply for available jobs.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="login-field">
            <label htmlFor="firstName">
              First name
            </label>

            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(event) =>
                setFirstName(
                  event.target.value,
                )
              }
              placeholder="Enter your first name"
              autoComplete="given-name"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="lastName">
              Last name
            </label>

            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(event) =>
                setLastName(
                  event.target.value,
                )
              }
              placeholder="Enter your last name"
              autoComplete="family-name"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="login-success"
              role="status"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <div className="login-footer">
           <Link
  to="/candidate/login"
  search={{
    redirect,
  }}
>
  Already have an account?
</Link>
        </div>

      </section>
    </main>
  );
}

