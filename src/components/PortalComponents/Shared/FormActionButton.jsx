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
      className={`flex justify-center gap-2 items-center w-full py-2  rounded-md duration-500 ${style} ${
        isSaving ? "opacity-50 cursor-not-allowed" : ""
      } text-sm md:text-lg px-1 md:px-3`}
      disabled={disabled || isSaving}
    >
      <FontAwesomeIcon
        className="text-white md:pl-4 hidden md:block"
        icon={icon}
      />
      <span className="text-white md:px-4">{text}</span>
    </button>
  );
}
