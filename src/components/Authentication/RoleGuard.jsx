import PropTypes from "prop-types";
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../store/auth-context";

export default function RoleGuard({
  allowedRoles,
  fallbackPath = "/employee-portal/dashboard",
  children,
}) {
  const location = useLocation();
  const authCtx = useContext(AuthContext);

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

  if (!allowedRoles.includes(Number(authCtx.roleId))) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

RoleGuard.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.number).isRequired,
  fallbackPath: PropTypes.string,
  children: PropTypes.node.isRequired,
};
