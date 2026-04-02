import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function LogoutButton({ onClick, expanded }) {
  return (
    <div className={expanded ? "w-[8rem] mx-auto" : "w-10 mx-auto"}>
      <button
        className={`w-full text-red-600 py-1 px-2 rounded-md hover:text-red-400 transition-all duration-300 flex items-center ${
          expanded ? "justify-start" : "justify-center"
        }`}
        type="button"
        onClick={onClick}
      >
        <FontAwesomeIcon className="text-red-600 h-4 w-4 shrink-0" icon={faRightFromBracket} />
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            expanded ? "max-w-[90px] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"
          }`}
        >
          Logout
        </span>
      </button>
    </div>
  );
}
