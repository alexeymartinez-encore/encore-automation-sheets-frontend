import {
  faCalendarDays,
  faClipboardUser,
  faFileInvoiceDollar,
  faHome,
  faSheetPlastic,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

export const NAV_LINKS = [
  {
    id: "dashboard",
    label: "Home",
    path: "/employee-portal/dashboard",
    icon: faHome,
    section: "Workspace",
  },
  {
    id: "timesheets",
    label: "Timesheets",
    path: "/employee-portal/dashboard/timesheets",
    icon: faSheetPlastic,
    section: "Workspace",
  },
  {
    id: "expenses",
    label: "Expenses",
    path: "/employee-portal/dashboard/expenses",
    icon: faFileInvoiceDollar,
    section: "Workspace",
  },
  {
    id: "events",
    label: "Events",
    path: "/employee-portal/dashboard/events",
    icon: faCalendarDays,
    section: "Workspace",
  },
  {
    id: "manager",
    label: "Manager",
    path: "/employee-portal/dashboard/manager",
    icon: faClipboardUser,
    section: "Leadership",
    roles: ["2"],
  },
  {
    id: "admin",
    label: "Admin",
    path: "/employee-portal/dashboard/admin",
    icon: faUserTie,
    section: "Leadership",
    roles: ["3"],
  },
];

export function getNavLinks(roleId) {
  if (!roleId) return NAV_LINKS.filter((link) => !link.roles);
  const normalizedRole = String(roleId);
  return NAV_LINKS.filter(
    (link) => !link.roles || link.roles.includes(normalizedRole)
  );
}
