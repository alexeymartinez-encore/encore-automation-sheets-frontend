import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NavIcon({ children, icon, link, isExpanded }) {
  return (
    <NavLink
      className={({ isActive }) =>
        isExpanded
          ? isActive
            ? "text-white bg-blue-500 w-[8rem] pl-2 py-2 rounded-sm flex items-center justify-start"
            : "bg-white text-blue-500 w-[8rem] pl-2 py-2 rounded-sm flex items-center hover:bg-blue-500 hover:text-white transition duration-300 justify-start"
          : isActive
          ? "text-blue-600 flex-1 flex flex-col items-center justify-center gap-1 text-xs"
          : "text-blue-500 flex-1 flex flex-col items-center justify-center gap-1 text-xs hover:text-blue-600 transition duration-200"
      }
      to={link}
      end
    >
      <FontAwesomeIcon
        className={`h-4 ${isExpanded ? "mr-2" : ""}`}
        icon={icon}
      />
      {!isExpanded && <span className="leading-tight">{children}</span>}
      {isExpanded && children}
    </NavLink>
  );
}
