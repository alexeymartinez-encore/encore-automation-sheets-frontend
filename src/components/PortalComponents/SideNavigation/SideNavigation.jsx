import { useNavigate } from "react-router-dom";
import SideNavCard from "./SideNavigationComponents/SideNavCard";
import UserIcon from "./SideNavigationComponents/UserIcon";
import SideNavComponent from "./SideNavigationComponents/SideNavComponent";

export default function SideNavigation({ isExpanded, setIsExpanded }) {
  const toggleMenu = () => setIsExpanded((prev) => !prev);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL || "";

  const logoutHandler = async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include", // Important to send the cookie
    });

    // Optionally clear any other data you stored in localStorage
    navigate("/employee-portal");

    localStorage.clear();
  };

  return (
    <div
      className={`z-50 ${
        isExpanded ? "fixed md:relative" : "fixed md:relative"
      } top-0 left-0 h-full`}
    >
      <SideNavCard isExpanded={isExpanded}>
        <UserIcon isExpanded={isExpanded} onClick={toggleMenu} />
        <SideNavComponent
          onClick={logoutHandler}
          isExpanded={isExpanded}
          padding={isExpanded ? "p-4" : "p-1"}
        />
      </SideNavCard>
    </div>
  );
}
