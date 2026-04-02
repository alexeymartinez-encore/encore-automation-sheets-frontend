import { useContext } from "react";
import SideNavCard from "./SideNavigationComponents/SideNavCard";
import SideNavComponent from "./SideNavigationComponents/SideNavComponent";
import { HiChevronLeft } from "react-icons/hi2";
import { AuthContext } from "../../../store/auth-context";

export default function SideNavigation({ isExpanded, setIsExpanded }) {
  const toggleMenu = () => setIsExpanded((prev) => !prev);
  const authCtx = useContext(AuthContext);

  const logoutHandler = async () => {
    await authCtx.logout();
  };

  return (
    <div
      className={`hidden md:block z-50 ${
        isExpanded ? "fixed md:relative" : "fixed md:relative"
      } top-0 left-0 h-full relative`}
    >
      <SideNavCard isExpanded={isExpanded}>
        <div className="self-stretch">
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "px-4 py-3" : "px-1 py-3"
            }`}
          >
            <div className={isExpanded ? "w-[8rem] mx-auto" : "w-10 mx-auto"}>
              <p
                className={`text-[0.55rem] uppercase tracking-[0.18em] text-gray-400 transition-all duration-300 ${
                  isExpanded
                    ? "max-h-4 opacity-100 translate-y-0 text-left"
                    : "max-h-0 opacity-0 -translate-y-1 text-center"
                }`}
              >
                Navigation
              </p>
              <p
                className={`text-base font-semibold text-blue-600 leading-tight transition-all duration-300 ${
                  isExpanded
                    ? "max-h-8 opacity-100 translate-y-0 text-left"
                    : "max-h-0 opacity-0 -translate-y-1 text-center"
                }`}
              >
                Encore Portal
              </p>
            </div>
            <p
              className={`text-[0.65rem] font-semibold text-blue-600 text-center transition-all duration-300 ${
                isExpanded
                  ? "max-h-0 opacity-0 translate-y-1"
                  : "max-h-4 opacity-100 translate-y-0"
              }`}
            >
              EP
            </p>
          </div>

          <div className={isExpanded ? "px-4" : "px-1"}>
            <div className={isExpanded ? "w-[8rem] mx-auto" : "w-10 mx-auto"}>
              <div className="border-b border-gray-200" />
            </div>
          </div>
        </div>

        <SideNavComponent
          onClick={logoutHandler}
          isExpanded={isExpanded}
          padding={isExpanded ? "p-4" : "p-1"}
        />
      </SideNavCard>

      <button
        type="button"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggleMenu}
        className="absolute top-0 right-0 translate-x-full z-20 h-7 w-7 rounded-r-md rounded-l-none bg-white text-gray-400 border border-gray-200 border-l-0 hover:text-gray-600 transition-colors flex items-center justify-center"
      >
        <HiChevronLeft
          className={`h-4 w-4 transition-transform duration-300 ${
            isExpanded ? "rotate-0" : "rotate-180"
          }`}
        />
      </button>
    </div>
  );
}
