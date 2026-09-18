import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
  type FormEvent,
} from "react";

import { login } from "@/services/auth.service";

import "@/styles/login.css";

export const Route = createFileRoute(
  "/candidate/login",
)({
  validateSearch: (
    search: Record<string, unknown>,
  ) => ({
    redirect:
      typeof search.redirect === "string"
        ? search.redirect
        : "/jobs",
  }),

  component: CandidateLoginPage,
});

function CandidateLoginPage() {
  const { redirect } =
    Route.useSearch();

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (!email.trim()) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );
      return;
    }

    try {
      setLoading(true);

      const result = await login({
        email: email.trim(),
        password,
      });

      const user =
        result.data?.user;

      if (!user) {
        throw new Error(
          "User information was not returned.",
        );
      }

      if (
        user.role !== "CANDIDATE"
      ) {
        setError(
          "This login is only for candidates.",
        );
        return;
      }
      if (
        redirect &&
        redirect !== "/jobs"
      ) {
        await navigate({
          to: redirect,
        });
      } else {
        await navigate({
          to: "/candidate/profile",
        });
      }
    } catch (error) {
      console.error(
        "Candidate login error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-header">
          <p className="login-eyebrow">
            CANDIDATE PORTAL
          </p>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to manage your
            profile and job applications.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
        >
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
              placeholder="Enter your password"
              autoComplete="current-password"
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

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?
          </p>

          <Link
            to="/candidate/register"
            search={{
    redirect,
  }}
          >
            Create account
          </Link>
        </div>

      </section>
    </main>
  );
}