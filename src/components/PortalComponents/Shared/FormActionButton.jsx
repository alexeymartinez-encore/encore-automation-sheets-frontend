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
      className={`py-1 rounded-md duration-500 ${style} ${
        isSaving ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || isSaving}
    >
      <FontAwesomeIcon className="text-white pl-4" icon={icon} />
      <span className="text-white px-4">{text}</span>
    </button>
  );
}
