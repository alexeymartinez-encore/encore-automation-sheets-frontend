import PropTypes from "prop-types";
import { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../store/auth-context";

export default function AuthCheck({ children }) {
  const authCtx = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!authCtx.isLoading && authCtx.isAuthenticated) {
      authCtx.verifySession();
    }
  }, [
    location.pathname,
    authCtx.isLoading,
    authCtx.isAuthenticated,
    authCtx.verifySession,
  ]);

  if (authCtx.isLoading) {
    return <p className="flex items-center justify-center mt-40">Loading...</p>;
  }

  if (!authCtx.isAuthenticated) {
    return (
      <Navigate
        to="/employee-portal"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

AuthCheck.propTypes = {
  children: PropTypes.node.isRequired,
};
