import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../../store/auth-context";

export default function SessionTimeoutWarning() {
  const authCtx = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const loggingOutRef = useRef(false);

  const idleExpiresAt = useMemo(
    () => Number(authCtx.session?.idle_expires_at || 0),
    [authCtx.session]
  );
  const warningStartsAt = useMemo(
    () => Number(authCtx.session?.warning_starts_at || 0),
    [authCtx.session]
  );

  useEffect(() => {
    if (!authCtx.isAuthenticated || !idleExpiresAt || !warningStartsAt) {
      setIsVisible(false);
      setRemainingSeconds(0);
      loggingOutRef.current = false;
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const remainingMs = idleExpiresAt - now;

      if (remainingMs <= 0) {
        setIsVisible(false);
        setRemainingSeconds(0);

        if (!loggingOutRef.current) {
          loggingOutRef.current = true;
          authCtx.logout();
        }
        return;
      }

      if (now >= warningStartsAt) {
        setIsVisible(true);
        setRemainingSeconds(Math.ceil(remainingMs / 1000));
      } else {
        setIsVisible(false);
        setRemainingSeconds(0);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authCtx, idleExpiresAt, warningStartsAt]);

  async function staySignedInHandler() {
    const refreshed = await authCtx.refreshSession();
    if (refreshed) {
      setIsVisible(false);
      setRemainingSeconds(0);
      loggingOutRef.current = false;
    }
  }

  async function logoutNowHandler() {
    loggingOutRef.current = true;
    await authCtx.logout();
  }

  if (!isVisible) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-[90] bg-black/45 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Session expiring</h3>
        <p className="mt-2 text-sm text-gray-700">
          You are about to be signed out due to inactivity.
        </p>
        <p className="mt-2 text-2xl font-bold text-red-600 tracking-wide">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={logoutNowHandler}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Log out now
          </button>
          <button
            type="button"
            onClick={staySignedInHandler}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
