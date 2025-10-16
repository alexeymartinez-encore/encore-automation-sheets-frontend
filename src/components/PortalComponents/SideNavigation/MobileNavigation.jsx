import { useNavigate } from "react-router-dom";
import SideNavCard from "./MobileNavigation/SideNavCard";
import UserIcon from "./MobileNavigation/UserIcon";
import SideNavComponent from "./MobileNavigation/SideNavComponent";

export default function MobileNavigation({ isExpanded, setIsExpanded }) {
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
      className={`flex md:hidden w-full justify-center items-center bg-white py-2`}
    >
      <SideNavCard isExpanded={isExpanded}>
        {/* <UserIcon isExpanded={isExpanded} onClick={toggleMenu} /> */}
        <SideNavComponent
          onClick={logoutHandler}
          isExpanded={isExpanded}
          padding={isExpanded ? "p-4" : "p-1"}
        />
      </SideNavCard>
    </div>
  );
}
