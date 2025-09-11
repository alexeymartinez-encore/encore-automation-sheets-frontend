import { Outlet, useLocation, matchPath } from "react-router-dom";
import Header from "../components/Header/Header";
import SuccessUI from "../components/UI/SuccessUI";
import { useContext } from "react";
import { TimesheetContext } from "../store/timesheet-context";
import { ExpensesContext } from "../store/expense-context";
import { AdminContext } from "../store/admin-context";
import { EventContext } from "../store/events-context";

export default function RootLayout() {
  const timesheetCtx = useContext(TimesheetContext);
  const expenseCtx = useContext(ExpensesContext);
  const adminCtx = useContext(AdminContext);
  const eventCtx = useContext(EventContext);

  const location = useLocation();

  const noHeaderRoutes = [
    "/employee-portal/dashboard",
    "/employee-portal/dashboard/timesheets",
    "/employee-portal/dashboard/events",
    "/employee-portal/dashboard/expenses",
    "/employee-portal/dashboard/admin",
    "/employee-portal/dashboard/admin/register-user",
    "/employee-portal/dashboard/admin/project-management",
    "/employee-portal/dashboard/admin/user-management",
    "/employee-portal/dashboard/timesheets/create-timesheet",
    "/employee-portal/dashboard/expenses/create-expense",
    "/employee-portal/dashboard/manager",
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

  // Here: find the first context that has a success or fail
  const activeMessage = timesheetCtx.successOrFailMessage.successStatus
    ? timesheetCtx.successOrFailMessage
    : expenseCtx.successOrFailMessage.successStatus
    ? expenseCtx.successOrFailMessage
    : adminCtx.successOrFailMessage.successStatus
    ? adminCtx.successOrFailMessage
    : eventCtx.successOrFailMessage.successStatus
    ? eventCtx.successOrFailMessage
    : null;

  return (
    <>
      {!isHeaderHidden && <Header />}

      {activeMessage && (
        <SuccessUI
          message={activeMessage.message}
          status={activeMessage.successStatus}
        />
      )}

      <main>
        <Outlet />
      </main>
    </>
  );
}
