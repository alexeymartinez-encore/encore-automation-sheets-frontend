import { NavLink } from "react-router-dom";
import AdminNavLink from "./AdminNavLink";

export default function AdminNavBar() {
  return (
    <div className=" flex gap-5 mt-5 py-2 bg-white shadow-sm rounded-md">
      <AdminNavLink to="/employee-portal/dashboard/admin" end>
        Sheets
      </AdminNavLink>
      <AdminNavLink to="/employee-portal/dashboard/admin/register-user">
        Register
      </AdminNavLink>
      <AdminNavLink to="/employee-portal/dashboard/admin/user-management">
        Users
      </AdminNavLink>
      <AdminNavLink to="/employee-portal/dashboard/admin/project-management">
        Projects
      </AdminNavLink>
      <AdminNavLink to="/employee-portal/dashboard/admin/reports">
        Reports
      </AdminNavLink>
      {/* <AdminNavLink to="/employee-portal/dashboard/admin/other">
        Project Management
      </AdminNavLink> */}
    </div>
  );
}
