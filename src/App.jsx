import { RouterProvider, createBrowserRouter } from "react-router-dom";
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
import SignupPage from "./pages/Signup";
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
import { checkIfAdmin, checkIfManager } from "./util/loaders";

const router = createBrowserRouter([
  {
    path: "/employee-portal",
    element: <RootLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
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
          { path: "timesheets/:timesheetId", element: <TimesheetDetail /> },
          {
            path: "timesheets/create-timesheet",
            element: <CreateTimesheetPage />,
          },
          { path: "expenses", element: <ExpensenPage /> },
          { path: "expenses/:expenseId", element: <ExpenseDetail /> },
          {
            path: "expenses/create-expense",
            element: <CreateExpensePage />,
          },
          { path: "events", element: <Events /> },
          {
            path: "admin",
            element: <AdminRootLayout />,
            loader: checkIfAdmin,
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
            ],
          },
          {
            path: "manager",
            element: <ManagerHomePage />,
            loader: checkIfManager,
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
