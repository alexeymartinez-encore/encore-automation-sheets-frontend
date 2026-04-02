import { useContext, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { getNavLinks } from "./navConfig";
import { AuthContext } from "../../../store/auth-context";

function sectionizeLinks(links) {
  return links.reduce((acc, link) => {
    const section = link.section || "Navigation";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(link);
    return acc;
  }, {});
}

export default function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const authCtx = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const roleId = authCtx.roleId ? String(authCtx.roleId) : "1";

  const navLinks = useMemo(() => getNavLinks(roleId), [roleId]);
  const linksBySection = useMemo(() => sectionizeLinks(navLinks), [navLinks]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const logoutHandler = async () => {
    await authCtx.logout({ redirect: false });
    setIsOpen(false);
    navigate("/employee-portal");
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed top-3 left-3 z-[70] inline-flex items-center justify-center h-11 w-11 rounded-md bg-white border border-gray-200 shadow-md text-blue-600 hover:bg-blue-50 transition-colors ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <HiBars3 className="h-6 w-6" />
      </button>

      <div
        onClick={() => setIsOpen(false)}
        className={`md:hidden fixed inset-0 z-[65] bg-black/45 transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`md:hidden fixed top-0 left-0 z-[66] h-full w-[18rem] max-w-[85vw] bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-gray-400">
                Navigation
              </p>
              <p className="text-base font-semibold text-blue-600">Encore Portal</p>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <HiXMark className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3">
            {Object.entries(linksBySection).map(([section, links]) => (
              <div key={section} className="mb-4">
                <p className="px-2 pb-2 text-[0.65rem] uppercase tracking-[0.18em] text-gray-400">
                  {section}
                </p>
                <div className="space-y-1">
                  {links.map((link) => (
                    <NavLink
                      key={link.id}
                      to={link.path}
                      end={link.path === "/employee-portal/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-blue-500 text-white"
                          : "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      }
                    >
                      <FontAwesomeIcon icon={link.icon} className="h-4 w-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="px-3 py-3 border-t border-gray-200">
            <button
              type="button"
              onClick={logoutHandler}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
