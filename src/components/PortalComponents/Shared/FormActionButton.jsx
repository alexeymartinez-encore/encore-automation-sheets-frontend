import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function FormActionButton({
  icon,
  onClick,
  signed,
  text,
  disabled,
  isSaving,
}) {
  let style;

  if (signed === true) {
    style = disabled ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-400";
  } else if (signed === false) {
    style = disabled ? "bg-red-300" : "bg-red-600 hover:bg-red-400";
  } else {
    // null/undefined case
    style = disabled ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-400";
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex justify-center gap-2 items-center w-full sm:w-auto sm:min-w-[6.5rem] h-10 rounded-md duration-300 ${style} ${
        isSaving ? "opacity-50 cursor-not-allowed" : ""
      } text-xs sm:text-sm px-3`}
      disabled={disabled || isSaving}
    >
      <FontAwesomeIcon className="text-white hidden sm:block" icon={icon} />
      <span className="text-white">{text}</span>
    </button>
  );
}
