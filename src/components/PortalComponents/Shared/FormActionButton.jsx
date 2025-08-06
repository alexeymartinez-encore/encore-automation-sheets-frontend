import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function FormActionButton({
  icon,
  onClick,
  signed,
  text,
  disabled,
}) {
  let style = `${
    signed
      ? ` ${disabled ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-400"}`
      : "bg-red-600 hover:bg-red-400"
  }  rounded-md  duration-500`;

  if (signed === null || signed === undefined) {
    style = ` ${
      disabled ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-400"
    } rounded-md  duration-500`;
  }

  return (
    <button
      onClick={onClick}
      className={`py-1 ${style} ${
        disabled
          ? "bg-blue-300 hover:bg-blue-300"
          : "bg-blue-500 hover:bg-blue-400"
      }`}
      disabled={disabled}
    >
      <FontAwesomeIcon className={"text-white pl-4"} icon={icon} />
      <span className="text-white px-4">{text}</span>
    </button>
  );
}
