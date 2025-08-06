import SideNavigation from "../components/PortalComponents/SideNavigation/SideNavigation";
import WelcomeHeader from "../components/PortalComponents/PortalHome/WelcomeHeader";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { useState } from "react";

export default function DashboardRootLayout() {
  const location = useLocation();
  const [isNavExpanded, setIsNavExpanded] = useState(true); // shared state

  const noHeaderRoutes = [
    "/employee-portal/dashboard/timesheets/create-timesheet",
    "/employee-portal/dashboard/expenses/create-expense",
  ];

  const isHeaderHidden =
    noHeaderRoutes.includes(location.pathname) ||
    matchPath(
      "/employee-portal/dashboard/timesheets/:timesheetId",
      location.pathname
    ) ||
    matchPath(
      "/employee-portal/dashboard/expenses/:expenseId",
      location.pathname
    );

  return (
    <div className="flex h-screen w-screen bg-gray-100 relative">
      {/* Sidebar */}
      <SideNavigation
        isExpanded={isNavExpanded}
        setIsExpanded={setIsNavExpanded}
      />

      {/* Optional dark overlay ONLY on small screens when nav is expanded */}
      {isNavExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsNavExpanded(false)}
        />
      )}

      {/* Main content area */}
      <main className="flex-1 overflow-auto z-10 px-4 py-2 ml-10 md:ml-0">
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
