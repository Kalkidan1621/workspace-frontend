import { createFileRoute } from "@tanstack/react-router";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createJob,
} from "@/services/jobs.service";

import {
  getAllEmployers,
} from "@/services/employer.service";

import type {
  Employer,
} from "@/services/employer.service";

import "@/styles/admin-jobs.css";

export const Route = createFileRoute(
  "/admin/jobs/create",
)({
  component: CreateJobPage,
});

type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship";

type Priority =
  | "low"
  | "medium"
  | "high";

function CreateJobPage() {
  const [title, setTitle] =
    useState("");

  const [employer, setEmployer] =
    useState("");

  const [employers, setEmployers] =
    useState<Employer[]>([]);

  const [employersLoading, setEmployersLoading] =
    useState(true);

  const [employersError, setEmployersError] =
    useState("");

  const [
    department,
    setDepartment,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    experience,
    setExperience,
  ] = useState("");

  const [
    educationalQualification,
    setEducationalQualification,
  ] = useState("");

  const [
    workingTime,
    setWorkingTime,
  ] = useState("");

  const [
    openingDate,
    setOpeningDate,
  ] = useState("");

  const [
    closingDate,
    setClosingDate,
  ] = useState("");

  const [
    salary,
    setSalary,
  ] = useState("");

  const [
    employmentType,
    setEmploymentType,
  ] = useState<EmploymentType>(
    "full-time",
  );

  const [
    priority,
    setPriority,
  ] = useState<Priority>(
    "medium",
  );

  // Validation errors
  const [
    titleError,
    setTitleError,
  ] = useState("");

  const [
    employerError,
    setEmployerError,
  ] = useState("");

  const [
    departmentError,
    setDepartmentError,
  ] = useState("");

  const [
    descriptionError,
    setDescriptionError,
  ] = useState("");

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const [
    experienceError,
    setExperienceError,
  ] = useState("");

  const [
    educationalQualificationError,
    setEducationalQualificationError,
  ] = useState("");

  const [
    workingTimeError,
    setWorkingTimeError,
  ] = useState("");

  const [
    openingDateError,
    setOpeningDateError,
  ] = useState("");

  const [
    closingDateError,
    setClosingDateError,
  ] = useState("");

  const [
    salaryError,
    setSalaryError,
  ] = useState("");

  // Submit states
  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  /*
   * Load employers from database
   */
  useEffect(() => {
    async function loadEmployers() {
      try {
        setEmployersLoading(true);
        setEmployersError("");

        const response =
          await getAllEmployers();

        const activeEmployers =
          response.data.filter(
            (item) => item.isActive,
          );

        setEmployers(
          activeEmployers,
        );
      } catch (error) {
        console.error(
          "Failed to load employers:",
          error,
        );

        setEmployersError(
          error instanceof Error
            ? error.message
            : "Failed to load employers.",
        );
      } finally {
        setEmployersLoading(false);
      }
    }

    loadEmployers();
  }, []);

  function validateTitle(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setTitleError("");
    } else if (
      value.trim().length < 3
    ) {
      setTitleError(
        "Job title must be at least 3 characters.",
      );
    } else {
      setTitleError("");
    }
  }

  function validateEmployer(
    value: string,
  ) {
    if (!value) {
      setEmployerError("");
      return;
    }

    setEmployerError("");
  }

  function validateDepartment(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setDepartmentError("");
    } else if (
      value.trim().length < 2
    ) {
      setDepartmentError(
        "Department must be at least 2 characters.",
      );
    } else {
      setDepartmentError("");
    }
  }

  function validateDescription(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setDescriptionError("");
    } else if (
      value.trim().length < 20
    ) {
      setDescriptionError(
        "Job description must be at least 20 characters.",
      );
    } else {
      setDescriptionError("");
    }
  }

  function validateLocation(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setLocationError("");
    } else if (
      value.trim().length < 2
    ) {
      setLocationError(
        "Location must be at least 2 characters.",
      );
    } else {
      setLocationError("");
    }
  }

  function validateExperience(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setExperienceError("");
    } else {
      setExperienceError("");
    }
  }

  function validateEducationalQualification(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setEducationalQualificationError("");
    } else if (
      value.trim().length < 2
    ) {
      setEducationalQualificationError(
        "Educational qualification must be at least 2 characters.",
      );
    } else {
      setEducationalQualificationError("");
    }
  }

  function validateWorkingTime(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setWorkingTimeError("");
    } else if (
      value.trim().length < 2
    ) {
      setWorkingTimeError(
        "Working time must be at least 2 characters.",
      );
    } else {
      setWorkingTimeError("");
    }
  }

  function validateOpeningDate(
    value: string,
  ) {
    if (value.length === 0) {
      setOpeningDateError("");
    } else {
      setOpeningDateError("");
    }
  }

  function validateClosingDate(
    value: string,
  ) {
    if (value.length === 0) {
      setClosingDateError("");
    } else {
      setClosingDateError("");
    }
  }

  function validateSalary(
    value: string,
  ) {
    if (
      value.trim().length === 0
    ) {
      setSalaryError("");
    } else {
      setSalaryError("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSuccess("");
    setSubmitError("");

    let hasError = false;

    if (
      title.trim().length < 3
    ) {
      setTitleError(
        "Job title must be at least 3 characters.",
      );

      hasError = true;
    }

    if (!employer) {
      setEmployerError(
        "Please select an employer.",
      );

      hasError = true;
    }

    if (
      department.trim().length < 2
    ) {
      setDepartmentError(
        "Department must be at least 2 characters.",
      );

      hasError = true;
    }

    if (
      description.trim().length < 20
    ) {
      setDescriptionError(
        "Job description must be at least 20 characters.",
      );

      hasError = true;
    }

    if (
      location.trim().length < 2
    ) {
      setLocationError(
        "Location must be at least 2 characters.",
      );

      hasError = true;
    }

    if (
      experience.trim().length === 0
    ) {
      setExperienceError(
        "Experience is required.",
      );

      hasError = true;
    }

    if (
      educationalQualification
        .trim()
        .length < 2
    ) {
      setEducationalQualificationError(
        "Educational qualification is required.",
      );

      hasError = true;
    }

    if (
      workingTime.trim().length < 2
    ) {
      setWorkingTimeError(
        "Working time is required.",
      );

      hasError = true;
    }

    if (
      openingDate.length === 0
    ) {
      setOpeningDateError(
        "Opening date is required.",
      );

      hasError = true;
    }

    if (
      closingDate.length === 0
    ) {
      setClosingDateError(
        "Closing date is required.",
      );

      hasError = true;
    }

    if (
      openingDate &&
      closingDate &&
      closingDate < openingDate
    ) {
      setClosingDateError(
        "Closing date cannot be before opening date.",
      );

      hasError = true;
    }

    if (
      salary.trim().length === 0
    ) {
      setSalaryError(
        "Salary is required.",
      );

      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);

      await createJob({
        title: title.trim(),

        employer: employer.trim(),

        department:
          department.trim(),

        description:
          description.trim(),

        location:
          location.trim(),

        experience:
          experience.trim(),

        educationalQualification:
          educationalQualification.trim(),

        workingTime:
          workingTime.trim(),

        openingDate,

        closingDate,

        salary:
          salary.trim(),

        employmentType,

        priority,

        status: "active",
      });

      setSuccess(
        "Job created successfully!",
      );

      // Clear the form
      setTitle("");
      setEmployer("");
      setDepartment("");
      setDescription("");
      setLocation("");
      setExperience("");
      setEducationalQualification("");
      setWorkingTime("");
      setOpeningDate("");
      setClosingDate("");
      setSalary("");

      setEmploymentType(
        "full-time",
      );

      setPriority(
        "medium",
      );
    } catch (error) {
      console.error(
        "Failed to create job:",
        error,
      );

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create job.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-jobs-page">
      <div className="admin-jobs-container">
        <section className="admin-jobs-form-card">
          <header className="admin-jobs-header">
            <p className="admin-jobs-eyebrow">
              ADMIN DASHBOARD
            </p>

            <h1>
              Create New Job
            </h1>

            <p>
              Add a new job opening for
              candidates to view and apply.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="admin-jobs-field">
              <label htmlFor="title">
                Job Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setTitle(value);

                  validateTitle(value);
                }}
                placeholder="Example: Frontend Developer"
                aria-invalid={Boolean(
                  titleError,
                )}
              />

              {titleError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {titleError}
                </p>
              )}
            </div>

            {/* Employer from database */}
            <div className="admin-job-field">
              <label htmlFor="employer">
                Employer
              </label>

              <select
                id="employer"
                value={employer}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setEmployer(value);

                  validateEmployer(value);
                }}
                disabled={employersLoading}
                aria-invalid={Boolean(
                  employerError,
                )}
              >
                <option value="">
                  {employersLoading
                    ? "Loading employers..."
                    : "Select employer"}
                </option>

                {employers.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>

              {employersError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {employersError}
                </p>
              )}

              {!employersLoading &&
                !employersError &&
                employers.length === 0 && (
                  <p
                    className="admin-field-error"
                    role="alert"
                  >
                    No active employers
                    found. Please create
                    an employer first.
                  </p>
                )}

              {employerError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {employerError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="department">
                Department
              </label>

              <input
                id="department"
                type="text"
                value={department}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setDepartment(value);

                  validateDepartment(
                    value,
                  );
                }}
                placeholder="Example: Engineering"
                aria-invalid={Boolean(
                  departmentError,
                )}
              />

              {departmentError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {departmentError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="location">
                Job Location
              </label>

              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setLocation(value);

                  validateLocation(
                    value,
                  );
                }}
                placeholder="Example: Addis Ababa"
                aria-invalid={Boolean(
                  locationError,
                )}
              />

              {locationError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {locationError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="experience">
                Experience
              </label>

              <input
                id="experience"
                type="text"
                value={experience}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setExperience(value);

                  validateExperience(
                    value,
                  );
                }}
                placeholder="Example: 2 years"
                aria-invalid={Boolean(
                  experienceError,
                )}
              />

              {experienceError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {experienceError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="educationalQualification">
                Educational Qualification
              </label>

              <input
                id="educationalQualification"
                type="text"
                value={
                  educationalQualification
                }
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setEducationalQualification(
                    value,
                  );

                  validateEducationalQualification(
                    value,
                  );
                }}
                placeholder="Example: Bachelor's Degree"
                aria-invalid={Boolean(
                  educationalQualificationError,
                )}
              />

              {educationalQualificationError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {
                    educationalQualificationError
                  }
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="employmentType">
                Job Type
              </label>

              <select
                id="employmentType"
                value={employmentType}
                onChange={(event) =>
                  setEmploymentType(
                    event.target
                      .value as EmploymentType,
                  )
                }
              >
                <option value="full-time">
                  Full Time
                </option>

                <option value="part-time">
                  Part Time
                </option>

                <option value="contract">
                  Contract
                </option>

                <option value="internship">
                  Internship
                </option>
              </select>
            </div>

            <div className="admin-job-field">
              <label htmlFor="workingTime">
                Working Time
              </label>

              <input
                id="workingTime"
                type="text"
                value={workingTime}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setWorkingTime(value);

                  validateWorkingTime(
                    value,
                  );
                }}
                placeholder="Example: Monday to Friday, 8:00 AM - 5:00 PM"
                aria-invalid={Boolean(
                  workingTimeError,
                )}
              />

              {workingTimeError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {workingTimeError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="openingDate">
                Opening Date
              </label>

              <input
                id="openingDate"
                type="date"
                value={openingDate}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setOpeningDate(value);

                  validateOpeningDate(
                    value,
                  );
                }}
                aria-invalid={Boolean(
                  openingDateError,
                )}
              />

              {openingDateError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {openingDateError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="closingDate">
                Closing Date
              </label>

              <input
                id="closingDate"
                type="date"
                value={closingDate}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setClosingDate(value);

                  validateClosingDate(
                    value,
                  );
                }}
                aria-invalid={Boolean(
                  closingDateError,
                )}
              />

              {closingDateError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {closingDateError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="salary">
                Salary
              </label>

              <input
                id="salary"
                type="text"
                value={salary}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setSalary(value);

                  validateSalary(value);
                }}
                placeholder="Example: 20,000 ETB"
                aria-invalid={Boolean(
                  salaryError,
                )}
              />

              {salaryError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {salaryError}
                </p>
              )}
            </div>

            <div className="admin-job-field">
              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as Priority,
                  )
                }
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </div>

            <div className="admin-job-field">
              <label htmlFor="description">
                Job Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setDescription(value);

                  validateDescription(
                    value,
                  );
                }}
                placeholder="Describe the responsibilities, requirements, and other job information..."
                rows={7}
                aria-invalid={Boolean(
                  descriptionError,
                )}
              />

              {descriptionError && (
                <p
                  className="admin-field-error"
                  role="alert"
                >
                  {descriptionError}
                </p>
              )}
            </div>

            {success && (
              <p
                className="admin-job-success"
                role="status"
              >
                {success}
              </p>
            )}

            {submitError && (
              <p
                className="admin-job-error"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="create-job-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating Job..."
                : "Create Job"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}