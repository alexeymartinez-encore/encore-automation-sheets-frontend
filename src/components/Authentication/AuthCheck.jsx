import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCheck({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL || "";
  useEffect(() => {
    fetch(`${BASE_URL}/auth/verify`, {
      method: "GET",
      credentials: "include", // Send the httpOnly cookie!
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          navigate("/employee-portal");
        }
      })
      .catch(() => {
        navigate("/employee-portal");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="flex items-center justify-center mt-40">Loading...</p>; // Or a nice spinner
  }

  return authenticated ? children : null;
}
