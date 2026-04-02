import { useContext } from "react";
import { AuthContext } from "../../../store/auth-context.jsx";

export default function WelcomeHeader() {
  const { user } = useContext(AuthContext);
  const first_name = user?.first_name;
  const last_name = user?.last_name;
  const position = user?.position;

  if (!first_name || !last_name) {
    return <p>Loading user data...</p>;
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
