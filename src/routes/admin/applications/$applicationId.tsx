import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getApplicationById,
} from "@/services/applications.service";

import type {
  Application,
} from "@/types/applications";

import {
  createInterview,
  getApplicationInterview,
  updateInterviewStatus,
} from "@/services/interview.service";

import type {
  Interview,
  CreateInterviewInput,
} from "@/services/interview.service";

import {
  getHiringDecision,
  saveHiringDecision,
  reviewHiringDecision,
  markApplicationAsHired,
} from "@/services/hiring-decision.service";

import type {
  HiringDecision,
  HiringDecisionResult,
} from "@/services/hiring-decision.service";

import "@/styles/admin-applications.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
export const Route = createFileRoute(
  "/admin/applications/$applicationId",
)({
  component: ApplicationDetailsPage,
});

type Tab =
  | "overview"
  | "screening"
  | "interview"
  | "hiring"
  | "history";

type InterviewAction =
  | "completed"
  | "cancelled"
  | "no_show";

type Interviewer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
};

/* =========================================================
   APPLICATION DETAILS PAGE
========================================================= */

function ApplicationDetailsPage() {
  const { applicationId } = Route.useParams();

  const numericApplicationId = Number(applicationId);

  const [application, setApplication] =
    useState<Application | null>(null);

  const [interview, setInterview] =
    useState<Interview | null>(null);

  const [hiringDecision, setHiringDecision] =
    useState<HiringDecisionResult | null>(null);

  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const [loading, setLoading] =
    useState(true);

  const [interviewLoading, setInterviewLoading] =
    useState(false);

  const [hiringLoading, setHiringLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showInterviewForm, setShowInterviewForm] =
    useState(false);

  /* =======================================================
     LOAD APPLICATION
  ======================================================= */

  const loadApplication = useCallback(async () => {
    if (
      !Number.isInteger(numericApplicationId) ||
      numericApplicationId <= 0
    ) {
      setError("Invalid application ID.");
      setLoading(false);
      return;
    }

    try {
      const data =
        await getApplicationById(
          numericApplicationId,
        );

      setApplication(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load application.",
      );
    }
  }, [numericApplicationId]);

  /* =======================================================
     LOAD INTERVIEW
  ======================================================= */

  const loadInterview = useCallback(async () => {
    if (
      !Number.isInteger(numericApplicationId) ||
      numericApplicationId <= 0
    ) {
      return;
    }

    try {
      const data =
        await getApplicationInterview(
          numericApplicationId,
        );

      setInterview(data);
    } catch {
      setInterview(null);
    }
  }, [numericApplicationId]);

  /* =======================================================
     LOAD HIRING DECISION
  ======================================================= */

  const loadHiringDecision =
    useCallback(async () => {
      if (
        !Number.isInteger(numericApplicationId) ||
        numericApplicationId <= 0
      ) {
        return;
      }

      try {
        const data =
          await getHiringDecision(
            numericApplicationId,
          );

        setHiringDecision(data);
      } catch {
        setHiringDecision(null);
      }
    }, [numericApplicationId]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!mounted) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        await Promise.all([
          loadApplication(),
          loadInterview(),
          loadHiringDecision(),
        ]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [
    loadApplication,
    loadInterview,
    loadHiringDecision,
  ]);

  /* =======================================================
     REFRESH ALL
  ======================================================= */

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadApplication(),
      loadInterview(),
      loadHiringDecision(),
    ]);
  }, [
    loadApplication,
    loadInterview,
    loadHiringDecision,
  ]);

  /* =======================================================
     SCHEDULE INTERVIEW
  ======================================================= */

  const handleScheduleInterview = async (
    data: CreateInterviewInput,
  ) => {
    if (!application) {
      return;
    }

    setInterviewLoading(true);
    setError("");
    setSuccess("");

    try {
      await createInterview(
        application.id,
        data,
      );

      await refreshAll();

      setShowInterviewForm(false);
      setActiveTab("interview");

      setSuccess(
        "Interview has been scheduled successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule interview.",
      );
    } finally {
      setInterviewLoading(false);
    }
  };

  /* =======================================================
     REVIEW AGAIN
  ======================================================= */

  const handleReviewAgain = async () => {
    if (!application) {
      return;
    }

    const confirmed = window.confirm(
      "Move this application back to Hiring Decision for another review?",
    );

    if (!confirmed) {
      return;
    }

    setHiringLoading(true);
    setError("");
    setSuccess("");

    try {
      await reviewHiringDecision(
        application.id,
      );

      await refreshAll();

      setActiveTab("hiring");

      setSuccess(
        "Application moved back to Hiring Decision.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reopen hiring decision.",
      );
    } finally {
      setHiringLoading(false);
    }
  };

  /* =======================================================
     MARK AS HIRED
  ======================================================= */

  const handleMarkAsHired = async () => {
    if (!application) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to mark this candidate as Hired?",
    );

    if (!confirmed) {
      return;
    }

    setHiringLoading(true);
    setError("");
    setSuccess("");

    try {
      await markApplicationAsHired(
        application.id,
      );

      await refreshAll();

      setActiveTab("hiring");

      setSuccess(
        "Candidate has been marked as Hired.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark candidate as hired.",
      );
    } finally {
      setHiringLoading(false);
    }
  };

  /* =======================================================
     INTERVIEW STATUS
  ======================================================= */
const handleInterviewAction = async (
  action: InterviewAction,
) => {
  if (!interview) {
    return;
  }

  const messages: Record<
    InterviewAction,
    string
  > = {
    completed:
      "Mark this interview as completed?",
    cancelled:
      "Cancel this interview?",
    no_show:
      "Mark this interview as no-show?",
  };

  const confirmed =
    window.confirm(messages[action]);

  if (!confirmed) {
    return;
  }

  setInterviewLoading(true);
  setError("");
  setSuccess("");

  try {
    // ========================================
    // 1. Update interview
    // ========================================

    await updateInterviewStatus(
      interview.id,
      action,
    );

    // ========================================
    // 2. Reload application from backend
    // ========================================

    const updatedApplication =
      await getApplicationById(
        numericApplicationId,
      );

    // ========================================
    // 3. Reload interview
    // ========================================

    const updatedInterview =
      await getApplicationInterview(
        numericApplicationId,
      );

    // ========================================
    // 4. Reload hiring decision
    // ========================================

    const updatedHiringDecision =
      await getHiringDecision(
        numericApplicationId,
      );

    // ========================================
    // 5. Update React state
    // ========================================

    setApplication(
      updatedApplication,
    );

    setInterview(
      updatedInterview,
    );

    setHiringDecision(
      updatedHiringDecision,
    );

    // ========================================
    // 6. COMPLETED
    // ========================================

    if (action === "completed") {
      const newStatus =
        normalizeStatus(
          updatedApplication.status,
        );

      console.log(
        "Application status after interview:",
        newStatus,
      );

      if (
        newStatus !==
        "hiring_decision"
      ) {
        throw new Error(
          `Interview completed, but application status is "${updatedApplication.status}". Expected "hiring_decision".`,
        );
      }

      setActiveTab("hiring");

      setSuccess(
        "Interview completed. Application moved to Hiring Decision.",
      );

      return;
    }

    // ========================================
    // 7. CANCELLED
    // ========================================

    if (action === "cancelled") {
      setSuccess(
        "Interview marked as cancelled.",
      );

      return;
    }

    // ========================================
    // 8. NO SHOW
    // ========================================

    if (action === "no_show") {
      setSuccess(
        "Interview marked as no-show.",
      );
    }
  } catch (err) {
    console.error(
      "Interview action error:",
      err,
    );

    setError(
      err instanceof Error
        ? err.message
        : "Failed to update interview.",
    );
  } finally {
    setInterviewLoading(false);
  }
};



  /* =======================================================
     HIRING DECISION
  ======================================================= */

  const handleHiringDecision = async (
    decision: HiringDecision,
    note: string,
  ) => {
    if (!application) {
      return;
    }

    setHiringLoading(true);
    setError("");
    setSuccess("");

    try {
      await saveHiringDecision(
        application.id,
        decision,
        note,
      );

      await refreshAll();

      setActiveTab("hiring");

      const messages: Record<
        HiringDecision,
        string
      > = {
        approve:
          "Candidate approved and moved to Ready for Hire.",
        hold:
          "Candidate has been placed On Hold.",
        reject:
          "Candidate has been rejected.",
      };

      setSuccess(messages[decision]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save hiring decision.",
      );
    } finally {
      setHiringLoading(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="application-page">
        <div className="application-loading">
          <div className="application-spinner" />

          <h2>
            Loading application...
          </h2>

          <p>
            Please wait while we load the candidate
            information.
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!application) {
    return (
      <div className="application-page">
        <div className="application-error-page">
          <div className="error-icon">
            !
          </div>

          <h2>
            Application not found
          </h2>

          <p>
            {error ||
              "The application you are looking for could not be found."}
          </p>

          <Link
            to="/admin/applications"
            className="btn btn-primary"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus =
    normalizeStatus(application.status);

  const candidateInitials =
    getInitials(application.fullName);

  return (
    <div className="application-page">
      <div className="application-container">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="application-breadcrumb">
          <Link to="/admin">
            Dashboard
          </Link>

          <span>/</span>

          <Link to="/admin/jobs">
            jobs
          </Link>

          <span>/</span>

          <strong>
            {application.fullName}
          </strong>
        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="application-alert alert-error">
            <div className="alert-icon">
              !
            </div>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              className="alert-close"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="application-alert alert-success">
            <div className="alert-icon">
              ✓
            </div>

            <div>
              <strong>
                Success
              </strong>

              <p>{success}</p>
            </div>

            <button
              type="button"
              className="alert-close"
              onClick={() => setSuccess("")}
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            CANDIDATE HEADER
        ================================================= */}

        <section className="candidate-header-card">
          <div className="candidate-header-main">

            <div className="candidate-avatar">
              {candidateInitials}
            </div>

            <div className="candidate-header-info">

              <div className="candidate-title-row">
                <div>
                  <h1>
                    {application.fullName}
                  </h1>

                  <p className="candidate-position">
                    {application.jobTitle ||
                      "Job Application"}
                  </p>
                </div>

                <StatusBadge
                  status={currentStatus}
                />
              </div>

              <div className="candidate-meta">

                <span>
                  <span className="meta-icon">
                    ✉
                  </span>

                  {application.email}
                </span>

                <span>
                  <span className="meta-icon">
                    ☎
                  </span>

                  {application.phone}
                </span>

                <span>
                  <span className="meta-icon">
                    ◷
                  </span>

                  Applied{" "}
                  {formatDate(
                    application.createdAt,
                  )}
                </span>

              </div>
            </div>
          </div>

          <div className="candidate-header-actions">

            {application.resumeUrl && (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
              >
                <span>↗</span>
                View CV
              </a>
            )}

            <a
              href={`mailto:${application.email}`}
              className="btn btn-primary"
            >
              <span>✉</span>
              Contact Candidate
            </a>

          </div>
        </section>

        {/* =================================================
            APPLICATION PIPELINE
        ================================================= */}

        <ApplicationPipeline
          status={currentStatus}
        />

        {/* =================================================
            TABS
        ================================================= */}

        <div className="application-tabs">

          <TabButton
            active={activeTab === "overview"}
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </TabButton>

          <TabButton
            active={activeTab === "screening"}
            onClick={() =>
              setActiveTab("screening")
            }
          >
            Screening
          </TabButton>

          <TabButton
            active={activeTab === "interview"}
            onClick={() =>
              setActiveTab("interview")
            }
          >
            Interview
          </TabButton>

          <TabButton
            active={activeTab === "hiring"}
            onClick={() =>
              setActiveTab("hiring")
            }
          >
            Hiring Decision
          </TabButton>

          <TabButton
            active={activeTab === "history"}
            onClick={() =>
              setActiveTab("history")
            }
          >
            History
          </TabButton>

        </div>

        {/* =================================================
            TAB CONTENT
        ================================================= */}

        <main className="application-content">

          {activeTab === "overview" && (
            <OverviewTab
              application={application}
            />
          )}

          {activeTab === "screening" && (
            <ScreeningTab
              application={application}
            />
          )}

          {activeTab === "interview" && (
            <InterviewTab
              application={application}
              interview={interview}
              showForm={showInterviewForm}
              loading={interviewLoading}
              onShowForm={() =>
                setShowInterviewForm(true)
              }
              onCancelForm={() =>
                setShowInterviewForm(false)
              }
              onSchedule={
                handleScheduleInterview
              }
              onAction={
                handleInterviewAction
              }
            />
          )}

          {activeTab === "hiring" && (
            <HiringTab
              application={application}
              hiringDecision={hiringDecision}
              loading={hiringLoading}
              onDecision={
                handleHiringDecision
              }
              onReviewAgain={
                handleReviewAgain
              }
              onMarkAsHired={
                handleMarkAsHired
              }
            />
          )}

          {activeTab === "history" && (
            <HistoryTab
              application={application}
              interview={interview}
              hiringDecision={
                hiringDecision
              }
            />
          )}

        </main>
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW TAB
========================================================= */

function OverviewTab({
  application,
}: {
  application: Application;
}) {
  return (
    <div className="overview-layout">

      <section className="content-card">
        <CardHeader
          eyebrow="APPLICATION"
          title="Application Overview"
        />

        <div className="info-list">

          <InfoRow
            label="Full Name"
            value={application.fullName}
          />

          <InfoRow
            label="Email"
            value={application.email}
          />

          <InfoRow
            label="Phone"
            value={application.phone}
          />

          <InfoRow
            label="Position"
            value={
              application.jobTitle ||
              "Not specified"
            }
          />

          <InfoRow
            label="Application Date"
            value={formatDate(
              application.createdAt,
            )}
          />

          <InfoRow
            label="Current Status"
            value={
              <StatusBadge
                status={normalizeStatus(
                  application.status,
                )}
              />
            }
          />

        </div>
      </section>

      <div className="overview-side">

        <section className="content-card">
          <CardHeader
            eyebrow="APPLICATION STATUS"
            title="Current Status"
          />

          <StatusBadge
            status={normalizeStatus(
              application.status,
            )}
          />

          <p className="card-description">
            This is the candidate's current
            position in the recruitment pipeline.
          </p>
        </section>

        <ResumeCard
          application={application}
        />

      </div>

      <ResumePreviewCard
        application={application}
      />

    </div>
  );
}

/* =========================================================
   SCREENING TAB
========================================================= */

function ScreeningTab({
  application,
}: {
  application: Application;
}) {
  return (
    <section className="content-card screening-card">

      <CardHeader
        eyebrow="SCREENING"
        title="Screening Notes & Decision"
      />

      <div className="feature-intro">
        <div className="feature-icon">
          ✓
        </div>

        <div>
          <h3>
            Review candidate screening
          </h3>

          <p>
            Record recruiter notes and determine
            whether the candidate should continue
            through the recruitment process.
          </p>
        </div>
      </div>

      <div className="screening-action">
        <Link
          to="/screening/$applicationId"
          params={{
            applicationId: String(
              application.id,
            ),
          }}
          className="btn btn-primary btn-large"
        >
          Open Screening
          <span>→</span>
        </Link>
      </div>

    </section>
  );
}

/* =========================================================
   INTERVIEW TAB
========================================================= */

function InterviewTab({
  application,
  interview,
  showForm,
  loading,
  onShowForm,
  onCancelForm,
  onSchedule,
  onAction,
}: {
  application: Application;
  interview: Interview | null;
  showForm: boolean;
  loading: boolean;
  onShowForm: () => void;
  onCancelForm: () => void;
  onSchedule: (
    data: CreateInterviewInput,
  ) => Promise<void>;
  onAction: (
    action: InterviewAction,
  ) => Promise<void>;
}) {
  if (showForm) {
    return (
      <InterviewForm
        loading={loading}
        onCancel={onCancelForm}
        onSubmit={onSchedule}
      />
    );
  }

  if (!interview) {
    const canSchedule =
      normalizeStatus(application.status) ===
      "shortlisted";

    return (
      <section className="content-card empty-state-card">

        <div className="empty-state-icon">
          ◷
        </div>

        <h2>
          No interview scheduled
        </h2>

        <p>
          Schedule an interview when the candidate
          has passed the screening stage.
        </p>

        {canSchedule ? (
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={onShowForm}
          >
            Schedule Interview
            <span>+</span>
          </button>
        ) : (
          <div className="info-message">
            The candidate must pass screening
            before an interview can be scheduled.
          </div>
        )}

      </section>
    );
  }

  return (
    <InterviewDetails
      interview={interview}
      loading={loading}
      onAction={onAction}
    />
  );
}

/* =========================================================
   INTERVIEW FORM
========================================================= */

function InterviewForm({
  loading,
  onCancel,
  onSubmit,
}: {
  loading: boolean;
  onCancel: () => void;
  onSubmit: (
    data: CreateInterviewInput,
  ) => Promise<void>;
}) {
  const [interviewers, setInterviewers] =
    useState<Interviewer[]>([]);

  const [interviewersLoading, setInterviewersLoading] =
    useState(true);

  const [interviewersError, setInterviewersError] =
    useState("");

  const [interviewerId, setInterviewerId] =
    useState("");

  const [interviewType, setInterviewType] =
    useState<
      CreateInterviewInput["interviewType"]
    >("online");

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [formError, setFormError] =
    useState("");

  /* =======================================================
     LOAD INTERVIEWERS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadInterviewers() {
      setInterviewersLoading(true);
      setInterviewersError("");

      try {
        const response = await fetch(
          `${API_URL}/admin/users/interviewers`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load interviewers.",
          );
        }

        if (!mounted) {
          return;
        }

        setInterviewers(
          Array.isArray(data.data)
            ? data.data
            : [],
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        setInterviewersError(
          err instanceof Error
            ? err.message
            : "Failed to load interviewers.",
        );
      } finally {
        if (mounted) {
          setInterviewersLoading(false);
        }
      }
    }

    void loadInterviewers();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setFormError("");

    if (!scheduledAt) {
      setFormError(
        "Please select the interview date and time.",
      );
      return;
    }

    let parsedInterviewerId:
      | number
      | undefined;

    if (interviewerId.trim()) {
      const value = Number(interviewerId);

      if (
        !Number.isInteger(value) ||
        value <= 0
      ) {
        setFormError(
          "Please select a valid interviewer.",
        );
        return;
      }

      parsedInterviewerId = value;
    }

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime())) {
      setFormError(
        "Please select a valid interview date and time.",
      );
      return;
    }

    const isoScheduledAt =
      date.toISOString();

    await onSubmit({
      interviewType,
      scheduledAt: isoScheduledAt,

      ...(parsedInterviewerId !== undefined
        ? {
            interviewerId:
              parsedInterviewerId,
          }
        : {}),

      ...(location.trim()
        ? {
            location:
              location.trim(),
          }
        : {}),

      ...(notes.trim()
        ? {
            notes:
              notes.trim(),
          }
        : {}),
    });
  };

  return (
    <section className="content-card">

      <CardHeader
        eyebrow="INTERVIEW"
        title="Schedule Interview"
      />

      <form
        className="professional-form"
        onSubmit={handleSubmit}
      >

        {formError && (
          <div className="application-alert alert-error">
            <div className="alert-icon">
              !
            </div>

            <div>
              <strong>
                Please check the form
              </strong>

              <p>{formError}</p>
            </div>

            <button
              type="button"
              className="alert-close"
              onClick={() =>
                setFormError("")
              }
            >
              ×
            </button>
          </div>
        )}

        <div className="form-grid">

          {/* =================================================
              INTERVIEWER
          ================================================= */}

          <div className="form-field">
            <label htmlFor="interviewerId">
              Interviewer
            </label>

            <select
              id="interviewerId"
              value={interviewerId}
              onChange={(event) =>
                setInterviewerId(
                  event.target.value,
                )
              }
              disabled={
                interviewersLoading ||
                loading
              }
            >
              <option value="">
                {interviewersLoading
                  ? "Loading interviewers..."
                  : "Select interviewer (optional)"}
              </option>

              {interviewers.map(
                (interviewer) => (
                  <option
                    key={interviewer.id}
                    value={interviewer.id}
                  >
                    {interviewer.firstName}{" "}
                    {interviewer.lastName}
                    {" — "}
                    {formatRoleName(
                      interviewer.roleName,
                    )}
                  </option>
                ),
              )}
            </select>

            {interviewersError && (
              <small className="form-error">
                {interviewersError}
              </small>
            )}

            {!interviewersLoading &&
              !interviewersError &&
              interviewers.length === 0 && (
                <small className="form-help">
                  No active recruiters or hiring
                  managers are available.
                </small>
              )}
          </div>

          {/* =================================================
              INTERVIEW TYPE
          ================================================= */}

          <div className="form-field">
            <label htmlFor="interviewType">
              Interview Type
            </label>

            <select
              id="interviewType"
              value={interviewType}
              onChange={(event) =>
                setInterviewType(
                  event.target
                    .value as CreateInterviewInput["interviewType"],
                )
              }
              disabled={loading}
            >
              <option value="online">
                Online
              </option>

              <option value="onsite">
                On-site
              </option>

              <option value="phone">
                Phone
              </option>
            </select>
          </div>

          {/* =================================================
              DATE & TIME
          ================================================= */}

          <div className="form-field">
            <label htmlFor="scheduledAt">
              Date & Time
            </label>

            <input
              id="scheduledAt"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(
                  event.target.value,
                )
              }
              disabled={loading}
            />
          </div>

          {/* =================================================
              LOCATION
          ================================================= */}

          <div className="form-field">
            <label htmlFor="location">
              Location / Meeting Link
            </label>

            <input
              id="location"
              type="text"
              maxLength={255}
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value,
                )
              }
              placeholder="Office address or meeting URL"
              disabled={loading}
            />
          </div>

        </div>

        {/* =================================================
            NOTES
        ================================================= */}

        <div className="form-field">
          <label htmlFor="interviewNotes">
            Interview Notes
          </label>

          <textarea
            id="interviewNotes"
            rows={5}
            maxLength={2000}
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            placeholder="Add interview instructions or notes..."
            disabled={loading}
          />

          <div className="character-count">
            {notes.length} / 2000
          </div>
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="form-actions">

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              loading ||
              !scheduledAt
            }
          >
            {loading
              ? "Scheduling..."
              : "Schedule Interview"}
          </button>

        </div>

      </form>
    </section>
  );
}

/* =========================================================
   INTERVIEW DETAILS
========================================================= */

function InterviewDetails({
  interview,
  loading,
  onAction,
}: {
  interview: Interview;
  loading: boolean;
  onAction: (
    action: InterviewAction,
  ) => Promise<void>;
}) {
  const interviewStatus =
    interview.status;

  const interviewerName =
    getInterviewerDisplayName(
      interview,
    );

  return (
    <div className="details-layout">

      <section className="content-card">

        <CardHeader
          eyebrow="INTERVIEW"
          title="Interview Details"
          right={
            <InterviewStatusBadge
              status={interviewStatus}
            />
          }
        />

        <div className="interview-detail-grid">

          <DetailBlock
            label="Interview Type"
            value={formatInterviewType(
              interview.interviewType,
            )}
          />

          <DetailBlock
            label="Scheduled Date"
            value={formatDateTime(
              interview.scheduledAt,
            )}
          />

          <DetailBlock
            label="Interviewer"
            value={
              interviewerName
            }
          />

          <DetailBlock
            label="Location"
            value={
              interview.location ||
              "Not specified"
            }
          />

        </div>

        {interview.notes && (
          <div className="notes-box">
            <span className="notes-label">
              Notes
            </span>

            <p>
              {interview.notes}
            </p>
          </div>
        )}

      </section>

      {interviewStatus === "scheduled" && (
        <section className="content-card action-card">

          <CardHeader
            eyebrow="INTERVIEW ACTIONS"
            title="Update Interview"
          />

          <p className="card-description">
            Update the interview status after
            the scheduled meeting.
          </p>

          <div className="action-buttons">

            <button
              type="button"
              className="btn btn-success"
              disabled={loading}
              onClick={() =>
                onAction("completed")
              }
            >
              ✓ Complete Interview
            </button>

            <button
              type="button"
              className="btn btn-danger-outline"
              disabled={loading}
              onClick={() =>
                onAction("cancelled")
              }
            >
              Cancel Interview
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              disabled={loading}
              onClick={() =>
                onAction("no_show")
              }
            >
              Mark No-show
            </button>

          </div>

        </section>
      )}

    </div>
  );
}

/* =========================================================
   HIRING TAB
========================================================= */

function HiringTab({
  application,
  hiringDecision,
  loading,
  onDecision,
  onReviewAgain,
  onMarkAsHired,
}: {
  application: Application;
  hiringDecision:
    | HiringDecisionResult
    | null;
  loading: boolean;
  onDecision: (
    decision: HiringDecision,
    note: string,
  ) => Promise<void>;
  onReviewAgain: () => Promise<void>;
  onMarkAsHired: () => Promise<void>;
}) {
  const status =
    normalizeStatus(application.status);

  if (status === "hiring_decision") {
    return (
      <HiringDecisionForm
        loading={loading}
        onSubmit={onDecision}
      />
    );
  }

  if (
    status === "ready_for_hire" ||
    status === "hired" ||
    status === "on_hold" ||
    status === "rejected"
  ) {
    return (
      <HiringDecisionResultView
        application={application}
        decision={hiringDecision}
        loading={loading}
        onReviewAgain={onReviewAgain}
        onMarkAsHired={onMarkAsHired}
      />
    );
  }

  return (
    <section className="content-card empty-state-card">

      <div className="empty-state-icon">
        ◉
      </div>

      <h2>
        Hiring Decision Not Available
      </h2>

      <p>
        The candidate must complete the interview
        before a final hiring decision can be made.
      </p>

      <div className="next-step-box">
        <strong>
          Next step
        </strong>

        <span>
          Complete the interview and then return
          here to make the hiring decision.
        </span>
      </div>

    </section>
  );
}

/* =========================================================
   HIRING DECISION FORM
========================================================= */

function HiringDecisionForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (
    decision: HiringDecision,
    note: string,
  ) => Promise<void>;
}) {
  const [decision, setDecision] =
    useState<HiringDecision | null>(
      null,
    );

  const [note, setNote] =
    useState("");

  const options: Array<{
    value: HiringDecision;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      value: "approve",
      title: "Approve",
      description:
        "Move the candidate to Ready for Hire.",
      icon: "✓",
    },
    {
      value: "hold",
      title: "Put On Hold",
      description:
        "Keep the candidate pending for further review.",
      icon: "Ⅱ",
    },
    {
      value: "reject",
      title: "Reject",
      description:
        "End the candidate's recruitment process.",
      icon: "×",
    },
  ];

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!decision) {
      return;
    }

    await onSubmit(
      decision,
      note.trim(),
    );
  };

  return (
    <section className="content-card hiring-form-card">

      <CardHeader
        eyebrow="FINAL REVIEW"
        title="Hiring Decision"
      />

      <div className="decision-intro">
        <p>
          Review the candidate's complete
          application and interview results before
          making a final decision.
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="decision-options">

          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`decision-option ${
                decision === option.value
                  ? `selected decision-${option.value}`
                  : ""
              }`}
              onClick={() =>
                setDecision(option.value)
              }
              disabled={loading}
            >
              <span className="decision-option-icon">
                {option.icon}
              </span>

              <span className="decision-option-content">
                <strong>
                  {option.title}
                </strong>

                <small>
                  {option.description}
                </small>
              </span>

              <span className="decision-radio">
                {decision === option.value
                  ? "●"
                  : "○"}
              </span>
            </button>
          ))}

        </div>

        <div className="form-field decision-note">

          <label htmlFor="hiringDecisionNote">
            Decision Notes
          </label>

          <textarea
            id="hiringDecisionNote"
            rows={7}
            maxLength={2000}
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            placeholder="Explain the reason for this hiring decision..."
            disabled={loading}
          />

          <div className="character-count">
            {note.length} / 2000
          </div>

        </div>

        <div className="decision-submit">

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={
              loading ||
              !decision
            }
          >
            {loading
              ? "Saving Decision..."
              : "Save Hiring Decision"}
          </button>

        </div>

      </form>
    </section>
  );
}

/* =========================================================
   HIRING DECISION RESULT
========================================================= */

function HiringDecisionResultView({
  application,
  decision,
  loading,
  onReviewAgain,
  onMarkAsHired,
}: {
  application: Application;
  decision:
    | HiringDecisionResult
    | null;
  loading: boolean;
  onReviewAgain: () => Promise<void>;
  onMarkAsHired: () => Promise<void>;
}) {
  const status =
    normalizeStatus(application.status);

  const isHired =
    status === "hired";

  const isReady =
    status === "ready_for_hire";

  const decisionValue =
    decision?.decision;

  return (
    <div className="hiring-result-layout">

      <section
        className={`content-card decision-result-card ${
          isHired
            ? "result-hired"
            : isReady
              ? "result-approved"
              : status === "rejected"
                ? "result-rejected"
                : "result-hold"
        }`}
      >

        <div className="result-icon">
          {isHired
            ? "✓"
            : decisionValue === "approve"
              ? "✓"
              : decisionValue === "reject"
                ? "×"
                : "Ⅱ"}
        </div>

        <div className="result-content">

          <span className="result-eyebrow">
            HIRING DECISION
          </span>

          <h2>
            {isHired
              ? "Candidate is Hired"
              : isReady
                ? "Ready for Hire"
                : status === "rejected"
                  ? "Candidate Rejected"
                  : "Candidate On Hold"}
          </h2>

          <p>
            {isHired
              ? "This candidate has completed the recruitment process and has been marked as hired."
              : isReady
                ? "The candidate has been approved and is ready to be hired."
                : status === "rejected"
                  ? "The candidate has been rejected from the hiring process."
                  : "The candidate is currently on hold and can be reviewed again."}
          </p>

        </div>

      </section>

      <section className="content-card">

        <CardHeader
          eyebrow="DECISION DETAILS"
          title="Review Information"
        />

        <div className="result-details">

          <InfoRow
            label="Decision"
            value={
              decision ? (
                <DecisionBadge
                  decision={
                    decision.decision
                  }
                />
              ) : (
                "No decision recorded"
              )
            }
          />

          <InfoRow
            label="Updated"
            value={
              decision
                ? formatDateTime(
                    decision.updatedAt,
                  )
                : "—"
            }
          />

        </div>

        {decision?.note && (
          <div className="decision-note-display">

            <span>
              Decision Notes
            </span>

            <p>
              {decision.note}
            </p>

          </div>
        )}

      </section>

      {!isHired && (
        <section className="content-card">

          <CardHeader
            eyebrow="NEXT ACTION"
            title="Application Actions"
          />

          <div className="result-actions">

            {status === "on_hold"
               && (
              <button
                type="button"
                className="btn btn-secondary btn-large"
                disabled={loading}
                onClick={onReviewAgain}
              >
                ↻ Review Again
              </button>
            )}

            {isReady && (
              <button
                type="button"
                className="btn btn-success btn-large"
                disabled={loading}
                onClick={onMarkAsHired}
              >
                ✓ Mark as Hired
              </button>
            )}

          </div>

        </section>
      )}

      {isHired && (
        <section className="hired-banner">

          <div className="hired-banner-icon">
            ✓
          </div>

          <div>
            <strong>
              Recruitment process completed
            </strong>

            <p>
              {application.fullName} is now
              officially marked as hired.
            </p>
          </div>

        </section>
      )}

    </div>
  );
}

/* =========================================================
   HISTORY
========================================================= */

function HistoryTab({
  application,
  interview,
  hiringDecision,
}: {
  application: Application;
  interview: Interview | null;
  hiringDecision:
    | HiringDecisionResult
    | null;
}) {
  const events = useMemo(() => {
    const result: Array<{
      title: string;
      description: string;
      date: string;
      type: string;
    }> = [];

    result.push({
      title: "Application submitted",
      description:
        "Candidate application was received.",
      date: application.createdAt,
      type: "application",
    });

    if (
      [
        "shortlisted",
        "interview",
        "hiring_decision",
        "ready_for_hire",
        "hired",
      ].includes(
        normalizeStatus(
          application.status,
        ),
      )
    ) {
      result.push({
        title:
          "Candidate passed screening",
        description:
          "Candidate progressed beyond the screening stage.",
        date: application.updatedAt,
        type: "screening",
      });
    }

    if (interview) {
      result.push({
        title:
          "Interview scheduled",
        description:
          `${formatInterviewType(
            interview.interviewType,
          )} interview scheduled.`,
        date: interview.createdAt,
        type: "interview",
      });

      if (
        interview.status ===
        "completed"
      ) {
        result.push({
          title:
            "Interview completed",
          description:
            "Interview was completed successfully.",
          date: interview.updatedAt,
          type: "interview",
        });
      }

      if (
        interview.status ===
        "cancelled"
      ) {
        result.push({
          title:
            "Interview cancelled",
          description:
            "The scheduled interview was cancelled.",
          date: interview.updatedAt,
          type: "interview",
        });
      }

      if (
        interview.status ===
        "no_show"
      ) {
        result.push({
          title:
            "Interview no-show",
          description:
            "The candidate did not attend the scheduled interview.",
          date: interview.updatedAt,
          type: "interview",
        });
      }
    }

    if (hiringDecision) {
      result.push({
        title:
          "Hiring decision recorded",
        description:
          `Decision: ${formatHiringDecision(
            hiringDecision.decision,
          )}.`,
        date: hiringDecision.updatedAt,
        type: "hiring",
      });
    }

    if (
      normalizeStatus(
        application.status,
      ) === "hired"
    ) {
      result.push({
        title:
          "Candidate hired",
        description:
          "Candidate completed the recruitment process.",
        date: application.updatedAt,
        type: "hired",
      });
    }

    return result.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime(),
    );
  }, [
    application,
    interview,
    hiringDecision,
  ]);

  return (
    <section className="content-card">

      <CardHeader
        eyebrow="ACTIVITY"
        title="Application History"
      />

      <div className="timeline">

        {events.map(
          (event, index) => (
            <div
              className="timeline-item"
              key={`${event.type}-${index}`}
            >

              <div
                className={`timeline-dot timeline-${event.type}`}
              >
                {event.type ===
                "hired"
                  ? "✓"
                  : "•"}
              </div>

              <div className="timeline-content">

                <div className="timeline-top">

                  <h3>
                    {event.title}
                  </h3>

                  <time>
                    {formatDateTime(
                      event.date,
                    )}
                  </time>

                </div>

                <p>
                  {event.description}
                </p>

              </div>

            </div>
          ),
        )}

      </div>

    </section>
  );
}

/* =========================================================
   PIPELINE
========================================================= */

function ApplicationPipeline({
  status,
}: {
  status: string;
}) {
  const steps = [
    {
      key: "application",
      label: "Application",
    },
    {
      key: "screening",
      label: "Screening",
    },
    {
      key: "interview",
      label: "Interview",
    },
    {
      key: "hiring_decision",
      label: "Hiring Decision",
    },
    {
      key: "ready_for_hire",
      label: "Ready for Hire",
    },
    {
      key: "hired",
      label: "Hired",
    },
  ];

  const statusOrder: Record<
    string,
    number
  > = {
    pending: 0,
    approved: 1,
    shortlisted: 2,
    interview: 3,
    hiring_decision: 4,
    ready_for_hire: 5,
    hired: 6,
    on_hold: 2,
    rejected: 2,
  };

  const currentOrder =
    statusOrder[status] ?? 0;

  return (
    <section className="pipeline-card">

      <div className="pipeline-header">

        <div>
          <span className="section-eyebrow">
            RECRUITMENT PIPELINE
          </span>

          <h2>
            Candidate Progress
          </h2>
        </div>

        <span className="pipeline-status">
          {formatApplicationStatus(
            status,
          )}
        </span>

      </div>

      <div className="pipeline">

        {steps.map(
          (step, index) => {
            const stepOrder =
              index;

            const completed =
              currentOrder >
              stepOrder;

            const active =
              currentOrder ===
              stepOrder;

            return (
              <div
                className={`pipeline-step ${
                  completed
                    ? "completed"
                    : ""
                } ${
                  active
                    ? "active"
                    : ""
                }`}
                key={step.key}
              >

                <div className="pipeline-node">
                  {completed
                    ? "✓"
                    : active
                      ? "•"
                      : index + 1}
                </div>

                <span>
                  {step.label}
                </span>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`pipeline-line ${
                      completed
                        ? "completed"
                        : ""
                    }`}
                  />
                )}

              </div>
            );
          },
        )}

      </div>

      

    </section>
  );
}

/* =========================================================
   RESUME CARD
========================================================= */

function ResumeCard({
  application,
}: {
  application: Application;
}) {
  return (
    <section className="content-card resume-card">

      <CardHeader
        eyebrow="RESUME"
        title="Candidate CV"
      />

      <div className="resume-file">

        <div className="resume-file-icon">
          PDF
        </div>

        <div>
          <strong>
            {application.resumeName ||
              "Candidate Resume"}
          </strong>

          <span>
            Candidate uploaded resume
          </span>
        </div>

      </div>

      {application.resumeUrl && (
        <a
          href={application.resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary full-width"
        >
          View / Download CV
        </a>
      )}

    </section>
  );
}

/* =========================================================
   RESUME PREVIEW
========================================================= */

function ResumePreviewCard({
  application,
}: {
  application: Application;
}) {
  if (!application.resumeUrl) {
    return null;
  }

  return (
    <section className="content-card resume-preview-card">

      <CardHeader
        eyebrow="DOCUMENT"
        title="Resume Preview"
      />

      <div className="resume-preview">

        <iframe
          src={application.resumeUrl}
          title="Candidate Resume"
        />

      </div>

    </section>
  );
}

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function CardHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="card-header">

      <div>
        {eyebrow && (
          <span className="section-eyebrow">
            {eyebrow}
          </span>
        )}

        <h2>
          {title}
        </h2>
      </div>

      {right && (
        <div>
          {right}
        </div>
      )}

    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="info-row">

      <span className="info-label">
        {label}
      </span>

      <strong className="info-value">
        {value}
      </strong>

    </div>
  );
}

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="detail-block">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`application-tab ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`status-badge status-${status}`}
    >
      <span className="status-dot" />

      {formatApplicationStatus(
        status,
      )}
    </span>
  );
}

function InterviewStatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`interview-status interview-${status}`}
    >
      {formatInterviewStatus(
        status,
      )}
    </span>
  );
}

function DecisionBadge({
  decision,
}: {
  decision: HiringDecision;
}) {
  return (
    <span
      className={`decision-badge decision-badge-${decision}`}
    >
      {formatHiringDecision(
        decision,
      )}
    </span>
  );
}

/* =========================================================
   INTERVIEWER HELPERS
========================================================= */

function getInterviewerDisplayName(
  interview: Interview,
) {
  if (
    interview.interviewerFirstName ||
    interview.interviewerLastName
  ) {
    return [
      interview.interviewerFirstName,
      interview.interviewerLastName,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (interview.interviewerId) {
    return `User #${interview.interviewerId}`;
  }

  return "Not assigned";
}

function formatRoleName(
  role: string,
) {
  const normalized =
    role
      .toLowerCase()
      .trim()
      .replace(/_/g, " ");

  return normalized.replace(
    /\b\w/g,
    (character) =>
      character.toUpperCase(),
  );
}

/* =========================================================
   GENERAL HELPERS
========================================================= */

function getInitials(
  name: string,
) {
  const parts =
    name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function normalizeStatus(
  status: string,
) {
  return status
    .toLowerCase()
    .trim()
    .replace(/-/g, "_");
}

function formatApplicationStatus(
  status: string,
) {
  const labels: Record<
    string,
    string
  > = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    shortlisted: "Shortlisted",
    on_hold: "On Hold",
    interview: "Interview",
    hiring_decision:
      "Hiring Decision",
    ready_for_hire:
      "Ready for Hire",
    hired: "Hired",
  };

  return (
    labels[
      normalizeStatus(status)
    ] || status
  );
}

function formatInterviewStatus(
  status: string,
) {
  const labels: Record<
    string,
    string
  > = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No-show",
  };

  return (
    labels[status] ||
    status
  );
}

function formatInterviewType(
  type: string,
) {
  const labels: Record<
    string,
    string
  > = {
    online: "Online",
    onsite: "On-site",
    phone: "Phone",
  };

  return (
    labels[type] ||
    type
  );
}

function formatHiringDecision(
  decision: HiringDecision,
) {
  const labels: Record<
    HiringDecision,
    string
  > = {
    approve: "Approved",
    hold: "On Hold",
    reject: "Rejected",
  };

  return labels[decision];
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function formatDateTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

