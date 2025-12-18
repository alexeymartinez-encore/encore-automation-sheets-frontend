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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg">
      <div className="">
        <SideNavCard isExpanded={isExpanded}>
          <SideNavComponent
            onClick={logoutHandler}
            isExpanded={false}
            padding="py-2 px-3"
          />
        </SideNavCard>
      </div>
    </div>
  );
}
