import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createUser,
  deleteUser,
  getRoles,
  getUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "@/services/users.service";

import type {
  CreateUserPayload,
  Role,
  User,
} from "@/types/users";

import "@/styles/admin-users.css";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [roleFilter, setRoleFilter] =
    useState<number | "all">("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [deletingUser, setDeletingUser] =
    useState<User | null>(null);

  const [form, setForm] = useState<CreateUserPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleId: 0,
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await getUsers();

      setUsers(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    try {
      const response = await getRoles();

      setRoles(response.data);
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.firstName} ${user.lastName}`.toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        user.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        (user.roleName ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      const matchesRole =
        roleFilter === "all" ||
        user.roleId === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    users,
    search,
    statusFilter,
    roleFilter,
  ]);

  function openCreateModal() {
    setEditingUser(null);

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleId: roles[0]?.id ?? 0,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);

    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      roleId: user.roleId,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.roleId) {
        throw new Error("Please select a role.");
      }

      if (editingUser) {
        await updateUser(editingUser.id, {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          roleId: form.roleId,
        });

        setSuccess(
          "User updated successfully.",
        );
      } else {
        await createUser(form);

        setSuccess(
          "User created successfully.",
        );
      }

      await loadUsers();

      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save user.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(user: User) {
    try {
      setError("");
      setSuccess("");

      await updateUserStatus(
        user.id,
        !user.isActive,
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item,
        ),
      );

      setSuccess(
        user.isActive
          ? "User deactivated successfully."
          : "User activated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user status.",
      );
    }
  }

  async function handleRoleChange(
    user: User,
    roleId: number,
  ) {
    try {
      setError("");
      setSuccess("");

      await updateUserRole(
        user.id,
        roleId,
      );

      const selectedRole = roles.find(
        (role) => role.id === roleId,
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? {
                ...item,
                roleId,
                roleName:
                  selectedRole?.name ??
                  item.roleName,
              }
            : item,
        ),
      );

      setSuccess(
        "User role updated successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user role.",
      );
    }
  }

  async function handleDelete() {
    if (!deletingUser) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await deleteUser(
        deletingUser.id,
      );

      setUsers((current) =>
        current.filter(
          (user) =>
            user.id !== deletingUser.id,
        ),
      );

      setSuccess(
        "User deleted successfully.",
      );

      setDeletingUser(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user.",
      );
    } finally {
      setSaving(false);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    ).format(new Date(date));
  }

  const activeCount = users.filter(
    (user) => user.isActive,
  ).length;

  const inactiveCount = users.filter(
    (user) => !user.isActive,
  ).length;

  if (loading) {
    return (
      <main className="admin-users-page">
        <div className="admin-users-loading">
          <div className="admin-users-spinner" />
          <p>Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">

        {/* HEADER */}
        <header className="admin-users-header">
          <div>
            <p className="admin-users-eyebrow">
              ADMINISTRATION
            </p>

            <h1>User Management</h1>

            <p>
              Manage system users, roles, and
              account access.
            </p>
          </div>

          <button
            type="button"
            className="admin-users-primary-button"
            onClick={openCreateModal}
          >
            <span>+</span>
            Add User
          </button>
        </header>

        {/* STATS */}
        <section className="admin-users-stats">
          <article className="admin-users-stat-card">
            <div className="admin-users-stat-icon">
              U
            </div>

            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>
          </article>

          <article className="admin-users-stat-card">
            <div className="admin-users-stat-icon">
              A
            </div>

            <div>
              <span>Active</span>
              <strong>{activeCount}</strong>
            </div>
          </article>

          <article className="admin-users-stat-card">
            <div className="admin-users-stat-icon">
              I
            </div>

            <div>
              <span>Inactive</span>
              <strong>{inactiveCount}</strong>
            </div>
          </article>
        </section>

        {/* ALERTS */}
        {error && (
          <div
            className="admin-users-alert admin-users-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="admin-users-alert admin-users-alert-success"
            role="status"
          >
            {success}
          </div>
        )}

        {/* FILTERS */}
        <section className="admin-users-toolbar">
          <div className="admin-users-search">
            <span>⌕</span>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search users by name, email, or role..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value),
              )
            }
          >
            <option value="all">
              All Roles
            </option>

            {roles.map((role) => (
              <option
                key={role.id}
                value={role.id}
              >
                {role.name}
              </option>
            ))}
          </select>

          <select
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
            <option value="all">
              All Status
            </option>
            <option value="active">
              Active
            </option>
            <option value="inactive">
              Inactive
            </option>
          </select>

          <button
            type="button"
            className="admin-users-refresh-button"
            onClick={loadUsers}
          >
            Refresh
          </button>
        </section>

        {/* RESULTS */}
        <div className="admin-users-results">
          Showing{" "}
          <strong>
            {filteredUsers.length}
          </strong>{" "}
          of{" "}
          <strong>{users.length}</strong>{" "}
          users
        </div>

        {/* TABLE */}
        {filteredUsers.length === 0 ? (
          <section className="admin-users-empty">
            <div className="admin-users-empty-icon">
              U
            </div>

            <h2>
              {users.length === 0
                ? "No users yet"
                : "No matching users"}
            </h2>

            <p>
              {users.length === 0
                ? "Create your first system user to get started."
                : "Try changing your search or filters."}
            </p>

            {users.length === 0 ? (
              <button
                type="button"
                className="admin-users-primary-button"
                onClick={openCreateModal}
              >
                + Add User
              </button>
            ) : (
              <button
                type="button"
                className="admin-users-secondary-button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </section>
        ) : (
          <section className="admin-users-table-card">
            <div className="admin-users-table-scroll">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {user.firstName
                                .charAt(0)
                                .toUpperCase()}
                              {user.lastName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {user.firstName}{" "}
                                {user.lastName}
                              </strong>

                              <span>
                                User #{user.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-user-email">
                            {user.email}
                          </span>
                        </td>

                        <td>
                          <select
                            className="admin-user-role-select"
                            value={user.roleId}
                            onChange={(event) =>
                              handleRoleChange(
                                user,
                                Number(
                                  event.target.value,
                                ),
                              )
                            }
                          >
                            {roles.map(
                              (role) => (
                                <option
                                  key={role.id}
                                  value={role.id}
                                >
                                  {role.name}
                                </option>
                              ),
                            )}
                          </select>
                        </td>

                        <td>
                          <span
                            className={`admin-user-status ${
                              user.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <span />
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td>
                          <span className="admin-user-date">
                            {formatDate(
                              user.createdAt,
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="admin-user-actions">
                            <button
                              type="button"
                              className="admin-user-action edit"
                              onClick={() =>
                                openEditModal(
                                  user,
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className={`admin-user-action ${
                                user.isActive
                                  ? "deactivate"
                                  : "activate"
                              }`}
                              onClick={() =>
                                handleToggleStatus(
                                  user,
                                )
                              }
                            >
                              {user.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              className="admin-user-action delete"
                              onClick={() =>
                                setDeletingUser(
                                  user,
                                )
                              }
                            >
                              Delete
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div
          className="admin-users-modal-overlay"
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
            className="admin-users-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-users-modal-header">
              <div>
                <p>
                  {editingUser
                    ? "USER MANAGEMENT"
                    : "NEW USER"}
                </p>

                <h2>
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="admin-users-form"
            >
              <div className="admin-users-form-grid">
                <label>
                  First Name
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        firstName:
                          event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Last Name
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        lastName:
                          event.target.value,
                      })
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Email Address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email:
                        event.target.value,
                    })
                  }
                  required
                />
              </label>

              {!editingUser && (
                <label>
                  Temporary Password
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        password:
                          event.target.value,
                      })
                    }
                    minLength={8}
                    required
                  />

                  <small>
                    Minimum 8 characters.
                  </small>
                </label>
              )}

              <label>
                Role
                <select
                  value={form.roleId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      roleId:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  required
                >
                  <option value={0}>
                    Select role
                  </option>

                  {roles.map((role) => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="admin-users-form-actions">
                <button
                  type="button"
                  className="admin-users-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-users-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                      ? "Save Changes"
                      : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingUser && (
        <div className="admin-users-modal-overlay">
          <div className="admin-users-confirmation-modal">
            <div className="admin-users-danger-icon">
              !
            </div>

            <h2>
              Delete User?
            </h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deletingUser.firstName}{" "}
                {deletingUser.lastName}
              </strong>
              ?
            </p>

            <p className="warning">
              This action cannot be undone.
            </p>

            <div className="admin-users-confirmation-actions">
              <button
                type="button"
                className="admin-users-cancel-button"
                onClick={() =>
                  setDeletingUser(null)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-users-delete-button"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}