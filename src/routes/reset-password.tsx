import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import "@/styles/reset-password.css";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!token) {
      setError("This password reset link is invalid or missing.");
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            token,
            newPassword,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ?? "Failed to reset your password.",
        );
      }

      setSuccess(true);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to reset your password.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    await navigate({ to: "/login" });
  }

  if (success) {
    return (
      <main className="reset-password-page">
        <section className="reset-password-card">
          <div className="reset-password-header">
            <p className="reset-password-eyebrow">
              RECRUITMENT PORTAL
            </p>

            <h1>Password reset successful</h1>

            <p>
              Your password has been updated successfully.
              You can now sign in with your new password.
            </p>
          </div>

          <button
            type="button"
            className="reset-password-button"
            onClick={handleLogin}
          >
            Back to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        <div className="reset-password-header">
          <p className="reset-password-eyebrow">
            RECRUITMENT PORTAL
          </p>

          <h1>Reset your password</h1>

          <p>
            Enter a new password for your recruitment portal account.
          </p>
        </div>

        <form
          className="reset-password-form"
          onSubmit={handleSubmit}
        >
          <div className="reset-password-field">
            <label htmlFor="newPassword">
              New password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Enter your new password"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm your new password"
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="reset-password-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? "Resetting password..." : "Reset Password"}
          </button>

          <div className="reset-password-login-link">
            <Link to="/login">Back to Login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}