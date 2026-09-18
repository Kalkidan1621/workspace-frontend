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
  getCurrentUser,
  logout,
} from "@/services/auth.service";

import type {
  AuthUser,
} from "@/services/auth.service";

import "@/styles/admin-account.css";

export const Route = createFileRoute(
  "/admin/account",
)({
  component: AdminAccountPage,
});

function AdminAccountPage() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        const response =
          await getCurrentUser();

        if (
          !response.success ||
          !response.data
        ) {
          navigate({
            to: "/login",
          });
          return;
        }

        if (mounted) {
          setUser(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to load account:",
          error,
        );

        if (mounted) {
          navigate({
            to: "/login",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  function formatRole(role: string) {
    return role
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ");
  }

  function getInitials() {
    if (!user) {
      return "?";
    }

    return `${user.firstName.charAt(
      0,
    )}${user.lastName.charAt(
      0,
    )}`.toUpperCase();
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      navigate({
        to: "/login",
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );

      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-account-page">
        <div className="admin-account-loading">
          <div className="admin-account-spinner" />
          <p>Loading account...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="admin-account-page">
      <div className="admin-account-container">
        <header className="admin-account-header">
          <div>
            <span className="admin-account-eyebrow">
              ACCOUNT
            </span>

            <h1>Account Settings</h1>

            <p>
              Manage your account information,
              access, and security.
            </p>
          </div>
        </header>

        <section className="admin-account-overview">
          <div className="admin-account-avatar">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
            ) : (
              <span>
                {getInitials()}
              </span>
            )}
          </div>

          <div className="admin-account-overview-info">
            <h2>
              {user.firstName}{" "}
              {user.lastName}
            </h2>

            <p>{user.email}</p>

            <div className="admin-account-badges">
              <span className="admin-account-role-badge">
                {formatRole(user.role)}
              </span>

              <span
                className={`admin-account-status-badge ${
                  user.isActive
                    ? "active"
                    : "inactive"
                }`}
              >
                <span className="admin-account-status-dot" />
                {user.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>

          <Link
            to="/admin/profile"
            className="admin-account-edit-button"
          >
            Edit Profile
          </Link>
        </section>

        <div className="admin-account-grid">
          <section className="admin-account-section">
            <div className="admin-account-section-header">
              <div className="admin-account-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M4 21a8 8 0 0 1 16 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>
                  Your basic account information.
                </p>
              </div>
            </div>

            <div className="admin-account-details">
              <div className="admin-account-detail">
                <span>Full Name</span>
                <strong>
                  {user.firstName}{" "}
                  {user.lastName}
                </strong>
              </div>

              <div className="admin-account-detail">
                <span>Email Address</span>
                <strong>
                  {user.email}
                </strong>
              </div>

              <div className="admin-account-detail">
                <span>Account Role</span>
                <strong>
                  {formatRole(user.role)}
                </strong>
              </div>

              <div className="admin-account-detail">
                <span>Account Status</span>
                <strong>
                  {user.isActive
                    ? "Active"
                    : "Inactive"}
                </strong>
              </div>
            </div>

            <Link
              to="/admin/profile"
              className="admin-account-section-link"
            >
              Manage profile
              <span>→</span>
            </Link>
          </section>

          <section className="admin-account-section">
            <div className="admin-account-section-header">
              <div className="admin-account-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2>Security</h2>
                <p>
                  Keep your account protected.
                </p>
              </div>
            </div>

            <div className="admin-account-security">
              <div className="admin-account-security-row">
                <div>
                  <strong>Password</strong>
                  <span>
                    Manage your account password.
                  </span>
                </div>

                <Link
                  to="/admin/profile"
                  className="admin-account-small-button"
                >
                  Change
                </Link>
              </div>

              <div className="admin-account-security-row">
                <div>
                  <strong>Authentication</strong>
                  <span>
                    Your account is protected by
                    secure session authentication.
                  </span>
                </div>

                <span className="admin-account-security-status">
                  Enabled
                </span>
              </div>
            </div>
          </section>

          <section className="admin-account-section">
            <div className="admin-account-section-header">
              <div className="admin-account-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3v18M3 12h18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div>
                <h2>Access & Permissions</h2>
                <p>
                  Your current role determines the
                  areas you can access.
                </p>
              </div>
            </div>

            <div className="admin-account-access">
              <div className="admin-account-access-item">
                <span>Role</span>
                <strong>
                  {formatRole(user.role)}
                </strong>
              </div>

              <div className="admin-account-access-item">
                <span>Applications</span>
                <strong>Available</strong>
              </div>

              <div className="admin-account-access-item">
                <span>Jobs Management</span>
                <strong>Available</strong>
              </div>

              <div className="admin-account-access-item">
                <span>User Management</span>
                <strong>
                  {user.role === "SUPER_ADMIN" ||
                  user.role === "ADMIN"
                    ? "Available"
                    : "Restricted"}
                </strong>
              </div>
            </div>

            <p className="admin-account-note">
              Permissions are controlled by your
              assigned role and cannot be changed
              from this page.
            </p>
          </section>

          <section className="admin-account-section danger">
            <div className="admin-account-section-header">
              <div className="admin-account-danger-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 3 3.5 19h17L12 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9v4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="16.5"
                    r="0.8"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <h2>Sign Out</h2>
                <p>
                  End your current admin session.
                </p>
              </div>
            </div>

            <div className="admin-account-danger-content">
              <p>
                Signing out will end your current
                session. You can sign in again at
                any time.
              </p>

              <button
                type="button"
                className="admin-account-logout-button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? "Signing out..."
                  : "Sign Out"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}