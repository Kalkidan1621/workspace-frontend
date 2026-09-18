import { useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import "@/styles/forgot-password.css";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to send the reset link. Please try again.",
        );
      }

      setSuccess(
        data?.message ||
          "If an account exists with this email, a password reset link has been sent.",
      );

      setEmail("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>

          <p>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <form
          className="forgot-password-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="forgot-password-email">
              Email Address
            </label>

            <input
              id="forgot-password-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {error && (
            <div
              className="forgot-password-message error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="forgot-password-message success"
              role="status"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            className="forgot-password-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="forgot-password-back">
          <Link to="/login">← Back to Login</Link>
        </div>
      </section>
    </main>
  );
}

