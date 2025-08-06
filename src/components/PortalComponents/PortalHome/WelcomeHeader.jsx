import { useContext } from "react";
import { UserContext } from "../../../store/user-context.jsx";

export default function WelcomeHeader() {
  const first_name = localStorage.getItem("first_name");
  const last_name = localStorage.getItem("last_name");
  const position = localStorage.getItem("position");

  // Check if userCtx.user exists before accessing properties
  if (!first_name || !last_name) {
    return <p>Loading user data...</p>; // Display loading state while waiting for user data
  }

  return (
    <div className="flex flex-col gap-1 p-5 bg-white rounded-md shadow-xs">
      <p className="font-normal text-xs text-blue-500">Welcome Back!</p>
      <h1 className="text-3xl">
        {first_name} {last_name}
      </h1>
      <p className="opacity-60">{position}</p>
    </div>
  );
}
