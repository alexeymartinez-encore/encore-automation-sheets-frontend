import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  useParams,
  useSearchParams,
} from "react-router-dom";
import RootLayout from "./pages/Root";
import "./App.css";
import DashboardRootLayout from "./pages/DashboardRoot";
import TimesheetDetail from "./pages/TimesheetDetail";
import CreateTimesheetPage from "./pages/CreateTimesheet";
import MiscellaneousContextProvider from "./store/miscellaneous-context";
import TimesheetContextProvider from "./store/timesheet-context";
import ExpenseDetail from "./pages/ExpenseDetail";
import CreateExpensePage from "./pages/CreateExpense";
import LoginPage from "./pages/Login";
import Events from "./components/PortalComponents/Events/Events";
import PortalPage from "./pages/Portal";
import TimesheetPage from "./pages/Timesheet";
import ExpensenPage from "./pages/Expense";
import AuthContextProvider from "./store/auth-context";
import ExpenseContextProvider from "./store/expense-context";
import AdminRootLayout from "./pages/AdminRoot";
import AdminHomePage from "./components/PortalComponents/AdminPage/AdminHomePage";
import RegisterNewUser from "./components/PortalComponents/AdminPage/RegisterNewUser/RegisterNewUser";
import AdminContextProvider from "./store/admin-context";
import ManagerHomePage from "./components/PortalComponents/ManagerPage/ManagerHomePage";
import EventContextProvider from "./store/events-context";
import ProjectsManagement from "./components/PortalComponents/AdminPage/ProjectManagement/ProjectsManagament";
import UsersManagement from "./components/PortalComponents/AdminPage/UserManagement/UsersManagement";
import PasswordResetPage from "./pages/PasswordReset";
import ResetPasswordForm from "./components/Authentication/ResetPasswordForm";
import AuthCheck from "./components/Authentication/AuthCheck";
import UserContextProvider from "./store/user-context";
import ErrorPage from "./pages/Error";
import CategoryEntriesReport from "./components/PortalComponents/AdminPage/Reports/CategoryEntriesReport";
import EventConfiguration from "./components/PortalComponents/AdminPage/EventConfiguration/EventConfiguration";
import PropTypes from "prop-types";
import RoleGuard from "./components/Authentication/RoleGuard";

function LegacyTimesheetDetailRedirect() {
  const { timesheetId } = useParams();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get("adminMode") === "true";

  return (
    <Navigate
      replace
      to={`/employee-portal/dashboard/timesheets/details/${timesheetId}${
        adminMode ? "?adminMode=true" : ""
      }`}
    />
  );
}

function LegacyExpenseDetailRedirect() {
  const { expenseId } = useParams();
  const [searchParams] = useSearchParams();
  const adminMode = searchParams.get("adminMode") === "true";

  return (
    <Navigate
      replace
      to={`/employee-portal/dashboard/expenses/details/${expenseId}${
        adminMode ? "?adminMode=true" : ""
      }`}
    />
  );
}

function LegacyAdminEventRedirect({ tab }) {
  return (
    <Navigate
      replace
      to={`/employee-portal/dashboard/admin/event-configuration?tab=${tab}`}
    />
  );
}

LegacyAdminEventRedirect.propTypes = {
  tab: PropTypes.string.isRequired,
};

const router = createBrowserRouter([
  {
    path: "/employee-portal",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "reset-password-request", element: <PasswordResetPage /> },
      { path: "reset-password/:token", element: <ResetPasswordForm /> },
      {
        path: "dashboard",
        element: (
          <AuthCheck>
            <DashboardRootLayout />
          </AuthCheck>
        ),
        children: [
          { index: true, element: <PortalPage /> },
          { path: "timesheets", element: <TimesheetPage /> },
          {
            path: "timesheets/:timesheetId",
            element: <LegacyTimesheetDetailRedirect />,
          },
          {
            path: "timesheets/details/:timesheetId",
            element: <TimesheetDetail />,
          },
          {
            path: "timesheets/create-timesheet",
            element: <CreateTimesheetPage />,
          },
          { path: "expenses", element: <ExpensenPage /> },
          {
            path: "expenses/:expenseId",
            element: <LegacyExpenseDetailRedirect />,
          },
          {
            path: "expenses/details/:expenseId",
            element: <ExpenseDetail />,
          },
          {
            path: "expenses/create-expense",
            element: <CreateExpensePage />,
          },
          { path: "events", element: <Events /> },
          {
            path: "admin",
            element: (
              <RoleGuard allowedRoles={[3]}>
                <AdminRootLayout />
              </RoleGuard>
            ),
            children: [
              { index: true, element: <AdminHomePage /> },
              { path: "register-user", element: <RegisterNewUser /> },
              {
                path: "user-management",
                element: <UsersManagement />,
              },
              {
                path: "project-management",
                element: <ProjectsManagement />,
              },
              { path: "reports", element: <CategoryEntriesReport /> },
              {
                path: "event-configuration",
                element: <EventConfiguration />,
              },
              {
                path: "event-types",
                element: <LegacyAdminEventRedirect tab="types" />,
              },
              {
                path: "event-reports",
                element: <LegacyAdminEventRedirect tab="reports" />,
              },
            ],
          },
          {
            path: "manager",
            element: (
              <RoleGuard allowedRoles={[2, 3]}>
                <ManagerHomePage />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
]);

function App() {
  return (
    <UserContextProvider>
      <AuthContextProvider>
        <AdminContextProvider>
          <MiscellaneousContextProvider>
            <TimesheetContextProvider>
              <ExpenseContextProvider>
                <EventContextProvider>
                  <RouterProvider router={router} />
                </EventContextProvider>
              </ExpenseContextProvider>
            </TimesheetContextProvider>
          </MiscellaneousContextProvider>
        </AdminContextProvider>
      </AuthContextProvider>
    </UserContextProvider>
  );
}

export default App;
