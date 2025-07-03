import { useContext } from "react";
import { UserContext } from "../../../store/user-context.jsx";

export default function WelcomeHeader() {
  const first_name = localStorage.getItem("first_name");
  const last_name = localStorage.getItem("last_name");

  // Check if userCtx.user exists before accessing properties
  if (!first_name || !last_name) {
    return <p>Loading user data...</p>; // Display loading state while waiting for user data
  }

  return (
    <div className="p-5 bg-white rounded-md shadow-md">
      <p className="font-thin">Welcome Back!</p>
      <h1 className="text-3xl">
        {first_name} {last_name}
      </h1>
    </div>
  );
}
