import { useEffect, useState } from "react";
import AuthForm from "./FormComponents/AuthForm";
import StatusUI from "../UI/StatusUI";
import FormInput from "./FormComponents/FormInput";
import ButtonUI from "../UI/ButtonUI";
import FormLink from "./FormComponents/FormLink";
import InputCard from "./FormComponents/InputCard";
import { UserContext } from "../../store/user-context";
import { useContext } from "react";
import { AuthContext } from "../../store/auth-context";

const initialCredentials = {
  email: "",
  create_password: "",
  confirm_password: "",
  first_name: "",
  last_name: "",
  employee_number: "",
  position: "",
  cell_phone: "",
  home_phone: "",
  role_id: "",
  manager_id: "",
};

export default function SignupForm({ mode }) {
  const authCtx = useContext(AuthContext);
  const userCtx = useContext(UserContext);

  // const navigate = useNavigate();
  const [credentials, setCredentials] = useState(initialCredentials);
  const [success, setSucess] = useState({
    state: false,
    message: "",
  });
  const [employees, setEmployees] = useState([]);

  const [error, setError] = useState({
    state: false,
    message: "",
  });
  useEffect(() => {
    console.log("Calling getAllEmployees...");
    async function fetchAllEmployees() {
      const users = await userCtx.getAllEmployees();
      console.log("Fetched employees:", users);
      setEmployees(users);
    }
    fetchAllEmployees();
  }, []);

  console.log("CREDS: ", credentials);

  function inputChangeHandler(inputIdentifier, event) {
    setCredentials((currentInputValues) => {
      return {
        ...currentInputValues,
        [inputIdentifier]: event.target.value,
      };
    });
  }

  async function handleSignUp(event) {
    setSucess({
      state: false,
      message: "",
    });

    event.preventDefault();
    setError({
      state: false,
      message: "",
    });

    if (credentials.password < 6) {
      setError({
        state: true,
        message: "Password must be at least 6 characters long",
      });
      return;
    }
    if (credentials.password !== credentials.confirmed_password) {
      setError({
        state: true,
        message: "Password does not match",
      });
      return;
    }

    try {
      const data = await authCtx.signup(credentials);
      console.log(data, "HEREEE");
      // redirect here
      if (data.status === 201) {
        setSucess({
          state: true,
          message: "Signed up sucessfully! You can now login at any time",
        });
      }
    } catch (error) {
      // Cath Any Network Errors or other issues
      console.error("Error during signup: ", error);
      setError({
        state: true,
        message: "Something went wrong. Please try again.",
      });
    }

    setCredentials(initialCredentials);

    console.log("Submitted");
  }

  return (
    <AuthForm onSubmit={handleSignUp}>
      {success && <StatusUI status={"success"}>{success.message}</StatusUI>}
      {error.state && <StatusUI status={"error"}>{error.message}</StatusUI>}
      <InputCard>
        <FormInput
          type="text"
          placeholder="First Name"
          value={credentials.first_name}
          onChange={inputChangeHandler.bind(this, "first_name")}
        />
        <FormInput
          type="text"
          placeholder="Last Name"
          value={credentials.last_name}
          onChange={inputChangeHandler.bind(this, "last_name")}
        />
      </InputCard>
      <InputCard>
        <FormInput
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={inputChangeHandler.bind(this, "email")}
        />
        <FormInput
          type="text"
          placeholder="Employee position"
          value={credentials.position}
          onChange={inputChangeHandler.bind(this, "position")}
        />
      </InputCard>
      <InputCard>
        <FormInput
          type="tel"
          placeholder="Cell Phone"
          value={credentials.cell_phone}
          onChange={inputChangeHandler.bind(this, "cell_phone")}
        />
        <FormInput
          type="tel"
          placeholder="Home Phone"
          value={credentials.home_phone}
          onChange={inputChangeHandler.bind(this, "home_phone")}
        />
      </InputCard>
      <InputCard>
        <FormInput
          type="password"
          placeholder="Create password"
          value={credentials.create_password}
          onChange={inputChangeHandler.bind(this, "create_password")}
        />
        <FormInput
          type="password"
          placeholder="Confirm password"
          value={credentials.confirm_password}
          onChange={inputChangeHandler.bind(this, "confirm_password")}
        />
      </InputCard>
      <InputCard>
        <FormInput
          type="text"
          placeholder="Employee Number"
          value={credentials.employee_number}
          onChange={inputChangeHandler.bind(this, "employee_number")}
        />
        <FormInput
          type="text"
          placeholder="Role ID"
          value={credentials.role_id}
          onChange={inputChangeHandler.bind(this, "role_id")}
        />
      </InputCard>
      <div className="text-center">
        <label>Reports to:</label>
        <select
          value={credentials.manager_id}
          className="w-full text-center py-2 border rounded-md"
          onChange={inputChangeHandler.bind(this, "manager_id")}
        >
          <option value="Nothing">Nothing</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.first_name} {employee.last_name}
            </option>
          ))}
        </select>
      </div>
      <ButtonUI type="submit">Signup</ButtonUI>
      {mode === "adminMode" ? null : (
        <FormLink to="/employee-portal" text={"Already have an account? "}>
          Login
        </FormLink>
      )}
    </AuthForm>
  );
}
