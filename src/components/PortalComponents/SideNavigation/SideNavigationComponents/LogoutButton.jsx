import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function LogoutButton({ onClick, expanded }) {
  return (
    <div
      className={`${
        expanded ? "flex flex-row justify-start items-center w-[8rem] pl-2" : ""
      }`}
    >
      <button
        className=" text-red-600 py-1 px-3 rounded-md hover:text-red-400 transition duration-300"
        type="button"
        onClick={onClick}
      >
        <FontAwesomeIcon
          className={`${
            expanded ? "text-red-600" : " text-red-500 py-1 px-3 rounded-md"
          }`}
          icon={faRightFromBracket}
        />
        {expanded ? <span className="pl-2">Logout</span> : null}
      </button>
    </div>
  );
}

{
  /* <div className="">
<button
  className=" text-red-500 py-1 px-3 rounded-md"
  type="button"
  onClick={logoutHandler}
>
  <FontAwesomeIcon
    className="text-red-500 "
    icon={faRightFromBracket}
  />
</button>
</div> */
}
