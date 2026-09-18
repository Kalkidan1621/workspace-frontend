import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import {
  getCurrentUser,
  logout,
} from "@/services/auth.service";

import type { AuthUser } from "@/services/auth.service";

type IconName =
  | "dashboard"
  | "applications"
  | "profile"
  | "jobs"
  | "management"
  | "account"
  | "logout";

function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...commonProps}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );

    case "applications":
      return (
        <svg {...commonProps}>
          <rect
            x="5"
            y="3"
            width="14"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 8H16M8 12H16M8 16H13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "profile":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="8"
            r="3.2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M5.5 20C6.2 16.5 8.4 14.5 12 14.5C15.6 14.5 17.8 16.5 18.5 20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "jobs":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="6"
            width="18"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M9 6V4.8C9 3.8 9.8 3 10.8 3H13.2C14.2 3 15 3.8 15 4.8V6"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3 11H21M10 11V13H14V11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "management":
      return (
        <svg {...commonProps}>
          <circle
            cx="9"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M3.5 20C4.1 16.7 6 15 9 15C12 15 13.9 16.7 14.5 20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16 8H21M18.5 5.5V10.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "account":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 15A1.7 1.7 0 0 0 19.7 17.1L19.8 17.2L17.2 19.8L17.1 19.7A1.7 1.7 0 0 0 15 19.4A1.7 1.7 0 0 0 13.8 21H10.2A1.7 1.7 0 0 0 9 19.4A1.7 1.7 0 0 0 6.9 19.7L6.8 19.8L4.2 17.2L4.3 17.1A1.7 1.7 0 0 0 4.6 15A1.7 1.7 0 0 0 3 13.8V10.2A1.7 1.7 0 0 0 4.6 9A1.7 1.7 0 0 0 4.3 6.9L4.2 6.8L6.8 4.2L6.9 4.3A1.7 1.7 0 0 0 9 4.6A1.7 1.7 0 0 0 10.2 3H13.8A1.7 1.7 0 0 0 15 4.6A1.7 1.7 0 0 0 17.1 4.3L17.2 4.2L19.8 6.8L19.7 6.9A1.7 1.7 0 0 0 19.4 9A1.7 1.7 0 0 0 21 10.2V13.8A1.7 1.7 0 0 0 19.4 15Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "logout":
      return (
        <svg {...commonProps}>
          <path
            d="M10 5H6.5C5.7 5 5 5.7 5 6.5V17.5C5 18.3 5.7 19 6.5 19H10"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M13 8L17 12L13 16M9 12H17"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function formatRole(role?: string | null) {
  if (!role) return "";

  return role
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export default function Header() {
  const router = useRouter();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const userMenuRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response =
          await getCurrentUser();

        if (
          mounted &&
          response.success &&
          response.data
        ) {
          setUser(response.data);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  // Close with Escape
  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape" &&
        menuOpen
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [menuOpen]);

  async function handleLogout() {
    try {
      setMenuOpen(false);

      await logout();

      setUser(null);

      await router.navigate({
        to: "/login",
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );
    }
  }

  const role =
    user?.role?.toUpperCase();

  const isCandidate =
    role === "CANDIDATE";

  const isAdmin =
    role === "ADMIN" ||
    role === "SUPER_ADMIN";

  const isRecruiter =
    role === "RECRUITER";

  const isHiringManager =
    role === "HIRING_MANAGER";

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "";

  const formattedRole =
    formatRole(user?.role);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <header className="site-navigation">
      <div className="site-navigation-container">

        {/* LOGO */}
        <Link
          to="/"
          className="site-logo"
        >
          <img
            src="/image.webp"
            alt="Job Portal"
            className="site-logo-image"
          />
        </Link>


           

        {/* USER AREA */}
        {user && (
          <div
            className="site-navigation-user"
            ref={userMenuRef}
          >
            {/* PROFILE BUTTON */}
            <button
              type="button"
              className="site-user-menu-button"
              onClick={() =>
                setMenuOpen(
                  (current) => !current,
                )
              }
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={displayName}
                  className="site-user-avatar"
                />
              ) : (
                <div className="site-user-avatar-placeholder">
                  {initials}
                </div>
              )}

              <div className="site-user-info">
                <strong>
                  {displayName}
                </strong>

                <span>
                  {formattedRole}
                </span>
              </div>

              <span
                className={`site-user-chevron ${
                  menuOpen ? "open" : ""
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {/* DROPDOWN */}
            {menuOpen && (
              <div
                className="site-user-dropdown"
                role="menu"
              >
                {/* PROFILE SUMMARY */}
                <div className="site-user-dropdown-header">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={displayName}
                      className="site-dropdown-avatar"
                    />
                  ) : (
                    <div className="site-dropdown-avatar-placeholder">
                      {initials}
                    </div>
                  )}

                  <div className="site-dropdown-user-details">
                    <strong>
                      {displayName}
                    </strong>

                    <span className="site-dropdown-role">
                      {formattedRole}
                    </span>

                    <span className="site-dropdown-email">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="site-user-dropdown-divider" />

                {/* ADMIN MENU */}
                {isAdmin && (
                  <>
                    <Link
                      to="/admin"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="dashboard" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Dashboard
                        </strong>
                        <small>
                          Overview and activity
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/admin/applications"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="applications" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Applications
                        </strong>
                        <small>
                          Manage candidate applications
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/admin/profile"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="profile" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Profile
                        </strong>
                        <small>
                          View your profile
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/jobs"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="jobs" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Jobs
                        </strong>
                        <small>
                          Manage job listings
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/admin/users"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="management" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Management
                        </strong>
                        <small>
                          Users and administration
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/admin/account"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="account" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Account
                        </strong>
                        <small>
                          Account preferences
                        </small>
                      </span>
                    </Link>
                  </>
                )}

                {/* CANDIDATE MENU */}
                {isCandidate && (
                  <>
                    <Link
                      to="/candidate/profile"
                      className="site-user-dropdown-item"
                      activeProps={{
                        className:
                          "site-user-dropdown-item active",
                      }}
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="profile" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          My Profile
                        </strong>
                        <small>
                          View your profile
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/jobs"
                      className="site-user-dropdown-item"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="jobs" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          Jobs
                        </strong>
                        <small>
                          Browse available jobs
                        </small>
                      </span>
                    </Link>

                    <Link
                      to="/candidate/applications"
                      className="site-user-dropdown-item"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                      role="menuitem"
                    >
                      <span className="site-dropdown-icon">
                        <Icon name="applications" />
                      </span>

                      <span className="site-dropdown-item-content">
                        <strong>
                          My Applications
                        </strong>
                        <small>
                          Track your applications
                        </small>
                      </span>
                    </Link>
                  </>
                )}

                {/* LOGOUT */}
                <div className="site-user-dropdown-divider" />

                <button
                  type="button"
                  className="site-user-dropdown-item logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <span className="site-dropdown-icon">
                    <Icon name="logout" />
                  </span>

                  <span className="site-dropdown-item-content">
                    <strong>
                      Sign out
                    </strong>
                    <small>
                      Sign out of your account
                    </small>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}