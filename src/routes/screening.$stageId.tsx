import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  getScreeningDecision,
  saveScreeningDecision,
} from "@/services/screening.service";

import type {
  ScreeningDecision,
} from "@/types/screening";

import "@/styles/screening.css";

export const Route = createFileRoute(
  "/screening/$stageId",
)({
  component: ScreeningPage,
});

function ScreeningPage() {
  const { stageId } = Route.useParams();

  /*
   * The route parameter is named stageId for now
   * because that is the existing TanStack route name.
   *
   * The actual value is the application ID.
   */
  const applicationId = Number(stageId);

  const [decision, setDecision] =
    useState<ScreeningDecision | "">("");

  const [note, setNote] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadDecision();
  }, [applicationId]);

  async function loadDecision() {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (
        !Number.isInteger(applicationId) ||
        applicationId <= 0
      ) {
        throw new Error(
          "Invalid application ID.",
        );
      }

      const result =
        await getScreeningDecision(
          applicationId,
        );

      /*
       * getScreeningDecision() returns
       * ScreeningResult | null directly.
       *
       * Therefore we do NOT use result.data.
       */
      if (result) {
        setDecision(result.decision);
        setNote(result.note ?? "");
      } else {
        setDecision("");
        setNote("");
      }
    } catch (error) {
      console.error(
        "Failed to load screening decision:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load screening decision.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      setError(
        "Invalid application ID.",
      );
      return;
    }

    if (!decision) {
      setError(
        "Please select a screening decision.",
      );
      return;
    }

    if (!note.trim()) {
      setError(
        "Please enter a screening note.",
      );
      return;
    }

    try {
      setSaving(true);

      await saveScreeningDecision(
        applicationId,
        decision,
        note.trim(),
      );

      setSuccess(
        "Screening decision saved successfully.",
      );

      await loadDecision();
    } catch (error) {
      console.error(
        "Failed to save screening decision:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save screening decision.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="screening-page">
        <div className="screening-state">
          Loading screening...
        </div>
      </main>
    );
  }

  return (
    <main className="screening-page">
      <div className="screening-container">

        {/* BACK */}

        <Link
          to="/admin/applications"
          className="screening-back-link"
        >
          ← Back to Applications
        </Link>

        {/* HEADER */}

        <header className="screening-header">
          <p className="screening-eyebrow">
            CANDIDATE SCREENING
          </p>

          <h1>
            Screening Notes & Decision
          </h1>

          <p>
            Review the candidate and record
            your screening decision.
          </p>

          <span className="screening-application-id">
            Application #{applicationId}
          </span>
        </header>

        {/* ERROR */}

        {error && (
          <div
            className="screening-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            className="screening-success"
            role="status"
          >
            {success}
          </div>
        )}

        {/* SCREENING FORM */}

        <section className="screening-card">

          {/* DECISION */}

          <div className="screening-field">
            <label htmlFor="decision">
              Decision
            </label>

            <select
              id="decision"
              value={decision}
              onChange={(event) =>
                setDecision(
                  event.target.value as
                    | ScreeningDecision
                    | "",
                )
              }
              disabled={saving}
            >
              <option value="">
                Select decision
              </option>

              <option value="pass">
                Pass
              </option>

              <option value="hold">
                Hold
              </option>

              <option value="reject">
                Reject
              </option>
            </select>
          </div>

          {/* NOTE */}

          <div className="screening-field">
            <label htmlFor="note">
              Screening Note
            </label>

            <textarea
              id="note"
              value={note}
              maxLength={1000}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              placeholder="Enter your screening notes..."
              rows={7}
              disabled={saving}
            />

            <small>
              {note.length}/1000
            </small>
          </div>

          {/* SAVE */}

          <button
            type="button"
            className="screening-save-button"
            disabled={saving}
            onClick={handleSave}
          >
            {saving
              ? "Saving..."
              : "Save Decision"}
          </button>

        </section>

        {/* SAVED DECISION */}

        {decision && (
          <section className="screening-saved-card">

            <p className="screening-eyebrow">
              SAVED DECISION
            </p>

            <h2>
              {decision === "pass"
                ? "Pass"
                : decision === "hold"
                  ? "Hold"
                  : "Reject"}
            </h2>

            {note && (
              <p>{note}</p>
            )}

          </section>
        )}

      </div>
    </main>
  );
}