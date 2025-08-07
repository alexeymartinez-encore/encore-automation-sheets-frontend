import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TimesheetContext } from "../../store/timesheet-context";
import { MiscellaneousContext } from "../../store/miscellaneous-context";
import AuthForm from "./FormComponents/AuthForm";
import FormInput from "./FormComponents/FormInput";
import FormLink from "./FormComponents/FormLink";
import ButtonUI from "../UI/ButtonUI";
import StatusUI from "../UI/StatusUI";
import { AuthContext } from "../../store/auth-context";
import { ExpensesContext } from "../../store/expense-context";

export default function LoginForm() {
  const authCtx = useContext(AuthContext);
  const timesheetCtx = useContext(TimesheetContext); // Access TimesheetContext to fetch timesheets
  const miscCtx = useContext(MiscellaneousContext);
  const expenseCtx = useContext(ExpensesContext);
  const [credentials, setCredentials] = useState({
    user_name: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function credentialChangeHandler(inputIdentifier, event) {
    setCredentials((currentInputValues) => {
      return { ...currentInputValues, [inputIdentifier]: event.target.value };
    });
  }

  async function loginHandler(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await authCtx.login(credentials); // Call login from UserContext
    // console.log(res, "RESPONSE ");
    if (res) {
      timesheetCtx.triggerUpdate(); // Refetch timesheets after login
      miscCtx.triggerUpdate();
      expenseCtx.triggerUpdate();
      navigate("/employee-portal/dashboard");
    } else {
      setLoading(false);
      setError("Login failed");
    }
  }

  return (
    <AuthForm onSubmit={loginHandler}>
      {error && <StatusUI status={"error"}>{error}</StatusUI>}
      <FormInput
        type="text"
        placeholder="User Name"
        value={credentials.user_name}
        onChange={credentialChangeHandler.bind(this, "user_name")}
      />
      <FormInput
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={credentialChangeHandler.bind(this, "password")}
      />
      {/* <FormLink to="/employee-portal/reset-password-request">
        Forgot Password?
      </FormLink> */}
      <ButtonUI type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </ButtonUI>
      {/* <FormLink to="/employee-portal/signup" text={"Don't have an account? "}>
        Sign Up
      </FormLink> */}
    </AuthForm>
  );
}
