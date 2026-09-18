import { useNavigate } from "@tanstack/react-router";

import type { UserRole } from "@/config/navigation";

type TopHeaderProps = {
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImageUrl?: string | null;
  onLogout: () => Promise<void> | void;
};

export default function TopHeader({
  firstName,
  lastName,
  role,
  profileImageUrl,
  onLogout,
}: TopHeaderProps) {
  const navigate = useNavigate();

  const fullName =
    `${firstName} ${lastName}`.trim();

  const initial =
    firstName?.charAt(0).toUpperCase() ||
    "U";

  async function handleLogout() {
    try {
      await onLogout();

      await navigate({
        to: "/login",
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );
    }
  }

  return (
    <header className="app-top-header">

      <div className="top-header-left">

        <button
          type="button"
          className="mobile-menu-button"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div>
          <p className="top-header-label">
            Recruitment Management
          </p>

          <h1>
            Welcome back, {firstName}
          </h1>
        </div>

      </div>

      <div className="top-header-right">

        <div className="header-user">

          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={fullName}
              className="header-avatar"
            />
          ) : (
            <div className="header-avatar-placeholder">
              {initial}
            </div>
          )}

          <div className="header-user-info">

            <strong>
              {fullName}
            </strong>

            <span>
              {formatRole(role)}
            </span>

          </div>

        </div>

        <button
          type="button"
          className="header-logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

function formatRole(
  role: UserRole,
) {
  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}