import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import FormInput from "./FormComponents/FormInput";
import ButtonUI from "../UI/ButtonUI";
import AuthForm from "./FormComponents/AuthForm";

export default function ResetPasswordForm() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({
    statusOk: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";
  async function submitHandler(e) {
    e.preventDefault();
    setLoading(true);
    console.log(token);
    console.log(password);

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        setStatus({
          statusOk: "fail",
          message: data.message,
        });
        throw new Error("Something is wrong");
      }

      const data = await res.json();

      setStatus({
        statusOk: "success",
        message: data.message,
      });
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthForm onSubmit={submitHandler}>
      <FormInput
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <ButtonUI type="submit">
        {loading ? "Resetting..." : "Reset Password"}
      </ButtonUI>
      <Link className="text-blue-600 text-sm" to="/employee-portal/">
        Back to Login Page
      </Link>
      {status.statusOk === "success" ? (
        <p className="text-green-600">{status.message}</p>
      ) : (
        <p className="text-red-600">{status.message}</p>
      )}
    </AuthForm>
  );
}
