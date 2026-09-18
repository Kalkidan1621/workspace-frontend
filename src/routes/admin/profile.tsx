import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  changePassword,
  getCurrentUser,
  updateProfile,
  updateProfilePhoto,
} from "@/services/auth.service";

import type {
  AuthUser,
} from "@/services/auth.service";

import "@/styles/admin-profile.css";

export const Route = createFileRoute(
  "/admin/profile",
)({
  component: AdminProfilePage,
});

function AdminProfilePage() {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [profileForm, setProfileForm] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [profileMessage, setProfileMessage] =
    useState<string | null>(null);

  const [profileError, setProfileError] =
    useState<string | null>(null);

  const [passwordMessage, setPasswordMessage] =
    useState<string | null>(null);

  const [passwordError, setPasswordError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response =
          await getCurrentUser();

        if (
          mounted &&
          response.success &&
          response.data
        ) {
          setUser(response.data);

          setProfileForm({
            firstName:
              response.data.firstName,
            lastName:
              response.data.lastName,
            email:
              response.data.email,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load profile:",
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

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

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

  async function handleProfileSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileMessage(null);
    setProfileError(null);

    try {
      setSavingProfile(true);

      const response =
        await updateProfile(
          profileForm,
        );

      if (response.data) {
        setUser((current) =>
          current
            ? {
                ...current,
                ...response.data,
              }
            : current,
        );
      }

      setProfileMessage(
        "Profile updated successfully.",
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePhotoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileMessage(null);
    setProfileError(null);

    try {
      setUploadingPhoto(true);

      const response =
        await updateProfilePhoto(file);

      if (response.data) {
        setUser((current) =>
          current
            ? {
                ...current,
                ...response.data,
              }
            : current,
        );
      }

      setProfileMessage(
        "Profile photo updated successfully.",
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Failed to update profile photo.",
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handlePasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage(null);
    setPasswordError(null);

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      await changePassword(
        passwordForm,
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "Password changed successfully.",
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-profile-page">
        <div className="admin-profile-loading">
          <div className="admin-profile-spinner" />
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="admin-profile-page">
      <div className="admin-profile-container">
        <header className="admin-profile-header">
          <div>
            <span className="admin-profile-eyebrow">
              ACCOUNT
            </span>

            <h1>My Profile</h1>

            <p>
              Manage your personal information
              and account security.
            </p>
          </div>
        </header>

        {profileMessage && (
          <div
            className="admin-profile-alert success"
            role="status"
          >
            {profileMessage}
          </div>
        )}

        {profileError && (
          <div
            className="admin-profile-alert error"
            role="alert"
          >
            {profileError}
          </div>
        )}

        <section className="admin-profile-grid">
          <aside className="admin-profile-sidebar">
            <div className="admin-profile-card">
              <div className="admin-profile-avatar-wrapper">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="admin-profile-avatar"
                  />
                ) : (
                  <div className="admin-profile-avatar-placeholder">
                    {getInitials()}
                  </div>
                )}

                <button
                  type="button"
                  className="admin-profile-camera"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploadingPhoto}
                  aria-label="Change profile photo"
                >
                  {uploadingPhoto ? "..." : "✎"}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                hidden
              />

              <h2>
                {user.firstName}{" "}
                {user.lastName}
              </h2>

              <p className="admin-profile-email">
                {user.email}
              </p>

              <span className="admin-profile-role">
                {formatRole(user.role)}
              </span>

              <div className="admin-profile-status">
                <span className="status-dot" />
                <span>
                  {user.isActive
                    ? "Active account"
                    : "Inactive account"}
                </span>
              </div>
            </div>
          </aside>

          <div className="admin-profile-content">
            <section className="admin-profile-section">
              <div className="admin-profile-section-header">
                <div>
                  <h2>Personal Information</h2>
                  <p>
                    Update the information
                    associated with your account.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="admin-profile-form"
              >
                <div className="admin-profile-form-grid">
                  <div className="admin-profile-field">
                    <label htmlFor="firstName">
                      First Name
                    </label>

                    <input
                      id="firstName"
                      type="text"
                      value={
                        profileForm.firstName
                      }
                      onChange={(event) =>
                        setProfileForm(
                          (current) => ({
                            ...current,
                            firstName:
                              event.target.value,
                          }),
                        )
                      }
                      required
                    />
                  </div>

                  <div className="admin-profile-field">
                    <label htmlFor="lastName">
                      Last Name
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      value={
                        profileForm.lastName
                      }
                      onChange={(event) =>
                        setProfileForm(
                          (current) => ({
                            ...current,
                            lastName:
                              event.target.value,
                          }),
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="admin-profile-field">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={
                      profileForm.email
                    }
                    onChange={(event) =>
                      setProfileForm(
                        (current) => ({
                          ...current,
                          email:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>

                <div className="admin-profile-field">
                  <label>Role</label>

                  <input
                    type="text"
                    value={formatRole(
                      user.role,
                    )}
                    disabled
                  />

                  <small>
                    Your role is managed by an
                    administrator.
                  </small>
                </div>

                <div className="admin-profile-actions">
                  <button
                    type="submit"
                    className="admin-profile-primary-button"
                    disabled={savingProfile}
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>

            <section className="admin-profile-section">
              <div className="admin-profile-section-header">
                <div>
                  <h2>Security</h2>
                  <p>
                    Change your password to
                    keep your account secure.
                  </p>
                </div>
              </div>

              {passwordMessage && (
                <div className="admin-profile-alert success">
                  {passwordMessage}
                </div>
              )}

              {passwordError && (
                <div className="admin-profile-alert error">
                  {passwordError}
                </div>
              )}

              <form
                onSubmit={
                  handlePasswordSubmit
                }
                className="admin-profile-form"
              >
                <div className="admin-profile-field">
                  <label htmlFor="currentPassword">
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    value={
                      passwordForm.currentPassword
                    }
                    onChange={(event) =>
                      setPasswordForm(
                        (current) => ({
                          ...current,
                          currentPassword:
                            event.target.value,
                        }),
                      )
                    }
                    required
                  />
                </div>

                <div className="admin-profile-form-grid">
                  <div className="admin-profile-field">
                    <label htmlFor="newPassword">
                      New Password
                    </label>

                    <input
                      id="newPassword"
                      type="password"
                      value={
                        passwordForm.newPassword
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (current) => ({
                            ...current,
                            newPassword:
                              event.target.value,
                          }),
                        )
                      }
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="admin-profile-field">
                    <label htmlFor="confirmPassword">
                      Confirm New Password
                    </label>

                    <input
                      id="confirmPassword"
                      type="password"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (current) => ({
                            ...current,
                            confirmPassword:
                              event.target.value,
                          }),
                        )
                      }
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <div className="admin-profile-actions">
                  <button
                    type="submit"
                    className="admin-profile-secondary-button"
                    disabled={
                      changingPassword
                    }
                  >
                    {changingPassword
                      ? "Updating..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}