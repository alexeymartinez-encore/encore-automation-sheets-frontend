import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function NavIcon({ children, icon, link, isExpanded }) {
  return (
    <NavLink
      className={({ isActive }) => {
        const stateClasses = isActive
          ? "text-white bg-blue-500"
          : "bg-white text-blue-500 hover:bg-blue-500 hover:text-white";

        return `rounded-sm flex items-center py-2 transition-all duration-300 ${
          isExpanded ? "w-[8rem] justify-start px-2" : "w-10 justify-center px-2"
        } ${stateClasses}`;
      }}
      to={link}
      end
    >
      <FontAwesomeIcon className="h-4 w-4 shrink-0" icon={icon} />
      <span
        className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-300 ${
          isExpanded ? "max-w-[120px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
        }`}
      >
        {children}
      </span>
    </NavLink>
  );
}
