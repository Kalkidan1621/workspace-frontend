import {
  createFileRoute,
  useNavigate,
  Link,
} from "@tanstack/react-router";

import { useState } from "react";

import { login } from "@/services/auth.service";

import "@/styles/login.css";

export const Route = createFileRoute(
  "/login",
)({
  component: LoginPage,
});

function LoginPage() {
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
    event: React.FormEvent<HTMLFormElement>,
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

      console.log(
        "Login successful:",
        result.data?.user,
      );

      // Login successful.
      // The HTTP-only session cookie
      // is already stored by the browser.
const role = result.data?.user.role;

if (role === "SUPER_ADMIN") {
  await navigate({
    to: "/admin/jobs",
  });
} else if (role === "ADMIN") {
  await navigate({
    to: "/admin/jobs",
  });
} else if (role === "RECRUITER") {
  await navigate({
    to: "/admin/screening",
  });
} else {
  setError(
    "Your account does not have a valid role.",
  );
}
    } catch (error) {
      console.error(
        "Login error:",
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
            RECRUITMENT PORTAL
          </p>

          <h1>Welcome back</h1>

          <p>
            Sign in to access your
            recruitment workspace.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
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

          <div className="forgot-password-link">
  <Link to="/forgot-password">
    Forgot Password?
  </Link>
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
      </section>
    </main>
  );
}