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
  ScreeningResult,
} from "@/services/screening.service";

import "@/styles/screening.css";

export const Route = createFileRoute(
  "/screening/$applicationId",
)({
  component: ScreeningPage,
});

function ScreeningPage() {
  const { applicationId } =
    Route.useParams();

  const id = Number(applicationId);

  const [
    screening,
    setScreening,
  ] =
    useState<ScreeningResult | null>(
      null,
    );

  const [
    decision,
    setDecision,
  ] =
    useState<ScreeningDecision | "">("");

  const [
    note,
    setNote,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // ================================
  // LOAD SCREENING
  // ================================

  useEffect(() => {
    async function loadScreening() {
      try {
        setLoading(true);
        setError("");

        const result =
          await getScreeningDecision(id);

        setScreening(result);

        if (result) {
          setDecision(
            result.decision,
          );

          setNote(
            result.note ?? "",
          );
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load screening.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadScreening();
  }, [id]);


  // ================================
  // SAVE
  // ================================

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!decision) {
      setError(
        "Please select a screening decision.",
      );

      return;
    }

    try {
      setSaving(true);

      const result =
        await saveScreeningDecision(
          id,
          decision,
          note,
        );

      setScreening(result);

      setSuccess(
        "Screening decision saved successfully.",
      );
    } catch (error) {
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
      <div className="screening-page">
        <div className="screening-loading">
          Loading screening...
        </div>
      </div>
    );
  }


  return (
    <div className="screening-page">

      {/* HEADER */}

      <div className="screening-header">

        <div>
          <div className="breadcrumb">
            <Link to="/admin/applications">
              Applications
            </Link>

            <span>/</span>

            <span>
              Screening
            </span>
          </div>

          <h1>
            Screening & Decision
          </h1>

          <p>
            Review the candidate and
            record the screening decision.
          </p>
        </div>

        <Link
          to="/admin/applications/$applicationId"
          className="back-button"
        >
          ← Back to Applications
        </Link>

      </div>


      {/* ALERTS */}

      {error && (
        <div className="screening-alert error">
          {error}
        </div>
      )}

      {success && (
        <div className="screening-alert success">
          {success}
        </div>
      )}


      <div className="screening-grid">

        {/* LEFT */}

        <div className="screening-card">

          <div className="card-header">

            <div>
              <h2>
                Screening Decision
              </h2>

              <p>
                Select the appropriate
                decision for this candidate.
              </p>
            </div>

          </div>


          {/* DECISIONS */}

          <div className="decision-options">

            <button
              type="button"
              className={`decision-option pass ${
                decision === "pass"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setDecision("pass")
              }
            >
              <div className="decision-icon">
                ✓
              </div>

              <div>
                <strong>
                  Pass
                </strong>

                <span>
                  Move candidate to
                  shortlisted.
                </span>
              </div>
            </button>


            <button
              type="button"
              className={`decision-option hold ${
                decision === "hold"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setDecision("hold")
              }
            >
              <div className="decision-icon">
                ⏸
              </div>

              <div>
                <strong>
                  Hold
                </strong>

                <span>
                  Keep candidate under
                  review.
                </span>
              </div>
            </button>


            <button
              type="button"
              className={`decision-option reject ${
                decision === "reject"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setDecision("reject")
              }
            >
              <div className="decision-icon">
                ×
              </div>

              <div>
                <strong>
                  Reject
                </strong>

                <span>
                  Candidate does not meet
                  requirements.
                </span>
              </div>
            </button>

          </div>


          {/* NOTE */}

          <div className="note-section">

            <label>
              Screening Notes
            </label>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value,
                )
              }
              maxLength={1000}
              placeholder="Write your screening notes here..."
              rows={8}
            />

            <div className="character-count">
              {note.length}/1000
            </div>

          </div>


          {/* SAVE */}

          <div className="save-section">

            <button
              type="button"
              className="save-button"
              disabled={saving}
              onClick={handleSave}
            >
              {saving
                ? "Saving..."
                : "Save Decision"}
            </button>

          </div>

        </div>


        {/* RIGHT */}

        <div className="screening-card">

          <div className="card-header">

            <div>
              <h2>
                Current Status
              </h2>

              <p>
                Latest screening information
              </p>
            </div>

          </div>


          <div className="status-content">

            <div className="status-row">

              <span>
                Application ID
              </span>

              <strong>
                #{applicationId}
              </strong>

            </div>


            <div className="status-row">

              <span>
                Screening Decision
              </span>

              <strong
                className={`status-badge ${
                  screening?.decision ??
                  decision
                }`}
              >
                {screening?.decision ??
                  "Not reviewed"}
              </strong>

            </div>


            <div className="status-row">

              <span>
                Application Status
              </span>

              <strong
                className="status-badge status"
              >
                {screening
                  ?.applicationStatus ??
                  "Pending"}
              </strong>

            </div>


            <div className="status-row">

              <span>
                Last Updated
              </span>

              <strong>
                {screening?.updatedAt
                  ? new Date(
                      screening.updatedAt,
                    ).toLocaleString()
                  : "Not reviewed"}
              </strong>

            </div>

          </div>


          {/* NOTE PREVIEW */}

          <div className="saved-note">

            <h3>
              Latest Screening Note
            </h3>

            <div className="note-preview">

              {screening?.note
                ? screening.note
                : "No screening note has been added yet."}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}