import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  createEmployer,
  deleteEmployer,
  getAllEmployers,
  updateEmployer,
} from "@/services/employer.service";

import type {
  CreateEmployerInput,
  Employer,
} from "@/services/employer.service";

import "@/styles/admin-employers.css";

export const Route = createFileRoute("/admin/employers/")({
  component: EmployersPage,
});

function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [showModal, setShowModal] = useState(false);
  const [editingEmployer, setEditingEmployer] =
    useState<Employer | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [form, setForm] = useState<CreateEmployerInput>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    logoUrl: "",
    isActive: true,
  });

  async function loadEmployers() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllEmployers();

      setEmployers(response.data);
    } catch (error) {
      console.error("Failed to load employers:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load employers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployers();
  }, []);

  const filteredEmployers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return employers.filter((employer) => {
      const matchesSearch =
        search === "" ||
        employer.name.toLowerCase().includes(search) ||
        employer.email.toLowerCase().includes(search) ||
        (employer.phone ?? "")
          .toLowerCase()
          .includes(search) ||
        (employer.address ?? "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          employer.isActive) ||
        (statusFilter === "inactive" &&
          !employer.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [employers, searchTerm, statusFilter]);

  const activeCount = employers.filter(
    (employer) => employer.isActive,
  ).length;

  const inactiveCount = employers.filter(
    (employer) => !employer.isActive,
  ).length;

  function openCreateModal() {
    setEditingEmployer(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      description: "",
      logoUrl: "",
      isActive: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(employer: Employer) {
    setEditingEmployer(employer);

    setForm({
      name: employer.name,
      email: employer.email,
      phone: employer.phone ?? "",
      address: employer.address ?? "",
      description: employer.description ?? "",
      logoUrl: employer.logoUrl ?? "",
      isActive: employer.isActive,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingEmployer(null);
  }

  function handleInputChange(
    field: keyof CreateEmployerInput,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Please enter employer name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter employer email.");
      return;
    }

    try {
      setSaving(true);

      if (editingEmployer) {
        const response = await updateEmployer(
          editingEmployer.id,
          form,
        );

        setEmployers((current) =>
          current.map((employer) =>
            employer.id === editingEmployer.id
              ? response.data
              : employer,
          ),
        );

        setSuccess("Employer updated successfully.");
      } else {
        const response = await createEmployer(form);

        setEmployers((current) => [
          response.data,
          ...current,
        ]);

        setSuccess("Employer created successfully.");
      }

      setShowModal(false);
      setEditingEmployer(null);
    } catch (error) {
      console.error("Failed to save employer:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save employer.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(employer: Employer) {
    try {
      setError("");
      setSuccess("");

      const response = await updateEmployer(employer.id, {
        isActive: !employer.isActive,
      });

      setEmployers((current) =>
        current.map((item) =>
          item.id === employer.id
            ? response.data
            : item,
        ),
      );

      setSuccess(
        response.data.isActive
          ? "Employer activated successfully."
          : "Employer deactivated successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to update employer status:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update employer status.",
      );
    }
  }

  async function handleDelete(employer: Employer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${employer.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(employer.id);
      setError("");
      setSuccess("");

      await deleteEmployer(employer.id);

      setEmployers((current) =>
        current.filter(
          (item) => item.id !== employer.id,
        ),
      );

      setSuccess("Employer deleted successfully.");
    } catch (error) {
      console.error("Failed to delete employer:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete employer.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="admin-employers-page">
        <div className="employers-loading">
          <div className="employers-spinner" />
          <p>Loading employers...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-employers-page">
      <div className="admin-employers-container">
        {/* Header */}
        <header className="employers-header">
          <div>
            <p className="employers-eyebrow">
              ADMIN MANAGEMENT
            </p>

            <h1>Employers</h1>

            <p className="employers-subtitle">
              Manage organizations and employer accounts.
            </p>
          </div>

          <button
            type="button"
            className="employer-add-button"
            onClick={openCreateModal}
          >
            <span>+</span>
            Add Employer
          </button>
        </header>

        {/* Alerts */}
        {error && (
          <div
            className="employer-alert employer-alert-error"
            role="alert"
          >
            <span>!</span>
            {error}
          </div>
        )}

        {success && (
          <div
            className="employer-alert employer-alert-success"
            role="status"
          >
            <span>✓</span>
            {success}
          </div>
        )}

        {/* Statistics */}
        <section className="employer-stats">
          <article className="employer-stat-card">
            <div className="employer-stat-icon total">
              ◈
            </div>

            <div>
              <span>Total Employers</span>
              <strong>{employers.length}</strong>
            </div>
          </article>

          <article className="employer-stat-card">
            <div className="employer-stat-icon active">
              ✓
            </div>

            <div>
              <span>Active</span>
              <strong>{activeCount}</strong>
            </div>
          </article>

          <article className="employer-stat-card">
            <div className="employer-stat-icon inactive">
              ○
            </div>

            <div>
              <span>Inactive</span>
              <strong>{inactiveCount}</strong>
            </div>
          </article>
        </section>

        {/* Toolbar */}
        <section className="employers-toolbar">
          <div className="employer-search">
            <span className="employer-search-icon">
              ⌕
            </span>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search employers..."
              aria-label="Search employers"
            />

            {searchTerm && (
              <button
                type="button"
                className="employer-clear-search"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          <select
            className="employer-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | "active"
                  | "inactive",
              )
            }
          >
            <option value="all">All Employers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            type="button"
            className="employer-refresh-button"
            onClick={loadEmployers}
          >
            ↻ Refresh
          </button>
        </section>

        <div className="employer-results-info">
          Showing{" "}
          <strong>
            {filteredEmployers.length}
          </strong>{" "}
          of{" "}
          <strong>{employers.length}</strong>{" "}
          employers
        </div>

        {/* Table */}
        {employers.length === 0 ? (
          <section className="employers-empty">
            <div className="employers-empty-icon">
              ◈
            </div>

            <h2>No employers yet</h2>

            <p>
              Add your first employer to start managing
              organizations.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
            >
              + Add Employer
            </button>
          </section>
        ) : filteredEmployers.length === 0 ? (
          <section className="employers-empty">
            <div className="employers-empty-icon">
              ⌕
            </div>

            <h2>No matching employers</h2>

            <p>
              Try changing your search or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </button>
          </section>
        ) : (
          <section className="employers-table-card">
            <div className="employers-table-wrapper">
              <table className="employers-table">
                <thead>
                  <tr>
                    <th>Employer</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployers.map(
                    (employer) => (
                      <tr key={employer.id}>
                        <td>
                          <div className="employer-identity">
                            <div className="employer-avatar">
                              {employer.logoUrl ? (
                                <img
                                  src={employer.logoUrl}
                                  alt=""
                                />
                              ) : (
                                employer.name
                                  .charAt(0)
                                  .toUpperCase()
                              )}
                            </div>

                            <div>
                              <strong>
                                {employer.name}
                              </strong>

                              <span>
                                Employer #{employer.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="employer-contact">
                            <span>
                              {employer.email}
                            </span>

                            {employer.phone && (
                              <span>
                                {employer.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          {employer.address ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`employer-status ${
                              employer.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <span />
                            {employer.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            employer.createdAt,
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          <div className="employer-actions">
                            <button
                              type="button"
                              className="employer-action-edit"
                              onClick={() =>
                                openEditModal(
                                  employer,
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="employer-action-status"
                              onClick={() =>
                                handleToggleStatus(
                                  employer,
                                )
                              }
                            >
                              {employer.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              className="employer-action-delete"
                              disabled={
                                deletingId ===
                                employer.id
                              }
                              onClick={() =>
                                handleDelete(
                                  employer,
                                )
                              }
                            >
                              {deletingId ===
                              employer.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="employer-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="employer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employer-modal-title"
          >
            <div className="employer-modal-header">
              <div>
                <p>EMPLOYER MANAGEMENT</p>

                <h2 id="employer-modal-title">
                  {editingEmployer
                    ? "Edit Employer"
                    : "Add Employer"}
                </h2>
              </div>

              <button
                type="button"
                className="employer-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className="employer-form"
              onSubmit={handleSubmit}
            >
              <div className="employer-form-grid">
                <label>
                  <span>
                    Employer Name{" "}
                    <b>*</b>
                  </span>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleInputChange(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Enter employer name"
                    required
                  />
                </label>

                <label>
                  <span>
                    Email{" "}
                    <b>*</b>
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleInputChange(
                        "email",
                        event.target.value,
                      )
                    }
                    placeholder="employer@example.com"
                    required
                  />
                </label>

                <label>
                  <span>Phone</span>

                  <input
                    type="tel"
                    value={form.phone ?? ""}
                    onChange={(event) =>
                      handleInputChange(
                        "phone",
                        event.target.value,
                      )
                    }
                    placeholder="+251 ..."
                  />
                </label>

                <label>
                  <span>Address</span>

                  <input
                    type="text"
                    value={form.address ?? ""}
                    onChange={(event) =>
                      handleInputChange(
                        "address",
                        event.target.value,
                      )
                    }
                    placeholder="Addis Ababa"
                  />
                </label>

                <label className="employer-form-full">
                  <span>Logo URL</span>

                  <input
                    type="url"
                    value={form.logoUrl ?? ""}
                    onChange={(event) =>
                      handleInputChange(
                        "logoUrl",
                        event.target.value,
                      )
                    }
                    placeholder="https://..."
                  />
                </label>

                <label className="employer-form-full">
                  <span>Description</span>

                  <textarea
                    value={form.description ?? ""}
                    onChange={(event) =>
                      handleInputChange(
                        "description",
                        event.target.value,
                      )
                    }
                    placeholder="Describe the employer..."
                    rows={4}
                  />
                </label>

                <label className="employer-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      form.isActive ?? true
                    }
                    onChange={(event) =>
                      handleInputChange(
                        "isActive",
                        event.target.checked,
                      )
                    }
                  />

                  <span>
                    Employer is active
                  </span>
                </label>
              </div>

              <div className="employer-modal-actions">
                <button
                  type="button"
                  className="employer-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employer-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingEmployer
                      ? "Save Changes"
                      : "Create Employer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}