import { Link } from "@tanstack/react-router";
import "../styles/admin-sidebar.css";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">M</div>

        <div className="sidebar-brand-text">
          <h2>Muyalogy</h2>
          <span>Recruitment</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-navigation">
        <p className="sidebar-section-title">MAIN MENU</p>

        <nav className="sidebar-nav">
          {/* Dashboard */}
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            activeProps={{
              className: "sidebar-link sidebar-link-active",
            }}
            className="sidebar-link"
          >
            <span className="sidebar-icon">▦</span>
            <span className="sidebar-label">Dashboard</span>
          </Link>

          {/* Jobs */}
          <Link
            to="/admin/jobs"
            activeProps={{
              className: "sidebar-link sidebar-link-active",
            }}
            className="sidebar-link"
          >
            <span className="sidebar-icon">▤</span>
            <span className="sidebar-label">Jobs</span>
          </Link>

          {/* Candidates */}
          <Link
            to="/admin/candidates"
            activeProps={{
              className: "sidebar-link sidebar-link-active",
            }}
            className="sidebar-link"
          >
            <span className="sidebar-icon">♙</span>
            <span className="sidebar-label">Candidates</span>
          </Link>

          {/* Employers */}
          <Link
            to="/admin/employers"
            activeProps={{
              className: "sidebar-link sidebar-link-active",
            }}
            className="sidebar-link"
          >
            <span className="sidebar-icon">▣</span>
            <span className="sidebar-label">Employers</span>
          </Link>

          {/* Users */}
          <Link
            to="/admin/users"
            activeProps={{
              className: "sidebar-link sidebar-link-active",
            }}
            className="sidebar-link"
          >
            <span className="sidebar-icon">♟</span>
            <span className="sidebar-label">Users</span>
          </Link>
        </nav>
      </div>

      {/* Account */}
      <div className="sidebar-account">
        <div className="sidebar-account-avatar">A</div>

        <div className="sidebar-account-info">
          <strong>Administrator</strong>
          
        </div>
      </div>
    </aside>
  );
}