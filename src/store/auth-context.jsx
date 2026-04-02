import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  installApiClient,
  setUnauthorizedHandler,
} from "../util/apiClient";
import {
  clearSessionSnapshot,
  setSessionSnapshot,
} from "./session-store";

// This provider is the source of truth for auth state.
export const AuthContext = createContext({
  user: null,
  roleId: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  signup: async () => null,
  logout: async () => false,
  refreshSession: async () => false,
  verifySession: async () => false,
});

export default function AuthContextProvider({ children }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSessionState = useCallback(() => {
    setUser(null);
    setSession(null);
    clearSessionSnapshot();
  }, []);

  const applySessionPayload = useCallback((payload = {}) => {
    const nextUser = payload.user || null;
    const nextSession = payload.session || null;
    setUser(nextUser);
    setSession(nextSession);
    setSessionSnapshot({
      user: nextUser,
      totalEmployees: payload.totalEmployees,
    });
  }, []);

  const handleUnauthorized = useCallback(() => {
    // Avoid hard reload loops on repeated 401 responses.
    // Protected routes already redirect through AuthCheck once auth state is cleared.
    clearSessionState();
  }, [clearSessionState]);

  useEffect(() => {
    installApiClient({
      baseUrl: BASE_URL,
      onUnauthorized: handleUnauthorized,
    });
    setUnauthorizedHandler(handleUnauthorized);
  }, [BASE_URL, handleUnauthorized]);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        clearSessionState();
        return false;
      }

      const data = await response.json();
      applySessionPayload(data);
      return true;
    } catch (error) {
      clearSessionState();
      return false;
    }
  }, [BASE_URL, applySessionPayload, clearSessionState]);

  const verifySession = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshSession();
          if (refreshed) {
            return true;
          }
        }
        clearSessionState();
        return false;
      }

      const data = await response.json();
      applySessionPayload(data);
      return true;
    } catch (error) {
      clearSessionState();
      return false;
    }
  }, [BASE_URL, applySessionPayload, clearSessionState, refreshSession]);

  const login = useCallback(
    async (credentials) => {
      if (!credentials) {
        throw new Error("Credentials are required.");
      }

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: credentials.user_name,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        clearSessionState();
        return false;
      }

      const data = await response.json();
      applySessionPayload(data);
      return true;
    },
    [BASE_URL, applySessionPayload, clearSessionState]
  );

  const signup = useCallback(
    async (credentials) => {
      if (!credentials) {
        throw new Error("Credentials are required.");
      }

      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.create_password,
          confirmed_password: credentials.confirm_password,
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          employee_number: +credentials.employee_number,
          position: credentials.position,
          cell_phone: credentials.cell_phone,
          home_phone: credentials.home_phone,
          role_id: credentials.role_id,
          manager_id: credentials.manager_id,
          is_contractor:
            String(credentials.is_contractor).toLowerCase() === "true",
          is_active: String(credentials.is_active).toLowerCase() === "true",
          allow_overtime:
            String(credentials.allow_overtime).toLowerCase() === "true",
        }),
      });

      const data = await response.json();
      return data;
    },
    [BASE_URL]
  );

  const logout = useCallback(
    async (options = {}) => {
      try {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        // Logout still clears local state and redirects.
      }

      clearSessionState();

      if (options.redirect !== false && typeof window !== "undefined") {
        window.location.assign("/employee-portal");
      }

      return true;
    },
    [BASE_URL, clearSessionState]
  );

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      await verifySession();
      if (mounted) {
        setIsLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [verifySession]);

  const contextValue = useMemo(() => {
    const roleId = user ? Number(user.role_id) : null;

    return {
      user,
      roleId,
      session,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      signup,
      logout,
      refreshSession,
      verifySession,
    };
  }, [
    user,
    session,
    isLoading,
    login,
    signup,
    logout,
    refreshSession,
    verifySession,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
