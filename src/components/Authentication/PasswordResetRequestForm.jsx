import { useState } from "react";
import FormInput from "./FormComponents/FormInput";
import ButtonUI from "../UI/ButtonUI";
import AuthForm from "./FormComponents/AuthForm";
import { Link } from "react-router-dom";

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({
    statusOk: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";
  async function submitHandler(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (!res.ok) {
        setStatus({
          statusOk: "fail",
          message: data.message || "Something went wrong.",
        });

        throw new Error("Something is wrong");
      }

      const data = await res.json();

      setStatus({
        statusOk: "success",
        message: data.message,
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthForm onSubmit={submitHandler}>
      <FormInput
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-center"
      />

      <ButtonUI type="submit" disabled={loading}>
        {loading ? "Submitting Request..." : "Send Reset Link"}
      </ButtonUI>
      <Link className="text-blue-600 text-sm" to="/employee-portal/login">
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
