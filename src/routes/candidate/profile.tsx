import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  getCurrentUser,
  logout,
  updateProfilePhoto,
  type AuthUser,
} from "@/services/auth.service";

import "@/styles/candidate-profile.css";

export const Route = createFileRoute(
  "/candidate/profile",
)({
  component: CandidateProfilePage,
});

function CandidateProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

    const [uploadingPhoto, setUploadingPhoto] =
  useState(false);

const [photoPreview, setPhotoPreview] =
  useState<string | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError("");

        const result =
          await getCurrentUser();

       setUser(result.data ?? null);
      } catch (error) {
        console.error(
          "Failed to load candidate profile:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handlePhotoChange(
  event: React.ChangeEvent<HTMLInputElement>,
) {
  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !allowedTypes.includes(
      file.type,
    )
  ) {
    setError(
      "Only JPG, PNG and WEBP images are allowed.",
    );

    return;
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    setError(
      "Profile image must be less than 5MB.",
    );

    return;
  }

  try {
    setError("");

    setUploadingPhoto(true);

    // Local preview
    const previewUrl =
      URL.createObjectURL(file);

    setPhotoPreview(
      previewUrl,
    );

    // Upload
    const result =
      await updateProfilePhoto(
        file,
      );

    // Update current user
    if (result.data) {
      setUser(result.data);
    }

    setPhotoPreview(null);
  } catch (error) {
    console.error(
      "Profile photo upload failed:",
      error,
    );

    setPhotoPreview(null);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to upload profile photo.",
    );
  } finally {
    setUploadingPhoto(false);

    event.target.value = "";
  }
}

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await logout();

      await navigate({
        to: "/candidate/login",
         search: {
    redirect: "/candidate/profile",
  },
      });
    } catch (error) {
      console.error(
        "Logout failed:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Logout failed.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="candidate-profile-page">
        <section className="candidate-profile-card">
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="candidate-profile-page">
        <section className="candidate-profile-card">
          <div
            className="candidate-profile-error"
            role="alert"
          >
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/candidate/login",
                 search: {
    redirect: "/candidate/profile",
  },
              })
            }
          >
            Go to Login
          </button>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="candidate-profile-page">
      <section className="candidate-profile-card">

        <header className="candidate-profile-header">
          <div>
            <p className="candidate-profile-eyebrow">
              CANDIDATE PORTAL
            </p>

            <h1>
              My Profile
            </h1>

            <p>
              Manage your personal
              information and application
              profile.
            </p>
          </div>

          <button
            type="button"
            className="candidate-logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </header>

        <div className="candidate-profile-content">

          <div className="candidate-profile-photo-section">

            <div className="candidate-profile-photo">
  {photoPreview ||
  user.profileImageUrl ? (
    <img
      src={
        photoPreview ??
        user.profileImageUrl ??
        ""
      }
      alt="Profile"
    />
  ) : (
    <span>
      {user.firstName
        .charAt(0)
        .toUpperCase()}
    </span>
  )}
</div>
           <label
  htmlFor="profile-photo-upload"
  className={`profile-photo-button ${
    uploadingPhoto
      ? "uploading"
      : ""
  }`}
>
  {uploadingPhoto
    ? "Uploading..."
    : "Upload Photo"}
</label>

<input
  id="profile-photo-upload"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={
    handlePhotoChange
  }
  disabled={uploadingPhoto}
  hidden
/>

<p>
  JPG, PNG or WEBP · Max 5MB
</p>
          </div>

          <div className="candidate-profile-info">

            <div className="profile-info-field">
              <span>
                First Name
              </span>

              <strong>
                {user.firstName}
              </strong>
            </div>

            <div className="profile-info-field">
              <span>
                Last Name
              </span>

              <strong>
                {user.lastName}
              </strong>
            </div>

            <div className="profile-info-field">
              <span>
                Email
              </span>

              <strong>
                {user.email}
              </strong>
            </div>

            <div className="profile-info-field">
              <span>
                Account Status
              </span>

              <strong>
                {user.isActive
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

          </div>

        </div>

        

      </section>
    </main>
  );
}