import SideNavigation from "../components/PortalComponents/SideNavigation/SideNavigation";
import WelcomeHeader from "../components/PortalComponents/PortalHome/WelcomeHeader";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { useEffect, useState } from "react";
import MobileNavigation from "../components/PortalComponents/SideNavigation/MobileNavigation";
import SessionTimeoutWarning from "../components/Authentication/SessionTimeoutWarning";

const SIDENAV_STORAGE_KEY = "encore_sidebar_expanded";

export default function DashboardRootLayout() {
  const location = useLocation();
  const [isNavExpanded, setIsNavExpanded] = useState(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem(SIDENAV_STORAGE_KEY)
        : null;
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDENAV_STORAGE_KEY, String(isNavExpanded));
  }, [isNavExpanded]);

  const noHeaderRoutes = [
    "/employee-portal/dashboard/timesheets/create-timesheet",
    "/employee-portal/dashboard/expenses/create-expense",
    "/employee-portal/dashboard/expenses",
    "/employee-portal/dashboard/timesheets",
    "/employee-portal/dashboard/events",
    "/employee-portal/dashboard/admin",
    "/employee-portal/dashboard/admin/register-user",
    "/employee-portal/dashboard/admin/project-management",
    "/employee-portal/dashboard/admin/user-management",
    "/employee-portal/dashboard/manager",
    "/employee-portal/dashboard/admin/reports",
    "/employee-portal/dashboard/admin/event-configuration",
    "/employee-portal/dashboard/admin/event-types",
    "/employee-portal/dashboard/admin/event-reports",
  ];

  const isHeaderHidden =
    noHeaderRoutes.includes(location.pathname) ||
    matchPath(
      "/employee-portal/dashboard/timesheets/details/:timesheetId",
      location.pathname
    ) ||
    matchPath(
      "/employee-portal/dashboard/expenses/details/:expenseId",
      location.pathname
    ) ||
    matchPath(
      "/employee-portal/dashboard/expenses/:expenseId",
      location.pathname
    );

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-gray-100 relative">
      <SessionTimeoutWarning />
      {/* Sidebar */}
      <SideNavigation
        isExpanded={isNavExpanded}
        setIsExpanded={setIsNavExpanded}
      />
      <MobileNavigation />

      {/* Optional dark overlay ONLY on small screens when nav is expanded */}
      {/* {isNavExpanded && (
        <div
          className="hidden fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsNavExpanded(false)}
        />
      )} */}

      {/* Main content area */}
      <main className="flex-1 overflow-auto z-10 px-4 py-2 ml-0 md:ml-0">
        {!isHeaderHidden && (
          <div className="mt-5">
            <WelcomeHeader />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
